import { OlympiadAnalysisResult, StepEvaluation } from '../types/olympiad';
import { cleanAstBreak, cleanText, cleanTheorems } from './gemini';

/**
 * MathSentry Custom LoRA Service
 * Connects to the fine-tuned Qwen 2.5 Math 7B LoRA model running in Google Colab (via Cloudflare/ngrok tunnel)
 * or locally via Ollama / llama.cpp.
 */

export interface LoraVerifyOptions {
  proofText?: string;
  problemTitle?: string;
  enunt?: string;
  fixedCondition?: boolean;
}

export function getLoraApiUrl(): string | null {
  const url = process.env.LORA_API_URL || process.env.COLAB_API_URL;
  if (!url || url.trim() === '') return null;
  return url.trim().replace(/\/+$/, '');
}

export function isLoraConfigured(): boolean {
  return Boolean(getLoraApiUrl());
}

/**
 * Normalizes the fine-tuned model output into MathSentry's standard OlympiadAnalysisResult.
 */
export function normalizeLoraOutput(
  rawInput: any,
  fallbackId: string,
  problemTitle?: string,
  enunt?: string
): OlympiadAnalysisResult {
  let raw = rawInput;

  // If the server returned {"error": "Raw response", "content": "..."}, parse or regex-extract
  if (raw && raw.content && typeof raw.content === 'string') {
    try {
      raw = JSON.parse(raw.content);
    } catch {
      const text = raw.content;
      const statusMatch = text.match(/"status":\s*"([^"]+)"/);
      const fatalMatch = text.match(/"fatal_flaw_step":\s*(\d+|null)/);
      const scoreMatch = text.match(/"final_score_percentage":\s*([\d.]+)/);
      const onmMatch = text.match(/"onm_7p_score":\s*([\d.]+)/);
      const critiqueMatch = text.match(/"teacher_critique_ro":\s*"([^"\\]*(?:\\.[^"\\]*)*)/);

      raw = {
        status: statusMatch ? (statusMatch[1].includes('flaw') ? 'flaw' : 'sound') : 'flaw',
        fatal_flaw_step: fatalMatch && fatalMatch[1] !== 'null' ? parseInt(fatalMatch[1], 10) : undefined,
        final_score_percentage: scoreMatch ? parseFloat(scoreMatch[1]) : undefined,
        onm_7p_score: onmMatch ? parseFloat(onmMatch[1]) : undefined,
        teacher_critique_ro: critiqueMatch ? critiqueMatch[1].replace(/\\n/g, '\n') : undefined,
      };
    }
  }

  const isSound =
    raw.status === 'sound' ||
    raw.phase === 'sound' ||
    (typeof raw.final_score_percentage === 'number' && raw.final_score_percentage >= 99);

  const scorePct =
    typeof raw.final_score_percentage === 'number'
      ? Math.min(100, Math.max(0, raw.final_score_percentage))
      : typeof raw.scorePercentage === 'number'
      ? Math.min(100, Math.max(0, raw.scorePercentage))
      : isSound
      ? 100
      : 0;

  const onmScore =
    typeof raw.onm_7p_score === 'number'
      ? Math.min(7, Math.max(0, raw.onm_7p_score))
      : Math.round(((scorePct / 100) * 7.0) * 100) / 100;

  const bacScore = Math.round((1.0 + (scorePct / 100) * 9.0) * 100) / 100;
  const phase = isSound ? 'sound' : 'flaw';

  let stepBreakdown: StepEvaluation[] = [];

  if (Array.isArray(raw.step_evaluations)) {
    stepBreakdown = raw.step_evaluations.filter((s: any) => s && typeof s === 'object').slice(0, 30).map((s: any, idx: number) => {
      const stepNum = typeof s.step_index === 'number' ? s.step_index : idx + 1;
      const awarded = typeof s.awarded_percentage === 'number' ? s.awarded_percentage : (isSound ? 25 : 0);
      const maxPct = 25;
      const stepIsSound = typeof s.is_sound === 'boolean' ? s.is_sound : awarded === maxPct;

      return {
        step: stepNum,
        label: `Pasul ${stepNum}`,
        maxPercentage: maxPct,
        awardedPercentage: awarded,
        deductionPercentage: maxPct - awarded,
        isSound: stepIsSound,
        isCascadedFailure: Boolean(s.is_cascaded_failure || (!stepIsSound && stepNum > (raw.fatal_flaw_step ?? 3))),
        commentRo: cleanText(s.status_note, 2000) || (stepIsSound ? 'Pas deductiv validat riguros.' : 'Fractură deductivă sau colaps în cascadă.'),
        onmPoints: Math.round(((awarded / 100) * 7.0) * 100) / 100,
        bacPoints: Math.round(((awarded / 100) * 10.0) * 100) / 100,
      };
    });
  } else if (Array.isArray(raw.stepBreakdown)) {
    stepBreakdown = raw.stepBreakdown.filter((s: any) => s && typeof s === 'object').slice(0, 30).map((s: any, idx: number) => {
      const stepNum = typeof s.step === 'number' ? s.step : idx + 1;
      const maxPct = typeof s.maxPercentage === 'number' ? s.maxPercentage : 25;
      const awarded = typeof s.awardedPercentage === 'number' ? Math.min(maxPct, Math.max(0, s.awardedPercentage)) : 0;
      const stepIsSound = typeof s.isSound === 'boolean' ? s.isSound : awarded === maxPct;
      return {
        step: stepNum,
        label: cleanText(s.label, 200) || `Pasul ${stepNum}`,
        maxPercentage: maxPct,
        awardedPercentage: awarded,
        deductionPercentage: Math.max(0, maxPct - awarded),
        isSound: stepIsSound,
        isCascadedFailure: Boolean(s.isCascadedFailure),
        commentRo: cleanText(s.commentRo, 2000) || (stepIsSound ? 'Pas deductiv validat riguros.' : 'Fractură deductivă sau colaps în cascadă.'),
        onmPoints: Math.round(((awarded / 100) * 7.0) * 100) / 100,
        bacPoints: Math.round(((awarded / 100) * 10.0) * 100) / 100,
      };
    });
  } else {
    // The model returned no per-step grading: show one honest summary step.
    stepBreakdown = [
      {
        step: 1,
        label: 'Evaluare globală',
        maxPercentage: 100,
        awardedPercentage: scorePct,
        deductionPercentage: 100 - scorePct,
        isSound,
        commentRo: isSound ? 'Demonstrația a fost validată integral.' : 'Demonstrația conține cel puțin o eroare de raționament.',
        onmPoints: Math.round(((scorePct / 100) * 7.0) * 100) / 100,
        bacPoints: Math.round(((scorePct / 100) * 10.0) * 100) / 100,
      },
    ];
  }

  const fatalFlawStep =
    typeof raw.fatal_flaw_step === 'number'
      ? raw.fatal_flaw_step
      : typeof raw.fatalFlawStep === 'number'
      ? raw.fatalFlawStep
      : isSound
      ? undefined
      : stepBreakdown.find((s) => !s.isSound && !s.isCascadedFailure)?.step;

  const cascadingSteps = Array.isArray(raw.cascading_invalidated_steps)
    ? raw.cascading_invalidated_steps.filter((n: any) => typeof n === 'number').slice(0, 30)
    : Array.isArray(raw.cascadingInvalidatedSteps)
    ? raw.cascadingInvalidatedSteps.filter((n: any) => typeof n === 'number').slice(0, 30)
    : stepBreakdown.filter((s) => s.isCascadedFailure).map((s) => s.step);

  const teacherCritique =
    cleanText(raw.teacher_critique_ro, 5000) ||
    cleanText(raw.teacherCritiqueRo, 5000) ||
    (isSound
      ? 'Toate etapele deductive au fost verificate conform baremului ONM.'
      : `Raționamentul se rupe la Pasul ${fatalFlawStep ?? '?'}. Conform baremului, pașii care depind de el nu primesc puncte.`);

  return {
    id: fallbackId,
    problemId: 'CUSTOM',
    domain: cleanText(raw.domain, 100) || 'Matematică',
    problemRo: enunt || 'Demonstrație matematică auditată de modelul MathSentry LoRA.',
    phase,
    scorePercentage: scorePct,
    scaledScores: {
      onm7p: { scale: 'ONM (7p)', score: onmScore, maxScore: 7.0, percentage: scorePct },
      bac10p: { scale: 'Bac/Examen (10p)', score: bacScore, maxScore: 10.0, percentage: scorePct },
      usamo7p: { scale: 'USAMO (7p)', score: onmScore, maxScore: 7.0, percentage: scorePct },
    },
    stepBreakdown,
    fatalFlawStep,
    cascadingInvalidatedSteps: cascadingSteps,
    astNodeBreak: isSound ? undefined : cleanAstBreak(raw.ast_node_break),
    explanationRo: isSound
      ? 'Toți pașii deductivi au fost validați formal de modelul finetunat MathSentry Qwen 7B.'
      : `Colaps deductiv la Pasul ${fatalFlawStep ?? '?'}, cu anularea în cascadă a pașilor dependenți.`,
    teacherCritiqueRo: teacherCritique,
    relevantTheorems: cleanTheorems(raw.relevant_theorems),
    typstSource: `#set page(paper: "a4", margin: 2cm)\n#set text(font: "Newsreader", size: 11pt)\n\n= Audit Matematic MathSentry LoRA\n*Problema:* ${cleanText(problemTitle, 200)}\n\n${cleanText(enunt, 5000)}\n\n*Verdict Baremat:* ${onmScore} / 7.00p`,
  };
}

/**
 * Call the fine-tuned LoRA server in Google Colab (via tunnel) or local Ollama.
 */
export async function verifyProofWithLora(
  options: LoraVerifyOptions,
  fallbackId: string
): Promise<{ result: OlympiadAnalysisResult; engine: string } | null> {
  const apiUrl = getLoraApiUrl();
  if (!apiUrl) return null;

  const controller = new AbortController();
  // LORA_TIMEOUT_MS: how long to wait for the Colab GPU before falling back to Gemini
  const timeoutMs = parseInt(process.env.LORA_TIMEOUT_MS || '', 10) || 20000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const payload = {
      problem_title: options.problemTitle || '',
      enunt: options.enunt || '',
      proof_text: options.proofText || '',
    };

    const res = await fetch(`${apiUrl}/audit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[LoRA Service] Server responded with HTTP ${res.status}`);
      return null;
    }

    const rawData = await res.json();
    const result = normalizeLoraOutput(rawData, fallbackId, options.problemTitle, options.enunt);

    return {
      result,
      engine: 'mathsentry-qwen2.5-math-7b-lora (Google Colab GPU)',
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn('[LoRA Service] Failed to contact LoRA server:', err.message);
    return null;
  }
}
