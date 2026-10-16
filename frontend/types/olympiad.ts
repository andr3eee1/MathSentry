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
  _meta?: {
    engine: string;
    model: string;
    freeTier: boolean;
  };
}
