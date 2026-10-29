export type ScoringSystem = 'percentage' | 'onm_7p' | 'bac_10p' | 'usamo_7p' | 'putnam_10p';

export interface ScaledScore {
  scale: string;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface RubricStep {
  stepIndex: number;
  label: string;
  weightPercentage: number; // 0 - 100%
  dependencies: number[]; // Prior steps that MUST hold for this step to be evaluated
  descriptionRo: string;
}

export interface StepEvaluation {
  step: number;
  label: string;
  maxPercentage: number;
  awardedPercentage: number;
  deductionPercentage: number;
  isSound: boolean;
  isCascadedFailure?: boolean; // True if step failed because a foundational dependency broke
  commentRo: string;
  onmPoints: number; // calculated via: (awardedPercentage / 100) * 7.0
  bacPoints: number; // calculated via: (awardedPercentage / 100) * 10.0
}

export interface ASTNodeBreak {
  rule: string;
  condition: string;
  status: 'UNVERIFIED' | 'ASSERTED (pending re-analysis)' | 'VERIFIED';
}

export interface OlympiadAnalysisResult {
  id: string;
  problemId: string;
  problemTitle?: string;
  domain: string;
  problemRo: string;
  phase: 'flaw' | 'scanning' | 'sound';
  scorePercentage: number; // e.g. 40.0%
  scaledScores: {
    onm7p: ScaledScore;  // e.g. 2.80 / 7.0
    bac10p: ScaledScore; // e.g. 4.60 / 10.0
    usamo7p: ScaledScore;
  };
  stepBreakdown: StepEvaluation[];
  fatalFlawStep?: number; // Step where the deductive chain snapped
  cascadingInvalidatedSteps?: number[]; // Subsequent steps collapsed to 0%
  astNodeBreak?: ASTNodeBreak;
  explanationRo: string;
  teacherCritiqueRo: string; // Fierce, uncompromising, deeply pedagogical feedback replacing the teacher
  relevantTheorems: Array<{
    name: string;
    statement: string;
  }>;
  typstSource: string;
  proofText?: string; // The submitted proof, kept so re-audits grade the real text
  isExample?: boolean; // Public showcase analysis, read-only for everyone
  createdAt?: string;
  _meta?: { engine: string; model: string };
}
