import { Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest } from '../middleware/auth';
import { OlympiadAnalysisResult, StepEvaluation } from '../types/olympiad';

export const TYPST_BERNOULLI = `#set page(paper: "a4", margin: 2cm)
#set text(font: "New Computer Modern", size: 11pt)

= Problem
Prove that for all real $x != 0$,
$(1 + x)^n >= 1 + n x$ for $n in NN$.

= Proof
*Base case.* For $n = 1$:
$(1 + x)^1 = 1 + 1 dot x$. #h(1fr) $checkmark$

*Inductive hypothesis.* Assume $P(k)$:
$(1 + x)^k >= 1 + k x$.

*Inductive step.* Multiply both sides by $(1 + x)$:
$ (1 + x)^(k+1) >= (1 + k x)(1 + x)
  = 1 + (k+1)x + k x^2 >= 1 + (k+1)x $

*Conclusion.* By induction, $P(n)$ holds
for all $n in NN$. $qed$`;

export const THEOREMS_BERNOULLI = [
  {
    name: "BERNOULLI'S INEQUALITY",
    statement:
      'Pentru orice număr întreg n ≥ 0 și orice număr real x ≥ −1, (1 + x)ⁿ ≥ 1 + nx.',
  },
  {
    name: 'ORDER AXIOM FOR MULTIPLICATION',
    statement:
      'Dacă a ≥ b și c > 0, atunci ac ≥ bc. Dacă c < 0, sensul inegalității se inversează.',
  },
];

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

// 3. Analyze Proof (Initial or Scan Submission)
export const analyzeProof = (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.userId || 'user_demo_01';
  const { fixedCondition } = req.body;
  const isFixed = Boolean(fixedCondition);

  if (isFixed) {
    // Sound Analysis
    const steps: StepEvaluation[] = [
      {
        step: 1,
        label: 'Cazul de bază (n = 1)',
        maxPercentage: 15.0,
        awardedPercentage: 15.0,
        deductionPercentage: 0.0,
        isSound: true,
        commentRo: 'Cazul de bază este tratat corect și complet.',
        onmPoints: 1.05,
        bacPoints: 1.5,
      },
      {
        step: 2,
        label: 'Ipoteza inductivă',
        maxPercentage: 25.0,
        awardedPercentage: 25.0,
        deductionPercentage: 0.0,
        isSound: true,
        commentRo: 'Ipoteza inductivă este formulată riguros.',
        onmPoints: 1.75,
        bacPoints: 2.5,
      },
      {
        step: 3,
        label: 'Pasul inductiv cu justificarea x > -1',
        maxPercentage: 45.0,
        awardedPercentage: 45.0,
        deductionPercentage: 0.0,
        isSound: true,
        commentRo: 'Restricția de domeniu x > -1 garantează că 1 + x > 0. Sensul inegalității este conservat.',
        onmPoints: 3.15,
        bacPoints: 4.5,
      },
      {
        step: 4,
        label: 'Concluzia inducției',
        maxPercentage: 15.0,
        awardedPercentage: 15.0,
        deductionPercentage: 0.0,
        isSound: true,
        commentRo: 'Principiul inducției matematice este aplicat corect. Demonstrație completă.',
        onmPoints: 1.05,
        bacPoints: 1.5,
      },
    ];

    const result: OlympiadAnalysisResult = {
      id: 'analysis_bernoulli_01',
      problemId: 'ONM_RO_BERNOULLI',
      domain: 'Algebră / Inegalități',
      problemRo:
        'Să se demonstreze că pentru orice număr real x ≠ 0 și n ∈ ℕ*, avem (1 + x)ⁿ ≥ 1 + nx, știind că x > -1.',
      phase: 'sound',
      scorePercentage: 100.0,
      scaledScores: {
        onm7p: { scale: 'ONM (7p)', score: 7.0, maxScore: 7.0, percentage: 100.0 },
        bac10p: { scale: 'Bac/Examen (10p)', score: 10.0, maxScore: 10.0, percentage: 100.0 },
        usamo7p: { scale: 'USAMO (7p)', score: 7.0, maxScore: 7.0, percentage: 100.0 },
      },
      stepBreakdown: steps,
      explanationRo: 'Toate cele 4 noduri deductive au fost verificate conform regulilor formale. Punctaj complet acordat!',
      teacherCritiqueRo:
        'Excelent! Demonstrația ta respectă exigențele Comisiei Naționale. Ai precizat explicit condiția x > -1 care asigură pozitivitatea termenului 1 + x, evitând capcana clasică a inversării sensului inegalității.',
      relevantTheorems: THEOREMS_BERNOULLI,
      typstSource: TYPST_BERNOULLI,
    };

    // Update SQLite state
    db.prepare(`
      UPDATE proof_analyses
      SET phase = 'sound', score_percentage = 100.0, onm_score = 7.0, bac_score = 10.0,
          fatal_flaw_step = NULL, cascading_steps_json = '[]',
          step_breakdown_json = ?, ast_node_break_json = NULL, updated_at = ?
      WHERE id = 'analysis_bernoulli_01'
    `).run(JSON.stringify(steps), new Date().toISOString());

    res.json(result);
  } else {
    // Cascading Failure Flaw
    const steps: StepEvaluation[] = [
      {
        step: 1,
        label: 'Cazul de bază (n = 1)',
        maxPercentage: 15.0,
        awardedPercentage: 15.0,
        deductionPercentage: 0.0,
        isSound: true,
        commentRo: 'Cazul de bază este verificat.',
        onmPoints: 1.05,
        bacPoints: 1.5,
      },
      {
        step: 2,
        label: 'Ipoteza inductivă',
        maxPercentage: 25.0,
        awardedPercentage: 25.0,
        deductionPercentage: 0.0,
        isSound: true,
        commentRo: 'Ipoteza inductivă este formulată corect.',
        onmPoints: 1.75,
        bacPoints: 2.5,
      },
      {
        step: 3,
        label: 'Pasul inductiv',
        maxPercentage: 45.0,
        awardedPercentage: 0.0,
        deductionPercentage: 45.0,
        isSound: false,
        commentRo:
          'EROARE FATALĂ DE RAȚIONAMENT: Înmulțirea inegalității cu (1 + x) fără a demonstra că 1 + x > 0.',
        onmPoints: 0.0,
        bacPoints: 0.0,
      },
      {
        step: 4,
        label: 'Concluzia inducției',
        maxPercentage: 15.0,
        awardedPercentage: 0.0,
        deductionPercentage: 15.0,
        isSound: false,
        isCascadedFailure: true,
        commentRo:
          'COLAPS ÎN CASCADĂ (0%): Concluzia se bazează pe pasul 3 care este invalidat. Nu se poate trage o concluzie dintr-o premisă nedemonstrată.',
        onmPoints: 0.0,
        bacPoints: 0.0,
      },
    ];

    const astBreak = {
      rule: 'Inequality_Multiply_Rule',
      condition: '1 + x > 0',
      status: 'UNVERIFIED',
    };

    const result: OlympiadAnalysisResult = {
      id: 'analysis_bernoulli_01',
      problemId: 'ONM_RO_BERNOULLI',
      domain: 'Algebră / Inegalități',
      problemRo:
        'Să se demonstreze că pentru orice număr real x ≠ 0 și n ∈ ℕ*, avem (1 + x)ⁿ ≥ 1 + nx, știind că x > -1.',
      phase: 'flaw',
      scorePercentage: 40.0,
      scaledScores: {
        onm7p: { scale: 'ONM (7p)', score: 2.8, maxScore: 7.0, percentage: 40.0 },
        bac10p: { scale: 'Bac/Examen (10p)', score: 4.6, maxScore: 10.0, percentage: 40.0 },
        usamo7p: { scale: 'USAMO (7p)', score: 2.8, maxScore: 7.0, percentage: 40.0 },
      },
      fatalFlawStep: 3,
      cascadingInvalidatedSteps: [4],
      stepBreakdown: steps,
      astNodeBreak: astBreak as any,
      explanationRo:
        "Logica se rupe la Pasul 3. Ai aplicat pasul inductiv (înmulțind inegalitatea cu 1 + x), dar ai verificat dacă condiția de bază (x > −1) este respectată în acest domeniu?",
      teacherCritiqueRo:
        "ATENȚIE: Eroare fatală de olimpiadă la Pasul 3! Ai înmulțit ambii membri ai inegalității P(k) cu (1 + x), dar ai omis să justifici că 1 + x > 0. Pasul 4 (Concluzia) este anulat automat (0 puncte) prin efect de cascadă!",
      relevantTheorems: THEOREMS_BERNOULLI,
      typstSource: TYPST_BERNOULLI,
    };

    // Update SQLite state
    db.prepare(`
      UPDATE proof_analyses
      SET phase = 'flaw', score_percentage = 40.0, onm_score = 2.8, bac_score = 4.6,
          fatal_flaw_step = 3, cascading_steps_json = '[4]',
          step_breakdown_json = ?, ast_node_break_json = ?, updated_at = ?
      WHERE id = 'analysis_bernoulli_01'
    `).run(JSON.stringify(steps), JSON.stringify(astBreak), new Date().toISOString());

    res.json(result);
  }
};

// 4. Scan OCR Proof Simulation
export const scanProof = (req: AuthenticatedRequest, res: Response): void => {
  res.json({
    success: true,
    message: 'Page captured — running OCR & AST evaluation…',
    detectedProblem: 'ONM_RO_BERNOULLI',
    extractedLatex: '(1 + x)^n >= 1 + nx',
  });
};
