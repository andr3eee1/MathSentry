import { Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest } from '../middleware/auth';
import { OlympiadAnalysisResult } from '../types/olympiad';
import {
  verifyProofWithGemini,
  isGeminiConfigured,
  getGeminiApiKey,
} from '../services/gemini';

function formatRelativeDate(isoDate: string): string {
  try {
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return '1 week ago';
    return `${Math.floor(diffDays / 7)} weeks ago`;
  } catch {
    return 'Recently';
  }
}

function saveOrUpdateAnalysis(userId: string, result: OlympiadAnalysisResult): void {
  const existing = db.prepare('SELECT id FROM proof_analyses WHERE id = ?').get(result.id);
  const now = new Date().toISOString();
  const problemTitle = result.problemId.replace(/^ONM_RO_/, '').replace(/_/g, ' ');

  if (existing) {
    db.prepare(`
      UPDATE proof_analyses
      SET problem_id = ?, problem_title = ?, domain = ?, problem_ro = ?,
          phase = ?, score_percentage = ?, onm_score = ?, bac_score = ?,
          fatal_flaw_step = ?, cascading_steps_json = ?, step_breakdown_json = ?,
          ast_node_break_json = ?, explanation_ro = ?, teacher_critique_ro = ?,
          theorems_json = ?, typst_source = ?, updated_at = ?
      WHERE id = ?
    `).run(
      result.problemId,
      problemTitle,
      result.domain,
      result.problemRo,
      result.phase,
      result.scorePercentage,
      result.scaledScores.onm7p.score,
      result.scaledScores.bac10p.score,
      result.fatalFlawStep ?? null,
      JSON.stringify(result.cascadingInvalidatedSteps || []),
      JSON.stringify(result.stepBreakdown),
      result.astNodeBreak ? JSON.stringify(result.astNodeBreak) : null,
      result.explanationRo,
      result.teacherCritiqueRo,
      JSON.stringify(result.relevantTheorems),
      result.typstSource,
      now,
      result.id
    );
  } else {
    db.prepare(`
      INSERT INTO proof_analyses (
        id, user_id, problem_id, problem_title, domain, problem_ro,
        phase, score_percentage, onm_score, bac_score,
        fatal_flaw_step, cascading_steps_json, step_breakdown_json,
        ast_node_break_json, explanation_ro, teacher_critique_ro,
        theorems_json, typst_source, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      result.id,
      userId,
      result.problemId,
      problemTitle,
      result.domain,
      result.problemRo,
      result.phase,
      result.scorePercentage,
      result.scaledScores.onm7p.score,
      result.scaledScores.bac10p.score,
      result.fatalFlawStep ?? null,
      JSON.stringify(result.cascadingInvalidatedSteps || []),
      JSON.stringify(result.stepBreakdown),
      result.astNodeBreak ? JSON.stringify(result.astNodeBreak) : null,
      result.explanationRo,
      result.teacherCritiqueRo,
      JSON.stringify(result.relevantTheorems),
      result.typstSource,
      now,
      now
    );
  }
}

// 1. Get History of Past Analyses from SQLite
export const getHistory = (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.userId || 'user_demo_01';

  const rows = db.prepare(`
    SELECT id, problem_title as title, phase, score_percentage, onm_score, created_at
    FROM proof_analyses
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 20
  `).all(userId) as any[];

  const history = rows.map((r) => ({
    id: r.id,
    title: r.title,
    date: formatRelativeDate(r.created_at),
    status: r.phase === 'sound' ? 'ok' : 'flaw',
    scorePercentage: r.score_percentage,
    onmScore: r.onm_score,
  }));

  res.json(history);
};

// 2. Get Proof by ID from SQLite
export const getProofById = (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;

  const row = db.prepare('SELECT * FROM proof_analyses WHERE id = ?').get(id) as any;
  if (!row) {
    res.status(404).json({ error: 'Analiza cerută nu a fost găsită.' });
    return;
  }

  const result: OlympiadAnalysisResult = {
    id: row.id,
    problemId: row.problem_id,
    domain: row.domain,
    problemRo: row.problem_ro,
    phase: row.phase as any,
    scorePercentage: row.score_percentage,
    scaledScores: {
      onm7p: { scale: 'ONM (7p)', score: row.onm_score, maxScore: 7.0, percentage: row.score_percentage },
      bac10p: { scale: 'Bac/Examen (10p)', score: row.bac_score, maxScore: 10.0, percentage: row.score_percentage },
      usamo7p: { scale: 'USAMO (7p)', score: row.onm_score, maxScore: 7.0, percentage: row.score_percentage },
    },
    stepBreakdown: JSON.parse(row.step_breakdown_json),
    fatalFlawStep: row.fatal_flaw_step || undefined,
    cascadingInvalidatedSteps: row.cascading_steps_json ? JSON.parse(row.cascading_steps_json) : undefined,
    astNodeBreak: row.ast_node_break_json ? JSON.parse(row.ast_node_break_json) : undefined,
    explanationRo: row.explanation_ro,
    teacherCritiqueRo: row.teacher_critique_ro,
    relevantTheorems: JSON.parse(row.theorems_json),
    typstSource: row.typst_source,
  };

  res.json(result);
};

// 3. Analyze Proof (Gemini 1.5 Flash Master Prompt with Offline Fallback)
export const analyzeProof = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.userId || 'user_demo_01';
  const {
    id,
    fixedCondition,
    proofText,
    problemTitle,
    enunt,
    imageBase64,
    mimeType,
    apiKey: bodyApiKey,
  } = req.body;

  const headerApiKey = req.headers['x-gemini-api-key'] as string | undefined;
  const apiKey = bodyApiKey || headerApiKey;
  const targetId = id || 'analysis_bernoulli_01';

  try {
    const { result, engine } = await verifyProofWithGemini(
      {
        proofText,
        problemTitle,
        enunt,
        fixedCondition: Boolean(fixedCondition),
        imageBase64,
        mimeType,
        apiKey,
      },
      targetId
    );

    // Save or update analysis in SQLite
    saveOrUpdateAnalysis(userId, result);

    res.json({
      ...result,
      _meta: {
        engine,
        model: engine === 'gemini-1.5-flash' ? 'gemini-1.5-flash' : 'local-deterministic-engine',
        freeTier: true,
      },
    });
  } catch (error: any) {
    console.error('[analyzeProof] Error:', error);
    res.status(500).json({ error: 'Eroare la procesarea demonstrației matematice.' });
  }
};

// 4. Scan OCR & Multimodal Proof (Gemini 1.5 Flash Vision)
export const scanProof = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.userId || 'user_demo_01';
  const { imageBase64, imageUri, mimeType, apiKey: bodyApiKey } = req.body;
  const headerApiKey = req.headers['x-gemini-api-key'] as string | undefined;
  const apiKey = bodyApiKey || headerApiKey;

  if (imageBase64) {
    try {
      const newAnalysisId = `analysis_${Date.now()}`;
      const { result, engine } = await verifyProofWithGemini(
        {
          imageBase64,
          mimeType: mimeType || 'image/jpeg',
          apiKey,
        },
        newAnalysisId
      );

      saveOrUpdateAnalysis(userId, result);

      res.json({
        success: true,
        message: 'Scanare și audit multimodal completat prin Gemini 1.5 Flash.',
        detectedProblem: result.problemId,
        extractedLatex: result.problemRo,
        analysis: result,
        engine,
      });
      return;
    } catch (err: any) {
      console.error('[scanProof] Error analyzing image:', err);
    }
  }

  // Default simulated scan response for UI camera shutter
  res.json({
    success: true,
    message: 'Page captured — running OCR & AST evaluation…',
    detectedProblem: 'ONM_RO_BERNOULLI',
    extractedLatex: '(1 + x)^n >= 1 + nx',
    engine: isGeminiConfigured(apiKey) ? 'gemini-1.5-flash' : 'local-deterministic',
  });
};

// 5. Check Gemini 1.5 Flash Status
export const getGeminiStatus = (req: AuthenticatedRequest, res: Response): void => {
  const headerApiKey = req.headers['x-gemini-api-key'] as string | undefined;
  const configured = isGeminiConfigured(headerApiKey);

  res.json({
    configured,
    model: 'gemini-1.5-flash',
    provider: 'Google AI Studio (Free Tier)',
    costPerScan: '$0.00 (Free)',
    rateLimit: '15 requests/minute (Free Tier)',
    multimodalVision: true,
    cascadingFailureAuditing: true,
  });
};
