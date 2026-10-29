import { useState } from 'react';
import {
  ArrowRight,
  Check,
  AlertTriangle,
  FileCode2,
  Plus,
  Minus,
  Menu,
  X,
  CornerDownRight,
  Copy,
  RotateCcw,
  Pencil,
  Scale,
  BookOpen,
} from 'lucide-react';

// TODO: replace with real address
const CONTACT_EMAIL = 'contact@mathsentry.ro';
const APP_URL: string = import.meta.env.VITE_APP_URL || '#download';
const WAITLIST_URL = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
  'MathSentry waitlist',
)}&body=${encodeURIComponent('Please add me to the MathSentry waitlist.')}`;

interface ProofStep {
  step: number;
  title: string;
  weightPct: number;
  pointsMax: number;
  formula: string;
  explanation: string;
  dependsOn: string;
  isFlawStep?: boolean;
  fixedFormula?: string;
  fixedExplanation?: string;
}

interface OlympiadProblemSpec {
  id: string;
  code: string;
  competition: string;
  domain: string;
  title: string;
  statement: string;
  violatedRule: string;
  missingCondition: string;
  canonicalJustification: string;
  juryCritiqueFlaw: string;
  juryCritiqueSound: string;
  steps: ProofStep[];
  typstSource: string;
}

const PROBLEMS: OlympiadProblemSpec[] = [
  {
    id: 'bernoulli',
    code: 'BERNOULLI · INDUCTION',
    competition: 'National Olympiad (7.00p Scale)',
    domain: 'Algebra · Inequalities',
    title: "Bernoulli's Inequality & Sign Preservation",
    statement:
      'Let x ∈ ℝ with x > −1 and n ∈ ℕ*. Prove by mathematical induction that (1 + x)ⁿ ≥ 1 + nx.',
    violatedRule: 'Order_Compatibility_Multiplication',
    missingCondition: '1 + x > 0  (derived from x > −1)',
    canonicalJustification:
      'Since x > −1 by hypothesis, 1 + x > 0; multiplying by (1 + x) preserves the inequality direction.',
    juryCritiqueFlaw:
      'Step 3 multiplies both sides of P(k) by (1 + x) without establishing that 1 + x > 0. If 1 + x < 0, the inequality reverses. Under Olympiad grading rules, Step 3 receives 0.00 / 3.15p and Step 4 collapses by cascade (0.00 / 1.05p).',
    juryCritiqueSound:
      'All deductive dependencies hold. Explicitly invoking x > −1 ⇒ 1 + x > 0 prior to multiplying P(k) justifies preservation of the ≥ relation. Full 7.00 / 7.00p awarded.',
    steps: [
      {
        step: 1,
        title: 'Base Case (n = 1)',
        weightPct: 15,
        pointsMax: 1.05,
        formula: '(1 + x)¹ = 1 + 1·x ≥ 1 + x',
        explanation: 'Holds with equality for all real x.',
        dependsOn: 'Axiom: Reflexivity of ≥',
      },
      {
        step: 2,
        title: 'Inductive Hypothesis P(k)',
        weightPct: 25,
        pointsMax: 1.75,
        formula: 'Assume (1 + x)ᵏ ≥ 1 + kx for fixed k ∈ ℕ*',
        explanation: 'Formally states the inductive premise for n = k.',
        dependsOn: 'Premise: Step §1',
      },
      {
        step: 3,
        title: 'Inductive Transition P(k) ⇒ P(k+1)',
        weightPct: 45,
        pointsMax: 3.15,
        isFlawStep: true,
        formula:
          'Multiply P(k) by (1 + x): (1 + x)ᵏ⁺¹ ≥ (1 + kx)(1 + x) = 1 + (k+1)x + kx² ≥ 1 + (k+1)x',
        explanation:
          'Drops kx² ≥ 0, but omits verification of the sign of (1 + x) before multiplying the inequality.',
        fixedFormula:
          'Since x > −1 ⇒ 1 + x > 0, multiply P(k) by (1 + x): (1 + x)ᵏ⁺¹ ≥ (1 + kx)(1 + x) = 1 + (k+1)x + kx² ≥ 1 + (k+1)x',
        fixedExplanation:
          'Positivity of multiplier (1 + x > 0) and non-negativity of kx² ≥ 0 are both explicitly established.',
        dependsOn: 'Step §2 + Order Axiom (c > 0)',
      },
      {
        step: 4,
        title: 'Conclusion by Mathematical Induction',
        weightPct: 15,
        pointsMax: 1.05,
        formula: '∀ n ∈ ℕ*, (1 + x)ⁿ ≥ 1 + nx  ∎',
        explanation:
          'Closes the induction chain from §1 and §3.',
        dependsOn: 'Conjunction: §1 ∧ (§2 ⇒ §3)',
      },
    ],
    typstSource: `#set page(paper: "a4", margin: 2.2cm)
#set text(font: "New Computer Modern", size: 11pt)

= Problem (Bernoulli's Inequality)
Let $x in RR$ with $x > -1$ and $n in NN^*$.
Prove by induction that $(1 + x)^n >= 1 + n x$.

= Proof
*Step 1 (Base case).* For $n = 1$:
$(1 + x)^1 = 1 + 1 dot x$. #h(1fr) $checkmark$

*Step 2 (Inductive hypothesis).* Assume $P(k)$ holds for fixed $k in NN^*$:
$ (1 + x)^k >= 1 + k x $

*Step 3 (Inductive step).* Since $x > -1$, we have $1 + x > 0$.
Multiplying $P(k)$ by the positive factor $(1 + x)$ preserves direction:
$ (1 + x)^(k+1) >= (1 + k x)(1 + x)
  = 1 + (k + 1)x + k x^2 >= 1 + (k + 1)x $
since $k x^2 >= 0$ for all $x in RR$.

*Step 4 (Conclusion).* By Mathematical Induction, $P(n)$ holds for all $n in NN^*$. $qed$`,
  },
  {
    id: 'cauchy',
    code: 'CAUCHY–SCHWARZ',
    competition: 'USAMO / Olympiad (7.00p Scale)',
    domain: 'Algebra · Quadratic Forms',
    title: 'Cauchy–Schwarz via Quadratic Discriminant',
    statement:
      'For any real sequences (a₁, …, aₙ) and (b₁, …, bₙ), prove that (∑ aᵢ²)(∑ bᵢ²) ≥ (∑ aᵢbᵢ)².',
    violatedRule: 'Quadratic_NonDegenerate_Leading_Coeff',
    missingCondition: 'Case A = ∑ aᵢ² = 0 must be handled before Δ ≤ 0',
    canonicalJustification:
      'If A = ∑ aᵢ² = 0, then all aᵢ = 0 and both sides equal 0. Otherwise A > 0, so f(t) is strictly quadratic and Δ ≤ 0 applies.',
    juryCritiqueFlaw:
      'Step 3 treats f(t) = At² + 2Bt + C as a degree-2 polynomial without checking whether the leading coefficient A = ∑ aᵢ² vanishes. Also writes strict inequality Δ < 0 instead of Δ ≤ 0.',
    juryCritiqueSound:
      'Separating the degenerate case A = 0 from A > 0 makes the discriminant argument airtight. Full 7.00 / 7.00p awarded.',
    steps: [
      {
        step: 1,
        title: 'Auxiliary Sum of Squares',
        weightPct: 20,
        pointsMax: 1.4,
        formula: 'Define f(t) = ∑ᵢ₌₁ⁿ (aᵢt + bᵢ)² ≥ 0 for all t ∈ ℝ',
        explanation: 'A sum of real squares is non-negative everywhere.',
        dependsOn: 'Axiom: ∀ u ∈ ℝ, u² ≥ 0',
      },
      {
        step: 2,
        title: 'Polynomial Expansion in t',
        weightPct: 20,
        pointsMax: 1.4,
        formula: 'f(t) = At² + 2Bt + C, where A = ∑ aᵢ², B = ∑ aᵢbᵢ, C = ∑ bᵢ²',
        explanation: 'Collects coefficients by powers of t.',
        dependsOn: 'Linearity of finite sums (§1)',
      },
      {
        step: 3,
        title: 'Discriminant Bound on f(t) ≥ 0',
        weightPct: 45,
        pointsMax: 3.15,
        isFlawStep: true,
        formula: 'Since f(t) ≥ 0 for all t ∈ ℝ, its discriminant satisfies Δ′ = B² − AC ≤ 0',
        explanation:
          'Applies the quadratic discriminant theorem without ruling out A = 0 (when f(t) is constant, not quadratic).',
        fixedFormula:
          'Case 1: If A = 0, each aᵢ = 0 ⇒ B = 0, so 0 ≤ 0. Case 2: If A > 0, f is degree 2 and f(t) ≥ 0 ⇒ Δ′ = B² − AC ≤ 0',
        fixedExplanation:
          'Handles the degenerate leading-coefficient case A = 0 explicitly before invoking the quadratic discriminant sign.',
        dependsOn: 'Step §2 + Non-zero Leading Coefficient',
      },
      {
        step: 4,
        title: 'Conclusion',
        weightPct: 15,
        pointsMax: 1.05,
        formula: 'B² ≤ AC  ⇔  (∑ aᵢbᵢ)² ≤ (∑ aᵢ²)(∑ bᵢ²)  ∎',
        explanation: 'Rearranges Δ′ ≤ 0 into the target inequality.',
        dependsOn: 'Step §3',
      },
    ],
    typstSource: `#set page(paper: "a4", margin: 2.2cm)
#set text(font: "New Computer Modern", size: 11pt)

= Problem (Cauchy-Schwarz Inequality)
Let $a_1, ..., a_n$ and $b_1, ..., b_n$ be real numbers. Prove that:
$ (sum_(i=1)^n a_i^2)(sum_(i=1)^n b_i^2) >= (sum_(i=1)^n a_i b_i)^2 $

= Proof
*Step 1.* Consider the real function $f(t) = sum_(i=1)^n (a_i t + b_i)^2 >= 0$ for all $t in RR$.

*Step 2.* Expanding the square yields $f(t) = A t^2 + 2 B t + C$, where
$A = sum a_i^2$, $B = sum a_i b_i$, and $C = sum b_i^2$.

*Step 3.*
- *Case 1 ($A = 0$):* Then $a_i = 0$ for all $i$, so $B = 0$ and both sides equal $0$.
- *Case 2 ($A > 0$):* $f(t)$ is a quadratic with positive leading coefficient. Since $f(t) >= 0$ for all $t in RR$, its reduced discriminant satisfies $Delta' = B^2 - A C <= 0$.

*Step 4.* Therefore $B^2 <= A C$, completing the proof. $qed$`,
  },
  {
    id: 'polynomial',
    code: 'POLYNOMIALS ℤ[X]',
    competition: 'Olympiad Shortlist (7.00p Scale)',
    domain: 'Number Theory · Algebra',
    title: 'Integer Roots of Odd-Valued Polynomials',
    statement:
      'Let P(X) ∈ ℤ[X] be a polynomial with integer coefficients such that P(0) and P(1) are both odd integers. Prove that P(X) has no integer roots.',
    violatedRule: 'Exhaustive_Parity_Contradiction',
    missingCondition: 'Must evaluate divisibility at X = 1: (a − 1) | P(1)',
    canonicalJustification:
      'Evaluating at X = 1 gives P(1) = −(1 − a)Q(1). Since P(1) is odd, (a − 1) is odd, so a is even — contradicting that a is odd.',
    juryCritiqueFlaw:
      'Step 3 correctly deduces that any integer root a must be odd from P(0) = −aQ(0), but Step 4 jumps to the conclusion without using the hypothesis that P(1) is odd.',
    juryCritiqueSound:
      'Complete parity contradiction: P(0) odd forces a to be odd, while P(1) odd forces a − 1 to be odd (so a is even). Full 7.00 / 7.00p awarded.',
    steps: [
      {
        step: 1,
        title: 'Reductio ad Absurdum Setup',
        weightPct: 15,
        pointsMax: 1.05,
        formula: 'Suppose there exists an integer root a ∈ ℤ such that P(a) = 0',
        explanation: 'Introduces the integer root assumption for contradiction.',
        dependsOn: 'Hypothesis: P(X) ∈ ℤ[X]',
      },
      {
        step: 2,
        title: 'Factorization in ℤ[X]',
        weightPct: 25,
        pointsMax: 1.75,
        formula: 'P(X) = (X − a)·Q(X) for some polynomial Q(X) ∈ ℤ[X]',
        explanation: 'By Bezout’s Theorem over ℤ[X], (X − a) divides P(X).',
        dependsOn: 'Step §1 + Divisibility in ℤ[X]',
      },
      {
        step: 3,
        title: 'Parity Evaluation at X = 0 and X = 1',
        weightPct: 45,
        pointsMax: 3.15,
        isFlawStep: true,
        formula: 'At X = 0: P(0) = −a·Q(0). Since P(0) is odd, a is odd.',
        explanation:
          'Uses P(0) odd to show a is odd, but never invokes the second hypothesis that P(1) is odd.',
        fixedFormula:
          'At X = 0: P(0) = −aQ(0) odd ⇒ a is odd. At X = 1: P(1) = (1 − a)Q(1) odd ⇒ (1 − a) is odd ⇒ a is even.',
        fixedExplanation:
          'Uses both hypotheses P(0) odd and P(1) odd to derive that a must be simultaneously odd and even.',
        dependsOn: 'Step §2 + Parity of P(0) and P(1)',
      },
      {
        step: 4,
        title: 'Contradiction & Final Verdict',
        weightPct: 15,
        pointsMax: 1.05,
        formula: 'Contradiction (a odd ∧ a even) ⇒ ¬∃ a ∈ ℤ with P(a) = 0  ∎',
        explanation: 'No integer can be both odd and even.',
        dependsOn: 'Step §3',
      },
    ],
    typstSource: `#set page(paper: "a4", margin: 2.2cm)
#set text(font: "New Computer Modern", size: 11pt)

= Problem (Integer Roots of Polynomials)
Let $P(X) in ZZ[X]$ such that $P(0)$ and $P(1)$ are odd integers.
Prove that $P$ has no integer roots.

= Proof
*Step 1.* Suppose for contradiction that there exists $a in ZZ$ with $P(a) = 0$.

*Step 2.* Since $P(X) in ZZ[X]$, we can factor $P(X) = (X - a) Q(X)$ where $Q(X) in ZZ[X]$.

*Step 3.*
- Evaluating at $X = 0$: $P(0) = -a Q(0)$. Since $P(0)$ is odd, its divisor $a$ must be odd.
- Evaluating at $X = 1$: $P(1) = (1 - a) Q(1)$. Since $P(1)$ is odd, its divisor $(1 - a)$ must be odd, which implies $a$ is even.

*Step 4.* Thus $a$ is both odd and even, a contradiction. Hence $P(X)$ has no integer roots. $qed$`,
  },
];

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeProblemIdx, setActiveProblemIdx] = useState(0);
  const [workbenchTab, setWorkbenchTab] = useState<'audit' | 'ast' | 'typst'>('audit');
  const [stepFixed, setStepFixed] = useState(false);
  const [customJustification, setCustomJustification] = useState('');
  const [inlineEditorOpen, setInlineEditorOpen] = useState(false);
  const [copiedTypst, setCopiedTypst] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const activeProblem = PROBLEMS[activeProblemIdx];
  const isSound = stepFixed || customJustification.trim().length > 8;

  const totalOnmScore = isSound
    ? 7.0
    : activeProblem.steps
        .filter((s) => !s.isFlawStep && s.step < 3)
        .reduce((acc, s) => acc + s.pointsMax, 0);

  const totalPct = Math.round((totalOnmScore / 7.0) * 100);
  const bacScore = (1.0 + (totalPct / 100) * 9.0).toFixed(2);

  const handleSelectProblem = (idx: number) => {
    setActiveProblemIdx(idx);
    setStepFixed(false);
    setCustomJustification('');
    setInlineEditorOpen(false);
  };

  const handleCopyTypst = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(activeProblem.typstSource);
      setCopiedTypst(true);
      setTimeout(() => setCopiedTypst(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans antialiased">
      {/* =========================================================================
          EDITORIAL TOP NAVIGATION BAR
         ========================================================================= */}
      <header className="sticky top-0 z-50 bg-canvas/95 backdrop-blur-sm border-b border-rule">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Monogram */}
          <a href="#" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-ink flex items-center justify-center">
              <span className="font-math text-ivory text-lg font-medium leading-none select-none">
                ∑
              </span>
            </div>
            <div>
              <span className="font-math font-medium text-xl tracking-tight text-ink block leading-none">
                MathSentry
              </span>
              <span className="font-mono text-[9.5px] tracking-widest text-graphite uppercase block mt-0.5">
                AI Proof Grader
              </span>
            </div>
          </a>

          {/* Section Links */}
          <nav className="hidden md:flex items-center gap-7 font-mono text-xs text-graphite">
            <a href="#workbench" className="hover:text-ink transition-colors">
              §1 Interactive Workbench
            </a>
            <a href="#cascading" className="hover:text-ink transition-colors">
              §2 Cascading Rubric
            </a>
            <a href="#pipeline" className="hover:text-ink transition-colors">
              §3 Pipeline
            </a>
            <a href="#pricing" className="hover:text-ink transition-colors">
              §4 Pricing
            </a>
            <a href="#faq" className="hover:text-ink transition-colors">
              §5 FAQ
            </a>
          </nav>

          {/* Primary Action */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href={APP_URL}
              className="inline-flex items-center gap-2 px-4 py-2 rounded bg-ink text-ivory text-xs font-mono font-medium hover:bg-primary transition-colors"
            >
              <span>Open the App</span>
              <ArrowRight size={13} />
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-3 -mr-2 text-ink"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-ivory border-b border-rule px-6 py-4 flex flex-col gap-3 font-mono text-xs text-ink">
            <a href="#workbench" className="py-1.5" onClick={() => setMobileMenuOpen(false)}>
              §1 Interactive Workbench
            </a>
            <a href="#cascading" className="py-1.5" onClick={() => setMobileMenuOpen(false)}>
              §2 Cascading Rubric
            </a>
            <a href="#pipeline" className="py-1.5" onClick={() => setMobileMenuOpen(false)}>
              §3 Pipeline
            </a>
            <a href="#pricing" className="py-1.5" onClick={() => setMobileMenuOpen(false)}>
              §4 Pricing
            </a>
            <a href="#faq" className="py-1.5" onClick={() => setMobileMenuOpen(false)}>
              §5 FAQ
            </a>
            <a
              href={APP_URL}
              className="mt-2 inline-flex items-center justify-center gap-2 py-2.5 rounded bg-ink text-ivory font-semibold"
            >
              <span>Open the App</span>
              <ArrowRight size={13} />
            </a>
          </div>
        )}
      </header>

      {/* =========================================================================
          SECTION 1: EDITORIAL MONOGRAPH HERO + LIVE MULTI-PROBLEM WORKBENCH
         ========================================================================= */}
      <section id="workbench" className="pt-12 pb-20 sm:pt-16 sm:pb-24 border-b border-rule">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Editorial Header Block */}
          <div className="max-w-3xl mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-stone border border-rule font-mono text-[11px] text-primary uppercase tracking-wider mb-5">
              <span>AI-ASSISTED PROOF GRADER · ONM &amp; BAC</span>
            </div>

            <h1 className="font-math text-4xl sm:text-6xl font-normal tracking-tight text-ink leading-[1.1] mb-5">
              A mathematical proof is only as strong as its{' '}
              <span className="italic text-flaw underline decoration-flaw/30 underline-offset-4">
                first unverified premise.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-graphite leading-relaxed max-w-2xl mb-7">
              Photograph a handwritten notebook page or enter a competition
              solution. MathSentry's AI transcribes the argument into LaTeX, breaks
              it into steps, looks for omitted domain or sign conditions, and
              grades it under olympiad cascading-failure rules. Try it free
              with 5 audits a day, no account needed.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={APP_URL}
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded bg-ink text-ivory text-sm font-medium hover:bg-primary transition-colors"
              >
                <span>Audit a Proof in the App</span>
                <ArrowRight size={16} />
              </a>
              <a
                href="#cascading"
                className="inline-flex items-center gap-2 px-5 py-3 rounded bg-ivory border border-rule text-sm font-medium text-ink hover:bg-stone transition-colors"
              >
                <span>Read the Grading Specification</span>
              </a>
            </div>
          </div>

          {/* LIVE INTERACTIVE MULTI-PROBLEM WORKBENCH */}
          <div className="bg-ivory border border-rule rounded-lg overflow-hidden shadow-sm">
            {/* Workbench Top Bar: Problem Selector + View Mode */}
            <div className="bg-stone/70 border-b border-rule px-4 sm:px-6 py-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              {/* Problem Switcher */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-mono text-[10px] uppercase tracking-wider text-graphite mr-2">
                  DOSSIER:
                </span>
                {PROBLEMS.map((prob, idx) => {
                  const active = idx === activeProblemIdx;
                  return (
                    <button
                      key={prob.id}
                      onClick={() => handleSelectProblem(idx)}
                      className={`px-3 py-1.5 rounded text-xs font-mono transition-colors border ${
                        active
                          ? 'bg-ink text-ivory border-ink font-medium'
                          : 'bg-ivory text-graphite border-rule hover:text-ink'
                      }`}
                    >
                      {prob.code}
                    </button>
                  );
                })}
              </div>

              {/* View Mode Switcher */}
              <div className="flex flex-wrap items-center gap-1 bg-canvas p-1 rounded border border-rule self-start lg:self-auto">
                <button
                  onClick={() => setWorkbenchTab('audit')}
                  className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                    workbenchTab === 'audit'
                      ? 'bg-ivory text-ink font-medium border border-rule shadow-2xs'
                      : 'text-graphite hover:text-ink'
                  }`}
                >
                  01 Deductive Audit
                </button>
                <button
                  onClick={() => setWorkbenchTab('ast')}
                  className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                    workbenchTab === 'ast'
                      ? 'bg-ivory text-ink font-medium border border-rule shadow-2xs'
                      : 'text-graphite hover:text-ink'
                  }`}
                >
                  02 AST Graph
                </button>
                <button
                  onClick={() => setWorkbenchTab('typst')}
                  className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                    workbenchTab === 'typst'
                      ? 'bg-ivory text-ink font-medium border border-rule shadow-2xs'
                      : 'text-graphite hover:text-ink'
                  }`}
                >
                  03 proof.typ
                </button>
              </div>
            </div>

            {/* Workbench Body Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-rule">
              {/* Left 8 Columns: Manuscript / AST / Typst View */}
              <div className="lg:col-span-8 p-5 sm:p-7">
                {/* Problem Statement Header */}
                <div className="mb-6">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-[11px] text-primary uppercase tracking-wider font-medium">
                      §1 · PROBLEM STATEMENT ({activeProblem.domain})
                    </span>
                    <span className="font-mono text-[11px] text-graphite">
                      {activeProblem.competition}
                    </span>
                  </div>
                  <div className="border-l-2 border-primary bg-canvas px-4 py-3 rounded-r">
                    <p className="font-math text-lg sm:text-xl text-ink leading-snug">
                      {activeProblem.statement}
                    </p>
                  </div>
                </div>

                {workbenchTab === 'audit' && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-[11px] text-graphite uppercase tracking-wider">
                        §2 · STEP-BY-STEP DEDUCTIVE AUDIT
                      </span>
                      <span className="font-mono text-[11px] text-graphite">
                        Click Step §3 to inspect or edit premise
                      </span>
                    </div>

                    {/* Left Deductive Rail List */}
                    <div className="space-y-0">
                      {activeProblem.steps.map((s, index) => {
                        const isLast = index === activeProblem.steps.length - 1;
                        const isFlaw = Boolean(s.isFlawStep) && !isSound;
                        const isCascaded = !isSound && s.step > 3;
                        const stepValid = !isFlaw && !isCascaded;

                        return (
                          <div key={s.step} className="flex items-stretch">
                            {/* Left Gutter Rail */}
                            <div className="w-14 shrink-0 flex flex-col items-center pr-3">
                              <div
                                className={`w-8 h-6 rounded text-xs font-mono font-medium flex items-center justify-center border ${
                                  stepValid
                                    ? 'bg-success-soft text-success border-success/30'
                                    : isFlaw
                                    ? 'bg-flaw text-ivory border-flaw'
                                    : 'bg-stone text-graphite border-rule border-dashed'
                                }`}
                              >
                                §{s.step}
                              </div>
                              <span
                                className={`font-mono text-[10px] mt-1 ${
                                  stepValid ? 'text-success' : 'text-flaw'
                                }`}
                              >
                                {stepValid
                                  ? `+${s.pointsMax.toFixed(2)}p`
                                  : '0.00p'}
                              </span>
                              {!isLast && (
                                <div
                                  className={`flex-1 w-px my-1.5 min-h-[18px] ${
                                    stepValid && !(s.step === 2 && !isSound)
                                      ? 'bg-rule'
                                      : 'border-l-2 border-dashed border-flaw/60'
                                  }`}
                                />
                              )}
                            </div>

                            {/* Right Step Box */}
                            <div className="flex-1 pb-3.5">
                              {stepValid && (
                                <div className="p-3.5 rounded border border-rule-light bg-ivory">
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className="font-mono text-[11px] text-graphite uppercase font-medium">
                                      STEP {s.step} · {s.title}
                                    </span>
                                    <span className="inline-flex items-center gap-1 font-mono text-[10px] text-success bg-success-soft px-2 py-0.5 rounded">
                                      <Check size={11} strokeWidth={2.5} />
                                      Sound ({s.weightPct}%)
                                    </span>
                                  </div>
                                  <p className="font-math text-base sm:text-lg text-ink leading-snug">
                                    {s.isFlawStep && isSound
                                      ? customJustification.trim()
                                        ? `${customJustification.trim()} ⇒ ${s.formula}`
                                        : s.fixedFormula
                                      : s.formula}
                                  </p>
                                  <p className="text-xs text-graphite mt-1">
                                    {s.isFlawStep && isSound
                                      ? s.fixedExplanation
                                      : s.explanation}
                                  </p>
                                </div>
                              )}

                              {isFlaw && (
                                <div className="p-4 rounded border border-flaw/40 border-l-4 border-l-flaw bg-flaw-soft">
                                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                                    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-flaw uppercase font-semibold">
                                      <AlertTriangle size={13} />
                                      STEP {s.step} · {s.title}
                                    </span>
                                    <span className="font-mono text-[10px] text-flaw bg-flaw/10 px-2 py-0.5 rounded font-semibold">
                                      −{s.pointsMax.toFixed(2)}p · UNVERIFIED PREMISE
                                    </span>
                                  </div>

                                  <p className="font-math text-base sm:text-lg text-ink leading-snug">
                                    {s.formula}
                                  </p>
                                  <p className="text-xs text-flaw mt-1">
                                    {s.explanation}
                                  </p>

                                  {/* AST Diagnostic Ledger */}
                                  <div className="mt-3 p-3 rounded bg-ivory border border-rule font-mono text-xs space-y-1.5">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                      <span className="text-graphite w-36 shrink-0">
                                        VIOLATED RULE:
                                      </span>
                                      <span className="text-primary font-medium">
                                        {activeProblem.violatedRule}
                                      </span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                      <span className="text-graphite w-36 shrink-0">
                                        MISSING PREMISE:
                                      </span>
                                      <span className="text-flaw font-medium">
                                        {activeProblem.missingCondition}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Interactive Fix Controls */}
                                  <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <button
                                      onClick={() => setStepFixed(true)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-ink text-ivory text-xs font-mono font-medium hover:bg-primary transition-colors"
                                    >
                                      <Check size={12} />
                                      <span>Attach Canonical Premise</span>
                                    </button>
                                    <button
                                      onClick={() =>
                                        setInlineEditorOpen(!inlineEditorOpen)
                                      }
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-ivory border border-rule text-ink text-xs font-mono hover:bg-stone transition-colors"
                                    >
                                      <Pencil size={12} />
                                      <span>
                                        {inlineEditorOpen
                                          ? 'Hide Inline Editor'
                                          : 'Write Justification Manually'}
                                      </span>
                                    </button>
                                  </div>

                                  {inlineEditorOpen && (
                                    <div className="mt-3 p-3 rounded bg-ivory border border-rule">
                                      <label className="block font-mono text-[10px] text-graphite uppercase mb-1.5">
                                        TYPE MISSING JUSTIFICATION FOR STEP §3 (MIN. 9 CHARS TO RE-GRADE):
                                      </label>
                                      <input
                                        type="text"
                                        value={customJustification}
                                        onChange={(e) =>
                                          setCustomJustification(e.target.value)
                                        }
                                        placeholder={
                                          activeProblem.canonicalJustification
                                        }
                                        className="w-full px-3 py-2 rounded bg-canvas border border-rule font-math text-sm text-ink focus:outline-none focus:border-primary"
                                      />
                                    </div>
                                  )}
                                </div>
                              )}

                              {isCascaded && (
                                <div className="p-3.5 rounded border border-dashed border-rule bg-canvas/70 opacity-75">
                                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                                    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-graphite uppercase">
                                      <CornerDownRight size={12} />
                                      STEP {s.step} · {s.title}
                                    </span>
                                    <span className="font-mono text-[10px] text-flaw bg-stone px-2 py-0.5 rounded font-medium">
                                      CASCADING INVALIDATION (0.00p)
                                    </span>
                                  </div>
                                  <p className="font-math text-base text-graphite leading-snug">
                                    {s.formula}
                                  </p>
                                  <p className="text-xs text-graphite mt-1">
                                     invalidated automatically because it relies
                                    on Step §3, which lacks a verified premise.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {workbenchTab === 'ast' && (
                  <div className="bg-canvas bg-paper-grid border border-rule rounded p-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-xs font-medium text-ink">
                        DIRECTED DEDUCTIVE AST · {activeProblem.code}
                      </span>
                      <span className="font-mono text-[11px] text-graphite">
                        4 Nodes · {isSound ? '0 Unverified Edges' : '1 Broken Edge'}
                      </span>
                    </div>

                    <div className="space-y-3 font-mono text-xs">
                      {activeProblem.steps.map((s) => {
                        const broken = Boolean(s.isFlawStep) && !isSound;
                        const cascaded = !isSound && s.step > 3;
                        return (
                          <div
                            key={s.step}
                            className={`p-3.5 rounded border ${
                              broken
                                ? 'bg-flaw-soft border-flaw text-ink'
                                : cascaded
                                ? 'bg-stone/60 border-dashed border-rule text-graphite'
                                : 'bg-ivory border-rule text-ink'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold">
                                Node §{s.step}: {s.title}
                              </span>
                              <span
                                className={
                                  broken || cascaded
                                    ? 'text-flaw font-semibold'
                                    : 'text-success font-semibold'
                                }
                              >
                                {broken
                                  ? 'STATUS: UNVERIFIED_PREMISE'
                                  : cascaded
                                  ? 'STATUS: CASCADED_NULL'
                                  : 'STATUS: SOUND'}
                              </span>
                            </div>
                            <div className="text-[11px] text-graphite">
                              Depends on: <span className="text-ink">{s.dependsOn}</span>
                            </div>
                            {s.isFlawStep && (
                              <div className="mt-2 pt-2 border-t border-rule text-[11px] flex items-center justify-between">
                                <span>
                                  Guard condition:{' '}
                                  <strong className="text-primary">
                                    {activeProblem.missingCondition}
                                  </strong>
                                </span>
                                <button
                                  onClick={() => setStepFixed(!stepFixed)}
                                  className="underline text-primary font-medium"
                                >
                                  {isSound ? 'Remove premise' : 'Assert premise'}
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {workbenchTab === 'typst' && (
                  <div className="bg-ink text-ivory rounded p-5 font-mono text-xs">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-ivory/15">
                      <span className="text-ivory/70">
                        proof.typ — Auto-generated Typst manuscript
                      </span>
                      <button
                        onClick={handleCopyTypst}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-ivory/10 hover:bg-ivory/20 text-ivory text-[11px] transition-colors"
                      >
                        <Copy size={12} />
                        <span>{copiedTypst ? 'Copied!' : 'Copy .typ'}</span>
                      </button>
                    </div>
                    <pre className="overflow-x-auto leading-relaxed text-ivory/90 whitespace-pre-wrap">
                      {activeProblem.typstSource}
                    </pre>
                  </div>
                )}
              </div>

              {/* Right 4 Columns: Official Rubric Ledger & Commission Remarks */}
              <div className="lg:col-span-4 p-5 sm:p-7 bg-canvas/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[11px] text-graphite uppercase tracking-wider">
                      §3 · OFFICIAL GRADING RUBRIC
                    </span>
                    {isSound && (
                      <button
                        onClick={() => {
                          setStepFixed(false);
                          setCustomJustification('');
                        }}
                        className="inline-flex items-center gap-1 font-mono text-[10px] text-primary hover:underline"
                      >
                        <RotateCcw size={11} />
                        Reset to flawed state
                      </button>
                    )}
                  </div>

                  {/* Score Ledger Box */}
                  <div className="bg-ivory border border-rule rounded p-4 mb-5">
                    <div className="flex items-baseline justify-between pb-3 mb-3 border-b border-rule-light">
                      <span className="font-mono text-xs text-graphite">
                        OLYMPIAD SCALE (7.00p)
                      </span>
                      <span
                        className={`font-mono text-2xl font-semibold ${
                          isSound ? 'text-success' : 'text-flaw'
                        }`}
                      >
                        {totalOnmScore.toFixed(2)}{' '}
                        <span className="text-xs font-normal text-graphite">
                          / 7.00p
                        </span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                      <div className="bg-canvas p-2.5 rounded border border-rule-light">
                        <span className="text-[10px] text-graphite block">
                          BACCALAUREATE (10p)
                        </span>
                        <span className="font-semibold text-ink">
                          {bacScore} / 10.0p
                        </span>
                      </div>
                      <div className="bg-canvas p-2.5 rounded border border-rule-light">
                        <span className="text-[10px] text-graphite block">
                          SCORE
                        </span>
                        <span
                          className={`font-semibold ${
                            isSound ? 'text-success' : 'text-flaw'
                          }`}
                        >
                          {totalPct}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Step Point Breakdown Table */}
                  <div className="bg-ivory border border-rule rounded overflow-hidden mb-5">
                    <div className="px-3.5 py-2 bg-stone/60 border-b border-rule font-mono text-[10px] text-graphite uppercase flex justify-between">
                      <span>Step Breakdown</span>
                      <span>Awarded / Max</span>
                    </div>
                    <div className="divide-y divide-rule-light font-mono text-xs">
                      {activeProblem.steps.map((s) => {
                        const stepValid =
                          isSound || (!s.isFlawStep && s.step < 3);
                        return (
                          <div
                            key={s.step}
                            className="px-3.5 py-2 flex items-center justify-between"
                          >
                            <span className="text-ink truncate pr-2">
                              §{s.step} {s.title}
                            </span>
                            <span
                              className={
                                stepValid
                                  ? 'text-success font-medium shrink-0'
                                  : 'text-flaw font-medium shrink-0'
                              }
                            >
                              {stepValid ? s.pointsMax.toFixed(2) : '0.00'} /{' '}
                              {s.pointsMax.toFixed(2)}p
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Commission Verdict Note */}
                  <div className="bg-ivory border border-rule rounded p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Scale size={14} className="text-primary" />
                      <span className="font-mono text-[10px] uppercase tracking-wider font-semibold text-ink">
                        GRADING COMMISSION CRITIQUE
                      </span>
                    </div>
                    <p className="font-math italic text-sm text-ink leading-relaxed">
                      “
                      {isSound
                        ? activeProblem.juryCritiqueSound
                        : activeProblem.juryCritiqueFlaw}
                      ”
                    </p>
                  </div>
                </div>

                {/* Bottom Action in Sidebar */}
                <div className="mt-6 pt-4 border-t border-rule">
                  {!isSound ? (
                    <button
                      onClick={() => setStepFixed(true)}
                      className="w-full py-2.5 px-4 rounded bg-ink text-ivory font-mono text-xs font-medium hover:bg-primary transition-colors flex items-center justify-center gap-2"
                    >
                      <Check size={14} />
                      <span>Supply Missing Premise &amp; Re-Grade</span>
                    </button>
                  ) : (
                    <a
                      href={APP_URL}
                      className="w-full py-2.5 px-4 rounded bg-primary text-ivory font-mono text-xs font-medium hover:bg-ink transition-colors flex items-center justify-center gap-2"
                    >
                      <span>Audit Your Own Proof in App</span>
                      <ArrowRight size={14} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: THE CASCADING FAILURE PRINCIPLE & GRADING SPECIFICATION
         ========================================================================= */}
      <section id="cascading" className="py-20 sm:py-24 border-b border-rule">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <span className="font-mono text-xs text-primary uppercase tracking-wider block mb-2">
                §2 · THE CASCADING FAILURE RULE
              </span>
              <h2 className="font-math text-3xl sm:text-4xl text-ink leading-tight mb-4">
                Why a right-looking final answer isn't a proof.
              </h2>
              <p className="text-sm sm:text-base text-graphite leading-relaxed mb-6">
                Generic chatbots can grade by surface similarity: if your final
                line matches the expected formula, they may overlook an
                unjustified division by a quantity that could be zero or an
                inequality multiplied by a term of unknown sign.
              </p>
              <p className="text-sm sm:text-base text-graphite leading-relaxed">
                MathSentry is built around the cascading-failure idea used in
                olympiad marking: a proof is a directed dependency chain. When Step{' '}
                <span className="font-math italic">k</span> fails, every
                downstream step <span className="font-math italic">j &gt; k</span>{' '}
                that relies on it is automatically invalidated.
              </p>
            </div>

            <div className="lg:col-span-7 bg-ivory border border-rule rounded-lg overflow-hidden">
              <div className="px-6 py-4 bg-stone/60 border-b border-rule flex items-center justify-between">
                <span className="font-mono text-xs font-medium text-ink">
                  COMPARISON OF EVALUATION METHODOLOGY
                </span>
                <span className="font-mono text-[11px] text-graphite">
                  OLYMPIAD STANDARD
                </span>
              </div>

              <div className="divide-y divide-rule text-sm">
                <div className="p-5 grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-4 font-mono text-xs text-ink font-medium">
                    01. Unjustified Premise at Step k
                  </div>
                  <div className="sm:col-span-4 text-xs text-graphite">
                    <strong className="text-ink block mb-0.5">
                      Standard AI Chatbots:
                    </strong>
                    May silently fill in the missing assumption for the
                    student or deduct a vague amount.
                  </div>
                  <div className="sm:col-span-4 text-xs text-ink bg-canvas p-3 rounded border border-rule-light">
                    <strong className="text-primary font-mono block mb-0.5">
                      MathSentry Engine:
                    </strong>
                    Aims to flag the violated rule (e.g.,{' '}
                    <code className="font-mono">1 + x &gt; 0</code> unverified)
                    and assigns 0 points to Step k.
                  </div>
                </div>

                <div className="p-5 grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-4 font-mono text-xs text-ink font-medium">
                    02. Downstream Conclusion (Step j &gt; k)
                  </div>
                  <div className="sm:col-span-4 text-xs text-graphite">
                    <strong className="text-ink block mb-0.5">
                      Standard AI Chatbots:
                    </strong>
                    May award conclusion points because the final equation
                    looks correct.
                  </div>
                  <div className="sm:col-span-4 text-xs text-ink bg-canvas p-3 rounded border border-rule-light">
                    <strong className="text-primary font-mono block mb-0.5">
                      MathSentry Engine:
                    </strong>
                    Applies <strong>Cascading Failure</strong>: downstream steps
                    dependent on Step k receive 0.00p.
                  </div>
                </div>

                <div className="p-5 grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-4 font-mono text-xs text-ink font-medium">
                    03. Multi-Scale Rubric Conversion
                  </div>
                  <div className="sm:col-span-4 text-xs text-graphite">
                    <strong className="text-ink block mb-0.5">
                      Standard AI Chatbots:
                    </strong>
                    Often qualitative prose without a structured rubric.
                  </div>
                  <div className="sm:col-span-4 text-xs text-ink bg-canvas p-3 rounded border border-rule-light">
                    <strong className="text-primary font-mono block mb-0.5">
                      MathSentry Engine:
                    </strong>
                    Assigns step weights on the ONM (7.00p) and
                    Baccalaureate (10.0p) scales.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: THREE-STAGE FORMAL PIPELINE
         ========================================================================= */}
      <section id="pipeline" className="py-20 sm:py-24 border-b border-rule bg-ivory">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-14">
            <span className="font-mono text-xs text-primary uppercase tracking-wider block mb-2">
              §3 · SYSTEM ARCHITECTURE
            </span>
            <h2 className="font-math text-3xl sm:text-4xl text-ink leading-tight">
              From handwritten notebook page to a clean Typst manuscript.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stage 1 */}
            <div className="bg-canvas border border-rule rounded-lg p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between font-mono text-xs text-graphite pb-3 mb-4 border-b border-rule">
                  <span>STAGE 01</span>
                  <span className="text-primary">OPTICAL → LaTeX</span>
                </div>
                <h3 className="font-math text-xl text-ink mb-2">
                  Symbolic Transcription
                </h3>
                <p className="text-sm text-graphite leading-relaxed mb-6">
                  Extracts problem statements and multi-line handwritten proofs
                  from competition sheets, normalizing quantifiers, subscripts,
                  and domain restrictions into structured LaTeX.
                </p>
              </div>
              <div className="bg-ivory border border-rule rounded p-3 font-mono text-[11px] text-ink">
                <span className="text-graphite block mb-1">
                  // Extracted clause
                </span>
                ∀ x ∈ ℝ, x &gt; −1, n ∈ ℕ* : (1 + x)ⁿ ≥ 1 + nx
              </div>
            </div>

            {/* Stage 2 */}
            <div className="bg-canvas border border-rule rounded-lg p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between font-mono text-xs text-graphite pb-3 mb-4 border-b border-rule">
                  <span>STAGE 02</span>
                  <span className="text-primary">DEDUCTIVE AST</span>
                </div>
                <h3 className="font-math text-xl text-ink mb-2">
                  Premise &amp; Guard Auditing
                </h3>
                <p className="text-sm text-graphite leading-relaxed mb-6">
                  Decomposes the proof into numbered inference nodes, checking
                  every algebraic operation against its domain guards (non-zero
                  divisors, sign conditions, induction base cases).
                </p>
              </div>
              <div className="bg-ivory border border-rule rounded p-3 font-mono text-[11px] text-flaw">
                <span className="text-graphite block mb-1">
                  // Guard violation
                </span>
                Rule: Mult_Inequality :: Guard [1 + x &gt; 0] UNVERIFIED
              </div>
            </div>

            {/* Stage 3 */}
            <div className="bg-canvas border border-rule rounded-lg p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between font-mono text-xs text-graphite pb-3 mb-4 border-b border-rule">
                  <span>STAGE 03</span>
                  <span className="text-primary">TYPST &amp; RUBRIC</span>
                </div>
                <h3 className="font-math text-xl text-ink mb-2">
                  Commission Critique &amp; Typesetting
                </h3>
                <p className="text-sm text-graphite leading-relaxed mb-6">
                  Produces teacher-style feedback with relevant theorems and
                  exports your proof as a clean Typst (<code className="font-mono">.typ</code>)
                  document.
                </p>
              </div>
              <div className="bg-ivory border border-rule rounded p-3 font-mono text-[11px] text-success">
                <span className="text-graphite block mb-1">
                  // Output target
                </span>
                #set page(paper: &quot;a4&quot;) · 7.00 / 7.00p
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: PRICING
         ========================================================================= */}
      <section id="pricing" className="py-20 sm:py-24 border-b border-rule bg-ivory">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-12">
            <span className="font-mono text-xs text-primary uppercase tracking-wider block mb-2">
              §4 · PRICING
            </span>
            <h2 className="font-math text-3xl sm:text-4xl text-ink leading-tight">
              Start free. No account required.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Oaspete',
                tag: 'Guest',
                lead: '5 audits / day',
                items: ['No account needed', 'Photo or typed proofs', 'ONM 7p and Bac 10p scores'],
                cta: 'Try as guest',
                href: APP_URL,
                soon: false,
              },
              {
                name: 'Gratuit',
                tag: 'Free account',
                lead: '20 audits / day',
                items: ['Everything in Oaspete', 'History synced across devices', 'Personal problem bank'],
                cta: 'Create a free account',
                href: APP_URL,
                soon: false,
              },
              {
                name: 'Pro',
                tag: 'În curând',
                lead: 'Unlimited audits',
                items: ['Priority grading', 'PDF / Typst export', 'Everything in Gratuit'],
                cta: 'Join the waitlist',
                href: '#download',
                soon: true,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`bg-canvas border rounded-lg p-6 flex flex-col ${
                  plan.soon ? 'border-rule border-dashed' : 'border-rule'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-xs text-graphite pb-3 mb-4 border-b border-rule">
                  <span className="uppercase tracking-wider">{plan.tag}</span>
                  {plan.soon && (
                    <span className="px-2 py-0.5 rounded bg-warning-soft text-warning border border-warning/30">
                      În curând
                    </span>
                  )}
                </div>
                <h3 className="font-math text-2xl text-ink mb-1">{plan.name}</h3>
                <p className="font-mono text-sm text-primary mb-5">{plan.lead}</p>
                <ul className="space-y-2 mb-8 text-sm text-graphite">
                  {plan.items.map((it) => (
                    <li key={it} className="flex items-start gap-2">
                      <Check size={14} className="mt-1 shrink-0 text-success" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={plan.href}
                  className={`mt-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded text-sm font-mono font-medium transition-colors ${
                    plan.soon
                      ? 'bg-ivory border border-rule text-ink hover:bg-stone'
                      : 'bg-ink text-ivory hover:bg-primary'
                  }`}
                >
                  <span>{plan.cta}</span>
                  <ArrowRight size={14} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: FAQ
         ========================================================================= */}
      <section id="faq" className="scroll-mt-16 py-20 sm:py-24 border-b border-rule">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <span className="font-mono text-xs text-primary uppercase tracking-wider block mb-2">
              §5 · FAQ
            </span>
            <h2 className="font-math text-3xl sm:text-4xl text-ink">
              Frequently asked questions
            </h2>
          </div>

          <div className="divide-y divide-rule border-y border-rule">
            {[
              {
                q: 'Does MathSentry generate full solutions to unattempted problems?',
                a: 'No. MathSentry is an AI proof grader, not a homework solver. You provide a handwritten or typed proof attempt; it audits your steps, points to the first step that looks broken, and lets you revise and re-grade your argument.',
              },
              {
                q: 'How does the cascading failure rubric calculate points?',
                a: 'Each step in the deductive chain is assigned a percentage weight totaling 100% (scaled to 7.00p for IMO/USAMO/ONM or 10.0p for Baccalaureate). If Step k contains a fatal logical flaw, Step k and any subsequent step j > k that depends on Step k receive 0 points.',
              },
              {
                q: 'Can I maintain my own bank of Olympiad problems?',
                a: 'Yes. The app includes a personal problem bank where you can add problems by typing or scanning a page and attach multiple proof attempts to each.',
              },
              {
                q: 'What platforms are supported?',
                a: 'MathSentry is a mobile app built with Expo for iOS and Android. Store releases are coming soon; join the waitlist below to be notified.',
              },
              {
                q: 'Can the AI grader be wrong?',
                a: 'Yes. MathSentry is AI-assisted and can make mistakes: it may miss a gap, flag a valid step, or misread handwriting. It is a study aid, not an official grade or a formal proof checker. Always check important results with your teacher.',
              },
              {
                q: 'How many free audits do I get?',
                a: 'Guests get 5 audits per day without an account. A free account raises that to 20 per day and syncs your history across devices.',
              },
            ].map((item, idx) => {
              const open = activeFaq === idx;
              return (
                <div key={idx} className="py-5">
                  <button
                    onClick={() => setActiveFaq(open ? null : idx)}
                    className="w-full text-left flex items-center justify-between gap-4"
                  >
                    <span className="font-math text-lg sm:text-xl text-ink">
                      {item.q}
                    </span>
                    <span className="h-6 w-6 rounded border border-rule bg-ivory flex items-center justify-center shrink-0 text-graphite">
                      {open ? <Minus size={14} /> : <Plus size={14} />}
                    </span>
                  </button>
                  {open && (
                    <p className="mt-3 text-sm sm:text-base text-graphite leading-relaxed pr-8">
                      {item.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: DOWNLOAD / WAITLIST
         ========================================================================= */}
      <section id="download" className="py-20 sm:py-24 border-b border-rule scroll-mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <span className="font-mono text-xs text-primary uppercase tracking-wider block mb-2">
            §6 · DOWNLOAD
          </span>
          <h2 className="font-math text-3xl sm:text-4xl text-ink leading-tight mb-4">
            Coming soon to the App Store and Google Play.
          </h2>
          <p className="text-sm sm:text-base text-graphite leading-relaxed max-w-2xl mb-6">
            MathSentry is a mobile app for iOS and Android. Join the waitlist
            and we will email you when it is available, and when Pro launches.
          </p>
          <a
            href={WAITLIST_URL}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded bg-ink text-ivory text-sm font-medium hover:bg-primary transition-colors"
          >
            <span>Join the waitlist by email</span>
            <ArrowRight size={16} />
          </a>
          <p className="mt-3 font-mono text-xs text-graphite">{CONTACT_EMAIL}</p>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: ARCHIVAL FOOTER & WORKSPACE LAUNCH
         ========================================================================= */}
      <footer className="py-16 bg-ivory">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="p-8 sm:p-12 rounded-lg bg-canvas border border-rule flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span className="font-mono text-[11px] text-primary uppercase tracking-wider block mb-2">
                OPEN WORKSPACE
              </span>
              <h2 className="font-math text-2xl sm:text-4xl text-ink mb-2">
                Inspect your next proof before the grading commission does.
              </h2>
              <p className="text-sm text-graphite">
                Guests get 5 free audits a day, no account needed.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <a
                href={APP_URL}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded bg-ink text-ivory text-sm font-mono font-medium hover:bg-primary transition-colors"
              >
                <BookOpen size={15} />
                <span>Launch MathSentry</span>
                <ArrowRight size={15} />
              </a>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-rule flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-graphite">
            <div className="flex items-center gap-2">
              <FileCode2 size={14} className="text-ink" />
              <span>MathSentry · AI proof grader for ONM &amp; Bac</span>
            </div>
            <span>© 2026 MathSentry · Built for rigorous mathematical writing.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
