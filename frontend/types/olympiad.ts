export interface ScaledScore {
  scale: string;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface StepEvaluation {
  step: number;
  label: string;
  maxPercentage: number;
  awardedPercentage: number;
  deductionPercentage: number;
  isSound: boolean;
  isCascadedFailure?: boolean;
  commentRo: string;
  onmPoints: number;
  bacPoints: number;
}

export interface ASTNodeBreak {
  rule: string;
  condition: string;
  status: string;
}

export interface OlympiadAnalysisResult {
  id: string;
  problemId: string;
  problemTitle?: string;
  domain: string;
  problemRo: string;
  phase: 'sound' | 'flaw' | 'scanning';
  scorePercentage: number;
  scaledScores: {
    onm7p: ScaledScore;
    bac10p: ScaledScore;
    usamo7p: ScaledScore;
  };
  stepBreakdown: StepEvaluation[];
  fatalFlawStep?: number;
  cascadingInvalidatedSteps?: number[];
  astNodeBreak?: ASTNodeBreak;
  explanationRo: string;
  teacherCritiqueRo: string;
  relevantTheorems: Array<{
    name: string;
    statement: string;
  }>;
  typstSource: string;
  proofText?: string;
  isExample?: boolean;
  createdAt?: string;
  _meta?: {
    engine: string;
    model: string;
  };
}

/** True when the result came from the dev-only canned grader, not a real AI audit. */
export const isOfflineDemoResult = (a?: OlympiadAnalysisResult | null): boolean =>
  a?._meta?.engine === 'local-deterministic';

export interface UserProblem {
  id: string;
  userId: string;
  title: string;
  domain: string;
  enuntRo: string;
  createdAt: string;
  dateRelative?: string;
  solutionCount?: number;
  highestScore?: number | null;
  latestStatus?: 'sound' | 'flaw' | null;
}
