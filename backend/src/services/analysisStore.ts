import { randomUUID } from 'crypto';
import { db, EXAMPLES_USER_ID } from '../db';
import { OlympiadAnalysisResult } from '../types/olympiad';

export function newId(prefix: string): string {
  return `${prefix}_${randomUUID().replace(/-/g, '').slice(0, 16)}`;
}

export function formatRelativeDate(isoDate: string): string {
  const time = new Date(isoDate).getTime();
  if (Number.isNaN(time)) return 'Recent';

  const diffDays = Math.floor((Date.now() - time) / 86400000);
  if (diffDays <= 0) return 'Astăzi';
  if (diffDays === 1) return 'Ieri';
  if (diffDays < 7) return `Acum ${diffDays} zile`;
  if (diffDays < 14) return 'Acum o săptămână';
  return `Acum ${Math.floor(diffDays / 7)} săptămâni`;
}

/** A user may read their own analyses plus the public example analyses. */
export function canRead(row: { user_id: string }, userId: string): boolean {
  return row.user_id === userId || row.user_id === EXAMPLES_USER_ID;
}

export function rowToResult(row: any): OlympiadAnalysisResult {
  return {
    id: row.id,
    problemId: row.problem_id,
    problemTitle: row.problem_title,
    domain: row.domain,
    problemRo: row.problem_ro,
    phase: row.phase,
    scorePercentage: row.score_percentage,
    scaledScores: {
      onm7p: { scale: 'ONM (7p)', score: row.onm_score, maxScore: 7.0, percentage: row.score_percentage },
      bac10p: { scale: 'Bac/Examen (10p)', score: row.bac_score, maxScore: 10.0, percentage: row.score_percentage },
      usamo7p: { scale: 'USAMO (7p)', score: row.onm_score, maxScore: 7.0, percentage: row.score_percentage },
    },
    stepBreakdown: JSON.parse(row.step_breakdown_json),
    fatalFlawStep: row.fatal_flaw_step ?? undefined,
    cascadingInvalidatedSteps: row.cascading_steps_json ? JSON.parse(row.cascading_steps_json) : undefined,
    astNodeBreak: row.ast_node_break_json ? JSON.parse(row.ast_node_break_json) : undefined,
    explanationRo: row.explanation_ro,
    teacherCritiqueRo: row.teacher_critique_ro,
    relevantTheorems: JSON.parse(row.theorems_json),
    typstSource: row.typst_source,
    proofText: row.proof_text ?? undefined,
    isExample: row.user_id === EXAMPLES_USER_ID,
    createdAt: row.created_at,
    _meta: row.engine ? { engine: row.engine, model: row.engine } : undefined,
  };
}

export interface SaveAnalysisInput {
  userId: string;
  result: OlympiadAnalysisResult;
  problemTitle: string;
  proofText?: string | null;
  engine: string;
}

/**
 * Inserts the analysis, or updates it in place when `result.id` already
 * belongs to the same user (re-audit). Never touches another user's row.
 */
export function saveAnalysis({ userId, result, problemTitle, proofText, engine }: SaveAnalysisInput): void {
  const now = new Date().toISOString();
  const existing = db
    .prepare('SELECT id FROM proof_analyses WHERE id = ? AND user_id = ?')
    .get(result.id, userId);

  const values = [
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
    proofText ?? null,
    engine,
  ];

  if (existing) {
    db.prepare(`
      UPDATE proof_analyses
      SET problem_id = ?, problem_title = ?, domain = ?, problem_ro = ?,
          phase = ?, score_percentage = ?, onm_score = ?, bac_score = ?,
          fatal_flaw_step = ?, cascading_steps_json = ?, step_breakdown_json = ?,
          ast_node_break_json = ?, explanation_ro = ?, teacher_critique_ro = ?,
          theorems_json = ?, typst_source = ?, proof_text = ?, engine = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `).run(...values, now, result.id, userId);
  } else {
    db.prepare(`
      INSERT INTO proof_analyses (
        problem_id, problem_title, domain, problem_ro,
        phase, score_percentage, onm_score, bac_score,
        fatal_flaw_step, cascading_steps_json, step_breakdown_json,
        ast_node_break_json, explanation_ro, teacher_critique_ro,
        theorems_json, typst_source, proof_text, engine,
        id, user_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(...values, result.id, userId, now, now);
  }
}
