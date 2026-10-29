import { Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest } from '../middleware/auth';
import { OlympiadAnalysisResult } from '../types/olympiad';
import {
  verifyProofWithGemini,
  isGeminiConfigured,
  isOfflineDemoAllowed,
  EngineUnavailableError,
} from '../services/gemini';
import { verifyProofWithLora, isLoraConfigured } from '../services/lora';
import {
  canRead,
  formatRelativeDate,
  newId,
  rowToResult,
  saveAnalysis,
} from '../services/analysisStore';
import { releaseQuota, reserveQuota, sendReservationError } from '../services/quota';

export const MAX_PROOF_CHARS = 20000;
export const MAX_ENUNT_CHARS = 5000;
export const MAX_TITLE_CHARS = 200;
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

export interface GradeInput {
  proofText?: string;
  problemTitle?: string;
  enunt?: string;
  fixedCondition?: boolean;
  imageBase64?: string;
  mimeType?: string;
}

/** Runs the fine-tuned LoRA model when available, otherwise Gemini. */
export async function gradeProof(
  input: GradeInput,
  analysisId: string
): Promise<{ result: OlympiadAnalysisResult; engine: string }> {
  if (isLoraConfigured() && input.proofText && !input.imageBase64) {
    const loraRes = await verifyProofWithLora(input, analysisId);
    if (loraRes) return loraRes;
    console.warn('[gradeProof] LoRA unavailable, falling back to Gemini...');
  }
  return verifyProofWithGemini(input, analysisId);
}

export interface RequestProblem {
  status: number;
  error: string;
}

/** Decoded size in bytes of a base64 payload (any data: prefix is ignored). */
function base64Bytes(value: string): number {
  const data = value.replace(/^data:[^;,]*;base64,/, '');
  return Math.floor((data.length * 3) / 4);
}

/**
 * Validates the fields shared by all routes that accept a proof or a photo.
 * Every field present must be a string; returns the problem to answer with, or null.
 */
export function validateAuditFields(body: any): RequestProblem | null {
  const fields = ['proofText', 'problemTitle', 'enunt', 'imageBase64', 'mimeType'];
  for (const name of fields) {
    if (body?.[name] !== undefined && body[name] !== null && typeof body[name] !== 'string') {
      return { status: 400, error: 'Cerere invalidă.' };
    }
  }
  if (typeof body?.proofText === 'string' && body.proofText.length > MAX_PROOF_CHARS) {
    return { status: 400, error: `Demonstrația depășește ${MAX_PROOF_CHARS} de caractere. Împarte-o în părți mai mici.` };
  }
  if (typeof body?.enunt === 'string' && body.enunt.length > MAX_ENUNT_CHARS) {
    return { status: 400, error: `Enunțul depășește ${MAX_ENUNT_CHARS} de caractere.` };
  }
  if (typeof body?.problemTitle === 'string' && body.problemTitle.length > MAX_TITLE_CHARS) {
    return { status: 400, error: `Titlul depășește ${MAX_TITLE_CHARS} de caractere.` };
  }
  if (body?.mimeType && !ALLOWED_MIME_TYPES.includes(body.mimeType)) {
    return { status: 400, error: 'Formatul imaginii nu este acceptat. Folosește JPEG, PNG sau WebP.' };
  }
  if (typeof body?.imageBase64 === 'string' && base64Bytes(body.imageBase64) > MAX_IMAGE_BYTES) {
    return { status: 413, error: 'Fotografia este prea mare (maxim 8 MB). Încearcă o poză cu rezoluție mai mică.' };
  }
  return null;
}

/** Validates an audit request; returns the problem to answer with, or null. */
export function validateAuditRequest(body: any): RequestProblem | null {
  const invalid = validateAuditFields(body);
  if (invalid) return invalid;

  const hasText = typeof body?.proofText === 'string' && body.proofText.trim().length > 0;
  const hasImage = typeof body?.imageBase64 === 'string' && body.imageBase64.length > 0;
  if (!hasText && !hasImage) {
    return { status: 400, error: 'Trimite textul demonstrației sau o fotografie a ei.' };
  }
  return null;
}

export function sendEngineError(res: Response, error: unknown, fallbackMessage: string): void {
  if (error instanceof EngineUnavailableError) {
    res.status(503).json({ error: error.message, code: 'ENGINE_UNAVAILABLE' });
    return;
  }
  console.error(error);
  res.status(500).json({ error: fallbackMessage });
}

// 1. History of the user's own analyses
export const getHistory = (req: AuthenticatedRequest, res: Response): void => {
  const rows = db.prepare(`
    SELECT id, problem_title as title, phase, score_percentage, onm_score, created_at
    FROM proof_analyses
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 50
  `).all(req.userId) as any[];

  res.json(rows.map((r) => ({
    id: r.id,
    title: r.title,
    date: formatRelativeDate(r.created_at),
    status: r.phase === 'sound' ? 'ok' : 'flaw',
    scorePercentage: r.score_percentage,
    onmScore: r.onm_score,
  })));
};

// 2. Single analysis (own or public example)
export const getProofById = (req: AuthenticatedRequest, res: Response): void => {
  const row = db.prepare('SELECT * FROM proof_analyses WHERE id = ?').get(req.params.id) as any;
  if (!row || !canRead(row, req.userId!)) {
    res.status(404).json({ error: 'Analiza cerută nu a fost găsită.' });
    return;
  }
  res.json(rowToResult(row));
};

// 3. Analyze (or re-analyze) a proof
export const analyzeProof = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const { id, proofText, problemTitle, enunt, imageBase64 } = req.body;
  const mimeType = req.body.mimeType || 'image/jpeg';

  const invalid = validateAuditRequest(req.body);
  if (invalid) {
    res.status(invalid.status).json({ error: invalid.error });
    return;
  }

  // Re-audits update the user's own analysis; anything else (including
  // re-auditing a public example) becomes a new analysis owned by the user.
  const owned = typeof id === 'string'
    ? db.prepare('SELECT id, problem_id, problem_title FROM proof_analyses WHERE id = ? AND user_id = ?')
        .get(id, userId) as { id: string; problem_id: string | null; problem_title: string | null } | undefined
    : undefined;
  const targetId = owned ? owned.id : newId('analysis');

  const reservation = reserveQuota(userId, Boolean(req.isGuest), 'analyze');
  if ('error' in reservation) {
    sendReservationError(res, reservation);
    return;
  }

  try {
    const { result, engine } = await gradeProof(
      {
        proofText,
        problemTitle,
        enunt,
        imageBase64,
        mimeType,
        fixedCondition: Boolean(req.body.fixedCondition),
      },
      targetId
    );

    // The offline dev grader never consumes quota
    if (engine === 'local-deterministic') releaseQuota(reservation.eventId);

    if (enunt) result.problemRo = enunt;
    // A re-audit keeps its link to the user's problem, whatever the model said
    if (owned?.problem_id) result.problemId = owned.problem_id;
    const title = (problemTitle || '').trim()
      || (owned?.problem_title || '').trim()
      || result.problemRo.slice(0, 60).trim()
      || 'Demonstrație fără titlu';

    saveAnalysis({ userId, result, problemTitle: title, proofText: proofText || null, engine });

    res.json({
      ...result,
      problemTitle: title,
      proofText: proofText || undefined,
      isExample: false,
      _meta: { engine, model: engine },
    });
  } catch (error) {
    if (error instanceof EngineUnavailableError) releaseQuota(reservation.eventId);
    sendEngineError(res, error, 'Eroare la procesarea demonstrației matematice.');
  }
};

// 4. Photo of a handwritten proof
export const scanProof = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (typeof req.body.imageBase64 !== 'string' || !req.body.imageBase64) {
    res.status(400).json({ error: 'Fotografia lipsește. Încearcă din nou.' });
    return;
  }
  await analyzeProof(req, res);
};

// 5. Engine status
export const getGeminiStatus = (req: AuthenticatedRequest, res: Response): void => {
  const gemini = isGeminiConfigured();
  res.json({
    configured: gemini || isLoraConfigured(),
    gemini,
    lora: isLoraConfigured(),
    offlineDemo: !gemini && !isLoraConfigured() && isOfflineDemoAllowed(),
    multimodalVision: gemini,
  });
};
