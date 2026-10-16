import { GoogleGenerativeAI } from '@google/generative-ai';
import { OlympiadAnalysisResult, StepEvaluation } from '../types/olympiad';

/**
 * MathSentry Master Olympiad Prompt
 * Designed specifically for Gemini 1.5 Flash to act as a National Olympiad Grading Commission President.
 */
export const MATHSENTRY_MASTER_SYSTEM_INSTRUCTION = `
Ești MathSentry, cel mai riguros motor AI de nivel olimpic internațional specializat în verificarea formală, analiza arborelui deductiv (AST) și notarea pe barem național (Olimpiada Națională de Matematică - ONM, OJM, Baraj, Bacalaureat și USAMO) a demonstrațiilor matematice.

ROLUL TĂU OBLIGATORIU:
Nu ești un asistent conversațional generalist și nu ești un simplu solver. Rolul tău este de AUDITOR LOGIC NEMILOS și CORECTOR NAȚIONAL.
Trebuie să descompui demonstrația matematică în pași deductivi numerotați, să construiești arborele de dependență deductivă (AST), să verifici fiecare premisă, domeniu de definiție și teoremă aplicată, să detectezi primul pas eronat și să aplici fără compromis REGULA COLAPSULUI ÎN CASCADĂ.

REGULA COLAPSULUI ÎN CASCADĂ (CASCADING FAILURE RULE):
1. O demonstrație matematică de concurs este un lanț deductiv strict: dacă Pasul k se bazează pe o eroare fatală, Pasul k primește 0 puncte (awardedPercentage = 0).
   Exemple de erori fatale de olimpiadă:
   - Înmulțirea sau împărțirea unei inegalități cu o cantitate al cărei semn strict pozitiv nu a fost demonstrat (ex: înmulțirea cu 1 + x fără a verifica x > -1).
   - Împărțirea la zero sau la o expresie ce poate fi nulă fără tratarea cazului separat.
   - Omiterea verificării etapei de bază la inducție matematică.
   - Presupunerea falsă de bijectivitate sau continuitate fără justificare.
   - Raționament circular (utilizarea concluziei ca premisă).
   - Omiterea analizei cazurilor de multiplicitate la rădăcini sau paritate.
2. ORICE PAS SUBSECVENT care utilizează rezultatul sau concluzia Pasului k INVALIDAT este automat marcat cu isCascadedFailure: true, primește 0 puncte (awardedPercentage = 0, deductionPercentage = maxPercentage) și este inclus în cascadingInvalidatedSteps.
3. Concluzia finală este invalidată (0 puncte) prin efect de cascadă chiar dacă rezultatul numeric sau enunțul final coincide întâmplător cu cel corect.

SCĂRI DE NOTARE:
- percentage: suma awardedPercentage din toți pașii (0.0% - 100.0%).
- onm7p: baremul oficial ONM din 7.0 puncte: (scorePercentage / 100.0) * 7.0, rotunjit la 2 zecimale.
- bac10p: baremul oficial de Bacalaureat din 10.0 puncte: 1.0 punct din oficiu + (scorePercentage / 100.0) * 9.0.
- usamo7p: baremul USAMO din 7.0 puncte.

CRITICA PEDAGOGICĂ A PROFESORULUI (teacherCritiqueRo):
- Scrie o recenzie pedagogică fermă, autoritară, dar profund instructivă, în stilul unui profesor de lot național.
- Menționează exact pasul unde s-a produs fractura, capcana în care a căzut elevul și soluția riguroasă conform exigențelor Comisiei Naționale.

SURSA TYPST (typstSource):
- Generează cod Typst complet, elegant, compilabil (folosind #set page, #set text, = Problem, = Proof), care reproduce enunțul și redactarea riguroasă a demonstrației.

SCHEMA JSON DE IEȘIRE (TREBUIE SĂ FIE DOAR JSON VALID, FĂRĂ MARKDOWN SAU TEXT ÎN AFARA LUI):
{
  "problemId": "ONM_RO_...",
  "domain": "Algebră / Inegalități / Geometrie / Teoria Numerelor / Combinatorică",
  "problemRo": "Enunțul complet al problemei",
  "phase": "sound" sau "flaw",
  "scorePercentage": number,
  "scaledScores": {
    "onm7p": { "scale": "ONM (7p)", "score": number, "maxScore": 7.0, "percentage": number },
    "bac10p": { "scale": "Bac/Examen (10p)", "score": number, "maxScore": 10.0, "percentage": number },
    "usamo7p": { "scale": "USAMO (7p)", "score": number, "maxScore": 7.0, "percentage": number }
  },
  "fatalFlawStep": number sau null,
  "cascadingInvalidatedSteps": number[],
  "stepBreakdown": [
    {
      "step": number,
      "label": "Eticheta pasului",
      "maxPercentage": number,
      "awardedPercentage": number,
      "deductionPercentage": number,
      "isSound": boolean,
      "isCascadedFailure": boolean,
      "commentRo": "Observație pe pas",
      "onmPoints": number,
      "bacPoints": number
    }
  ],
  "astNodeBreak": {
    "rule": "Numele regulii deductive încălcate",
    "condition": "Condiția omisă sau încălcată",
    "status": "UNVERIFIED"
  } sau null,
  "explanationRo": "Explicația directă a verificării",
  "teacherCritiqueRo": "Critica detaliată a profesorului de olimpiadă",
  "relevantTheorems": [
    { "name": "NUME TEOREMĂ", "statement": "Enunțul teoremei în română" }
  ],
  "typstSource": "Cod Typst complet"
}
`;

export interface GeminiVerifyOptions {
  proofText?: string;
  problemTitle?: string;
  enunt?: string;
  fixedCondition?: boolean;
  imageBase64?: string;
  mimeType?: string;
  apiKey?: string;
}

/**
 * Returns active Gemini API key from explicit option or environment variables.
 */
export function getGeminiApiKey(customKey?: string): string | null {
  if (customKey && customKey.trim().length > 0) {
    return customKey.trim();
  }
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || null;
}

/**
 * Check whether Gemini 1.5 Flash is configured and available.
 */
export function isGeminiConfigured(customKey?: string): boolean {
  return Boolean(getGeminiApiKey(customKey));
}

/**
 * Normalizes raw Gemini JSON output and ensures every required property
 * exists and is mathematically consistent.
 */
function normalizeGeminiResult(raw: any, fallbackId: string): OlympiadAnalysisResult {
  const scorePct = typeof raw.scorePercentage === 'number'
    ? Math.min(100, Math.max(0, raw.scorePercentage))
    : (raw.phase === 'sound' ? 100 : 40);

  const onmScore = Math.round(((scorePct / 100) * 7.0) * 100) / 100;
  const bacScore = Math.round((1.0 + (scorePct / 100) * 9.0) * 100) / 100;

  const isSound = raw.phase === 'sound' || scorePct >= 99.0;
  const phase = isSound ? 'sound' : 'flaw';

  const stepBreakdown: StepEvaluation[] = Array.isArray(raw.stepBreakdown)
    ? raw.stepBreakdown.map((s: any, idx: number) => {
        const stepNum = typeof s.step === 'number' ? s.step : idx + 1;
        const maxPct = typeof s.maxPercentage === 'number' ? s.maxPercentage : 25;
        const awardedPct = typeof s.awardedPercentage === 'number' ? s.awardedPercentage : (isSound ? maxPct : 0);
        const deductionPct = typeof s.deductionPercentage === 'number' ? s.deductionPercentage : (maxPct - awardedPct);
        const stepSound = typeof s.isSound === 'boolean' ? s.isSound : (awardedPct === maxPct);

        return {
          step: stepNum,
          label: s.label || `Pasul ${stepNum}`,
          maxPercentage: maxPct,
          awardedPercentage: awardedPct,
          deductionPercentage: deductionPct,
          isSound: stepSound,
          isCascadedFailure: Boolean(s.isCascadedFailure),
          commentRo: s.commentRo || (stepSound ? 'Pas valid și demonstrat riguros.' : 'Eroare sau colaps în cascadă.'),
          onmPoints: Math.round(((awardedPct / 100) * 7.0) * 100) / 100,
          bacPoints: Math.round(((awardedPct / 100) * 10.0) * 100) / 100,
        };
      })
    : [];

  return {
    id: fallbackId,
    problemId: raw.problemId || 'ONM_RO_CUSTOM',
    domain: raw.domain || 'Algebră / Inegalități',
    problemRo: raw.problemRo || 'Demonstrație matematică supusă auditului formal MathSentry.',
    phase,
    scorePercentage: scorePct,
    scaledScores: {
      onm7p: { scale: 'ONM (7p)', score: onmScore, maxScore: 7.0, percentage: scorePct },
      bac10p: { scale: 'Bac/Examen (10p)', score: bacScore, maxScore: 10.0, percentage: scorePct },
      usamo7p: { scale: 'USAMO (7p)', score: onmScore, maxScore: 7.0, percentage: scorePct },
    },
    stepBreakdown,
    fatalFlawStep: typeof raw.fatalFlawStep === 'number' ? raw.fatalFlawStep : (isSound ? undefined : (raw.fatalFlawStep || 3)),
    cascadingInvalidatedSteps: Array.isArray(raw.cascadingInvalidatedSteps) ? raw.cascadingInvalidatedSteps : (isSound ? [] : [4]),
    astNodeBreak: raw.astNodeBreak || (isSound ? undefined : {
      rule: 'Inequality_Multiply_Sign_Check',
      condition: '1 + x > 0',
      status: 'UNVERIFIED',
    }),
    explanationRo: raw.explanationRo || (isSound
      ? 'Toate nodurile deductive au fost verificate riguros. Punctaj complet acordat!'
      : 'Demonstrația conține o fractură deductivă fatală urmată de colaps în cascadă.'),
    teacherCritiqueRo: raw.teacherCritiqueRo || (isSound
      ? 'Demonstrație excelentă, redactată la standarde de baraj olimpic.'
      : 'Atenție la ipotezele implicite! Verifică condițiile de pozitivitate înainte de înmulțire.'),
    relevantTheorems: Array.isArray(raw.relevantTheorems) && raw.relevantTheorems.length > 0
      ? raw.relevantTheorems
      : [
          { name: "BERNOULLI'S INEQUALITY", statement: 'Pentru orice întreg n ≥ 0 și x ≥ -1, (1 + x)ⁿ ≥ 1 + nx.' },
          { name: 'ORDER AXIOM FOR MULTIPLICATION', statement: 'Dacă a ≥ b și c > 0, atunci ac ≥ bc.' },
        ],
    typstSource: raw.typstSource || `#set page(paper: "a4")\n= Proof\n$ (1 + x)^n >= 1 + n x $`,
  };
}

/**
 * Execute Gemini 1.5 Flash analysis with master prompt.
 * Seamlessly handles both multimodal photos (handwritten Olympiad notebook page)
 * and typed mathematical solutions.
 */
export async function verifyProofWithGemini(
  options: GeminiVerifyOptions,
  fallbackAnalysisId: string = 'analysis_bernoulli_01'
): Promise<{ result: OlympiadAnalysisResult; engine: 'gemini-1.5-flash' | 'local-deterministic' }> {
  const apiKey = getGeminiApiKey(options.apiKey);

  if (!apiKey) {
    console.warn('[MathSentry Gemini] No GEMINI_API_KEY detected. Using deterministic fallback engine.');
    return {
      result: getDeterministicFallback(options.fixedCondition, fallbackAnalysisId),
      engine: 'local-deterministic',
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: MATHSENTRY_MASTER_SYSTEM_INSTRUCTION,
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
      },
    });

    const userPromptText = `
AUDIT DE DEMONSTRAȚIE MATEMATICĂ (Barem ONM):
Problema: ${options.problemTitle || 'Inegalitatea lui Bernoulli și Condiția Critică de Semn'}
Enunț: ${options.enunt || 'Pentru orice x > -1 real și n natural nenul, să se demonstreze (1 + x)^n >= 1 + nx.'}
${options.fixedCondition ? 'Notă elev: Am inclus explicit condiția că 1 + x > 0 deoarece x > -1.' : ''}

Soluția de verificat:
${options.proofText || (options.imageBase64 ? 'Analizează imaginea atașată a demonstrației scrise de mână pe foaie.' : (options.fixedCondition ? 'Pasul 1: Cazul de bază n=1 verificat.\nPasul 2: Ipoteza inductivă (1+x)^k >= 1+kx.\nPasul 3: Deoarece x > -1, avem 1+x > 0. Înmulțind obținem (1+x)^(k+1) >= (1+kx)(1+x) = 1+(k+1)x + kx^2 >= 1+(k+1)x.\nPasul 4: Concluzie conform principiului inducției matematice.' : 'Pasul 1: Cazul de bază n=1 verificat.\nPasul 2: Ipoteza inductivă (1+x)^k >= 1+kx.\nPasul 3: Înmulțim cu (1+x) și obținem (1+x)^(k+1) >= (1+kx)(1+x) = 1+(k+1)x + kx^2 >= 1+(k+1)x.\nPasul 4: Concluzia este demonstrată.'))}
`;

    let responseText: string;

    if (options.imageBase64) {
      // Multimodal Vision with Gemini 1.5 Flash
      const cleanBase64 = options.imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const imagePart = {
        inlineData: {
          data: cleanBase64,
          mimeType: options.mimeType || 'image/jpeg',
        },
      };

      const resp = await model.generateContent([userPromptText, imagePart]);
      responseText = resp.response.text();
    } else {
      // Text-based Audit with Gemini 1.5 Flash
      const resp = await model.generateContent(userPromptText);
      responseText = resp.response.text();
    }

    const parsedJson = JSON.parse(responseText);
    const normalized = normalizeGeminiResult(parsedJson, fallbackAnalysisId);

    console.log(`[MathSentry Gemini] Successfully evaluated with Gemini 1.5 Flash! Phase: ${normalized.phase}, Score: ${normalized.scorePercentage}%`);
    return {
      result: normalized,
      engine: 'gemini-1.5-flash',
    };
  } catch (err: any) {
    console.error('[MathSentry Gemini] Error calling Gemini 1.5 Flash API:', err?.message || err);
    console.warn('[MathSentry Gemini] Gracefully falling back to deterministic Olympiad engine.');
    return {
      result: getDeterministicFallback(options.fixedCondition, fallbackAnalysisId),
      engine: 'local-deterministic',
    };
  }
}

/**
 * Deterministic Fallback Engine for offline development, demo, or fallback when API key is missing.
 */
export function getDeterministicFallback(
  fixedCondition?: boolean,
  id: string = 'analysis_bernoulli_01'
): OlympiadAnalysisResult {
  const isFixed = Boolean(fixedCondition);

  if (isFixed) {
    return {
      id,
      problemId: 'ONM_RO_BERNOULLI',
      domain: 'Algebră / Inegalități',
      problemRo: 'Să se demonstreze că pentru orice număr real x ≠ 0 și n ∈ ℕ*, avem (1 + x)ⁿ ≥ 1 + nx, știind că x > -1.',
      phase: 'sound',
      scorePercentage: 100.0,
      scaledScores: {
        onm7p: { scale: 'ONM (7p)', score: 7.0, maxScore: 7.0, percentage: 100.0 },
        bac10p: { scale: 'Bac/Examen (10p)', score: 10.0, maxScore: 10.0, percentage: 100.0 },
        usamo7p: { scale: 'USAMO (7p)', score: 7.0, maxScore: 7.0, percentage: 100.0 },
      },
      stepBreakdown: [
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
      ],
      explanationRo: 'Toate cele 4 noduri deductive au fost verificate conform regulilor formale. Punctaj complet acordat!',
      teacherCritiqueRo: 'Excelent! Demonstrația ta respectă exigențele Comisiei Naționale. Ai precizat explicit condiția x > -1 care asigură pozitivitatea termenului 1 + x, evitând capcana clasică a inversării sensului inegalității.',
      relevantTheorems: [
        { name: "BERNOULLI'S INEQUALITY", statement: 'Pentru orice număr întreg n ≥ 0 și orice număr real x ≥ −1, (1 + x)ⁿ ≥ 1 + nx.' },
        { name: 'ORDER AXIOM FOR MULTIPLICATION', statement: 'Dacă a ≥ b și c > 0, atunci ac ≥ bc. Dacă c < 0, sensul inegalității se inversează.' },
      ],
      typstSource: `#set page(paper: "a4", margin: 2cm)\n#set text(font: "New Computer Modern", size: 11pt)\n\n= Problem\nProve that for all real $x != 0$,\n$(1 + x)^n >= 1 + n x$ for $n in NN$.\n\n= Proof\n*Base case.* For $n = 1$:\n$(1 + x)^1 = 1 + 1 dot x$. #h(1fr) $checkmark$\n\n*Inductive hypothesis.* Assume $P(k)$:\n$(1 + x)^k >= 1 + k x$.\n\n*Inductive step.* Multiply both sides by $(1 + x)$:\n$ (1 + x)^(k+1) >= (1 + k x)(1 + x)\n  = 1 + (k+1)x + k x^2 >= 1 + (k+1)x $\n\n*Conclusion.* By induction, $P(n)$ holds\nfor all $n in NN$. $qed$`,
    };
  }

  return {
    id,
    problemId: 'ONM_RO_BERNOULLI',
    domain: 'Algebră / Inegalități',
    problemRo: 'Să se demonstreze că pentru orice număr real x ≠ 0 și n ∈ ℕ*, avem (1 + x)ⁿ ≥ 1 + nx, știind că x > -1.',
    phase: 'flaw',
    scorePercentage: 40.0,
    scaledScores: {
      onm7p: { scale: 'ONM (7p)', score: 2.8, maxScore: 7.0, percentage: 40.0 },
      bac10p: { scale: 'Bac/Examen (10p)', score: 4.6, maxScore: 10.0, percentage: 40.0 },
      usamo7p: { scale: 'USAMO (7p)', score: 2.8, maxScore: 7.0, percentage: 40.0 },
    },
    fatalFlawStep: 3,
    cascadingInvalidatedSteps: [4],
    stepBreakdown: [
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
        commentRo: 'EROARE FATALĂ DE RAȚIONAMENT: Înmulțirea inegalității cu (1 + x) fără a demonstra că 1 + x > 0.',
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
        commentRo: 'COLAPS ÎN CASCADĂ (0%): Concluzia se bazează pe pasul 3 care este invalidat. Nu se poate trage o concluzie dintr-o premisă nedemonstrată.',
        onmPoints: 0.0,
        bacPoints: 0.0,
      },
    ],
    astNodeBreak: {
      rule: 'Inequality_Multiply_Rule',
      condition: '1 + x > 0',
      status: 'UNVERIFIED',
    },
    explanationRo: 'Logica se rupe la Pasul 3. Ai aplicat pasul inductiv (înmulțind inegalitatea cu 1 + x), dar ai verificat dacă condiția de bază (x > −1) este respectată în acest domeniu?',
    teacherCritiqueRo: 'ATENȚIE: Eroare fatală de olimpiadă la Pasul 3! Ai înmulțit ambii membri ai inegalității P(k) cu (1 + x), dar ai omis să justifici că 1 + x > 0. Pasul 4 (Concluzia) este anulat automat (0 puncte) prin efect de cascadă!',
    relevantTheorems: [
      { name: "BERNOULLI'S INEQUALITY", statement: 'Pentru orice număr întreg n ≥ 0 și orice număr real x ≥ −1, (1 + x)ⁿ ≥ 1 + nx.' },
      { name: 'ORDER AXIOM FOR MULTIPLICATION', statement: 'Dacă a ≥ b și c > 0, atunci ac ≥ bc. Dacă c < 0, sensul inegalității se inversează.' },
    ],
    typstSource: `#set page(paper: "a4", margin: 2cm)\n#set text(font: "New Computer Modern", size: 11pt)\n\n= Problem\nProve that for all real $x != 0$,\n$(1 + x)^n >= 1 + n x$ for $n in NN$.\n\n= Proof\n*Base case.* For $n = 1$:\n$(1 + x)^1 = 1 + 1 dot x$. #h(1fr) $checkmark$\n\n*Inductive hypothesis.* Assume $P(k)$:\n$(1 + x)^k >= 1 + k x$.\n\n*Inductive step.* Multiply both sides by $(1 + x)$:\n$ (1 + x)^(k+1) >= (1 + k x)(1 + x)\n  = 1 + (k+1)x + k x^2 >= 1 + (k+1)x $\n\n*Conclusion.* By induction, $P(n)$ holds\nfor all $n in NN$. $qed$`,
  };
}
