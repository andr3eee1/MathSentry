import { Request, Response } from 'express';
import { OlympiadAnalysisResult } from '../types/olympiad';

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

export const analyzeProof = (req: Request, res: Response): void => {
  const { fixedCondition } = req.body;
  const isFixed = Boolean(fixedCondition);

  if (isFixed) {
    // Sound State: 100% full credit across all scales (7.0 / 7p ONM)
    const result: OlympiadAnalysisResult = {
      id: 'analysis_sound_01',
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
      teacherCritiqueRo:
        'Excelent! Demonstrația ta respectă exigențele Comisiei Naționale. Ai precizat explicit condiția x > -1 care asigură pozitivitatea termenului 1 + x, evitând capcana clasică a inversării sensului inegalității.',
      relevantTheorems: [
        {
          name: "BERNOULLI'S INEQUALITY",
          statement:
            'Pentru orice întreg n ≥ 0 și orice număr real x ≥ −1, (1 + x)ⁿ ≥ 1 + nx.',
        },
      ],
      typstSource: TYPST_BERNOULLI,
    };
    res.json(result);
  } else {
    // Cascading Failure State:
    // Step 3 commits a fatal deductive flaw -> Step 4 collapses to 0%!
    // Total awarded: 15% + 25% + 0% + 0% = 40.0% (2.80 / 7.0p ONM)
    const result: OlympiadAnalysisResult = {
      id: 'analysis_flaw_cascading_01',
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
          commentRo:
            'EROARE FATALĂ DE RAȚIONAMENT: Înmulțirea inegalității cu (1 + x) fără a demonstra că 1 + x > 0. Termenul de înmulțire poate fi negativ.',
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
      ],
      astNodeBreak: {
        rule: 'Inequality_Multiply_Rule',
        condition: '1 + x > 0',
        status: 'UNVERIFIED',
      },
      explanationRo:
        "Logica se rupe la Pasul 3. Ai aplicat pasul inductiv (înmulțind inegalitatea cu 1 + x), dar ai verificat dacă condiția de bază (x > −1) este respectată în acest domeniu?",
      teacherCritiqueRo:
        "ATENȚIE: Eroare fatală de olimpiadă la Pasul 3! Ai înmulțit ambii membri ai inegalității P(k) cu (1 + x), dar ai omis să justifici că 1 + x > 0. Într-o demonstrație de olimpiadă, dacă acest pas pică, lanțul deductiv se rupe complet. Prin urmare, Pasul 4 (Concluzia) este anulat automat (0 puncte) prin efect de cascadă! Contraexemplu: dacă x = -2, atunci 1 + x = -1 < 0, iar înmulțirea inversează semnul inegalității. Pentru a repara demonstrația, trebuie să invoci explicit ipoteza x > -1 înainte de înmulțire.",
      relevantTheorems: [
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
      ],
      typstSource: TYPST_BERNOULLI,
    };
    res.json(result);
  }
};
