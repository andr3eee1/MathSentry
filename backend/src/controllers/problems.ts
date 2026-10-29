import { Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest } from '../middleware/auth';
import { extractProblemWithMathSentry } from '../services/gemini';
import { formatRelativeDate, newId, rowToResult, saveAnalysis } from '../services/analysisStore';
import { releaseQuota, reserveQuota, sendReservationError } from '../services/quota';
import { EngineUnavailableError } from '../services/gemini';
import { gradeProof, sendEngineError, validateAuditFields, validateAuditRequest } from './analysis';

const MAX_TITLE_CHARS = 200;
const MAX_STATEMENT_CHARS = 5000;
const MAX_DOMAIN_CHARS = 100;

function getOwnProblem(id: string, userId: string): any {
  return db.prepare('SELECT * FROM user_problems WHERE id = ? AND user_id = ?').get(id, userId);
}

// 1. All problems of the user, with solution stats in one query
export const getProblems = (req: AuthenticatedRequest, res: Response): void => {
  const problems = db.prepare(`
    SELECT p.*,
      (SELECT COUNT(*) FROM proof_analyses a WHERE a.problem_id = p.id AND a.user_id = p.user_id) as solution_count,
      (SELECT MAX(score_percentage) FROM proof_analyses a WHERE a.problem_id = p.id AND a.user_id = p.user_id) as highest_score,
      (SELECT phase FROM proof_analyses a WHERE a.problem_id = p.id AND a.user_id = p.user_id
         ORDER BY created_at DESC LIMIT 1) as latest_phase
    FROM user_problems p
    WHERE p.user_id = ?
    ORDER BY p.created_at DESC
  `).all(req.userId) as any[];

  res.json(problems.map((p) => ({
    id: p.id,
    userId: p.user_id,
    title: p.title,
    domain: p.domain,
    enuntRo: p.enunt_ro,
    createdAt: p.created_at,
    dateRelative: formatRelativeDate(p.created_at),
    solutionCount: p.solution_count || 0,
    highestScore: p.highest_score != null ? Math.round(p.highest_score) : null,
    latestStatus: p.latest_phase ? (p.latest_phase === 'sound' ? 'sound' : 'flaw') : null,
  })));
};

// 2. Add a problem (typed, or extracted from a photo)
export const createProblem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const { title, domain, enuntRo, imageBase64 } = req.body;
  const mimeType = req.body.mimeType || 'image/jpeg';

  for (const value of [title, domain, enuntRo]) {
    if (value !== undefined && value !== null && typeof value !== 'string') {
      res.status(400).json({ error: 'Cerere invalidă.' });
      return;
    }
  }
  const invalid = validateAuditFields({ imageBase64, mimeType });
  if (invalid) {
    res.status(invalid.status).json({ error: invalid.error });
    return;
  }
  if ((title || '').length > MAX_TITLE_CHARS || (enuntRo || '').length > MAX_STATEMENT_CHARS || (domain || '').length > MAX_DOMAIN_CHARS) {
    res.status(400).json({ error: 'Titlul sau enunțul este prea lung.' });
    return;
  }

  let finalTitle = typeof title === 'string' ? title.trim() : '';
  let finalDomain = typeof domain === 'string' ? domain.trim() : '';
  let finalEnunt = typeof enuntRo === 'string' ? enuntRo.trim() : '';

  if (imageBase64) {
    const reservation = reserveQuota(userId, Boolean(req.isGuest), 'ocr', Boolean(req.isPro));
    if ('error' in reservation) {
      sendReservationError(res, reservation);
      return;
    }
    try {
      const extracted = await extractProblemWithMathSentry(imageBase64, mimeType);
      finalTitle = finalTitle || extracted.title;
      finalDomain = finalDomain || extracted.domain;
      finalEnunt = finalEnunt || extracted.enuntRo;
    } catch (error) {
      if (error instanceof EngineUnavailableError) releaseQuota(reservation.eventId);
      sendEngineError(res, error, 'Nu am putut citi enunțul din poză.');
      return;
    }
  }

  if (!finalEnunt) {
    res.status(400).json({ error: 'Enunțul problemei este obligatoriu.' });
    return;
  }
  if (finalTitle.length > MAX_TITLE_CHARS || finalEnunt.length > MAX_STATEMENT_CHARS) {
    res.status(400).json({ error: 'Titlul sau enunțul este prea lung.' });
    return;
  }
  finalTitle = finalTitle || finalEnunt.slice(0, 60);
  finalDomain = finalDomain || 'Matematică';

  const problemId = newId('prob');
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO user_problems (id, user_id, title, domain, enunt_ro, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(problemId, userId, finalTitle, finalDomain, finalEnunt, now, now);

  res.status(201).json({
    id: problemId,
    userId,
    title: finalTitle,
    domain: finalDomain,
    enuntRo: finalEnunt,
    createdAt: now,
    dateRelative: formatRelativeDate(now),
    solutionCount: 0,
    highestScore: null,
    latestStatus: null,
  });
};

// 3. Problem details and all of the user's solutions to it
export const getProblemById = (req: AuthenticatedRequest, res: Response): void => {
  const problem = getOwnProblem(req.params.id, req.userId!);
  if (!problem) {
    res.status(404).json({ error: 'Problema solicitată nu a fost găsită.' });
    return;
  }

  const solutions = (db.prepare(`
    SELECT * FROM proof_analyses
    WHERE problem_id = ? AND user_id = ?
    ORDER BY created_at DESC
  `).all(problem.id, req.userId) as any[]).map((row) => ({
    ...rowToResult(row),
    dateRelative: formatRelativeDate(row.created_at),
  }));

  res.json({
    problem: {
      id: problem.id,
      userId: problem.user_id,
      title: problem.title,
      domain: problem.domain,
      enuntRo: problem.enunt_ro,
      createdAt: problem.created_at,
      dateRelative: formatRelativeDate(problem.created_at),
      solutionCount: solutions.length,
    },
    solutions,
  });
};

// 4. Audit a solution for one of the user's problems
export const submitProblemSolution = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const { proofText, imageBase64 } = req.body;
  const mimeType = req.body.mimeType || 'image/jpeg';

  const problem = getOwnProblem(req.params.id, userId);
  if (!problem) {
    res.status(404).json({ error: 'Problema pentru care trimiți soluția nu a fost găsită.' });
    return;
  }

  const invalid = validateAuditRequest(req.body);
  if (invalid) {
    res.status(invalid.status).json({ error: invalid.error });
    return;
  }

  const reservation = reserveQuota(userId, Boolean(req.isGuest), 'solution', Boolean(req.isPro));
  if ('error' in reservation) {
    sendReservationError(res, reservation);
    return;
  }

  try {
    const { result, engine } = await gradeProof(
      {
        proofText,
        problemTitle: problem.title,
        enunt: problem.enunt_ro,
        imageBase64,
        mimeType,
      },
      newId('sol')
    );

    result.problemId = problem.id;
    result.domain = problem.domain;
    result.problemRo = problem.enunt_ro;

    // The offline dev grader never consumes quota
    if (engine === 'local-deterministic') releaseQuota(reservation.eventId);
    saveAnalysis({ userId, result, problemTitle: problem.title, proofText: proofText || null, engine });

    res.json({
      ...result,
      problemTitle: problem.title,
      proofText: proofText || undefined,
      isExample: false,
      _meta: { engine, model: engine },
    });
  } catch (error) {
    if (error instanceof EngineUnavailableError) releaseQuota(reservation.eventId);
    sendEngineError(res, error, 'Eroare la auditarea soluției pentru această problemă.');
  }
};

// 5. Delete a problem and its solutions
export const deleteProblem = (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.userId!;
  const { id } = req.params;

  if (!getOwnProblem(id, userId)) {
    res.status(404).json({ error: 'Problema nu a fost găsită.' });
    return;
  }

  db.transaction(() => {
    db.prepare('DELETE FROM proof_analyses WHERE problem_id = ? AND user_id = ?').run(id, userId);
    db.prepare('DELETE FROM user_problems WHERE id = ? AND user_id = ?').run(id, userId);
  })();

  res.json({ success: true });
};
