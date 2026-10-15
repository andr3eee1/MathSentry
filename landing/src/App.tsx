import { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Check,
  X,
  Zap,
  Camera,
  GitBranch,
  ShieldCheck,
  Brain,
  FileCode2,
  Star,
  Plus,
  Minus,
  Menu,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [interactiveStepFixed, setInteractiveStepFixed] = useState(false);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const marqueeItems = [
    'Induction',
    'Real Analysis',
    'ε–δ limits',
    'Linear Algebra',
    'Number Theory',
    'Group Theory',
    'Combinatorics',
    'Inequalities',
    'Topology',
    'Calculus',
  ];

  return (
    <div className="min-h-screen bg-canvas text-slate-900 font-sans antialiased overflow-x-hidden selection:bg-primary selection:text-white">
      {/* =========================================================================
          SECTION A: TRANSPARENT HERO HEADER
         ========================================================================= */}
      <header className="sticky top-0 z-50 w-full bg-transparent transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <span className="font-math text-white text-lg font-medium leading-none select-none">
                ∑
              </span>
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">
              MathSentry
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-200">
            <a
              href="#how"
              className="hover:text-white transition-colors"
            >
              How it works
            </a>
            <a
              href="#features"
              className="hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="#comparison"
              className="hover:text-white transition-colors"
            >
              Why MathSentry
            </a>
            <a
              href="#pricing"
              className="hover:text-white transition-colors"
            >
              Pricing
            </a>
            <a
              href="#faq"
              className="hover:text-white transition-colors"
            >
              FAQ
            </a>
          </nav>

          {/* Header Action Button */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/app"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-semibold bg-white text-slate-deep hover:bg-slate-100 hover:opacity-95 transition-all shadow-sm"
            >
              Launch app
            </a>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-200 hover:text-white focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-deep/95 backdrop-blur-md border-b border-slate-700/80 px-6 py-5 flex flex-col gap-4 text-sm font-medium text-slate-200 animate-fadeIn">
            <a
              href="#how"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-white py-1"
            >
              How it works
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-white py-1"
            >
              Features
            </a>
            <a
              href="#comparison"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-white py-1"
            >
              Why MathSentry
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-white py-1"
            >
              Pricing
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-white py-1"
            >
              FAQ
            </a>
            <div className="pt-2 border-t border-slate-700/80">
              <a
                href="/app"
                className="w-full text-center inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-semibold bg-white text-slate-deep hover:bg-slate-100 transition-all"
              >
                Launch app
              </a>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          SECTION B: HERO SECTION
         ========================================================================= */}
      <section className="relative -mt-20 bg-slate-deep overflow-hidden pt-32 pb-24 md:pt-40 md:pb-32 text-white">
        {/* Radial masked bg-grid background */}
        <div
          className="absolute inset-0 bg-grid opacity-75 pointer-events-none"
          style={{
            maskImage:
              'radial-gradient(ellipse 80% 60% at 50% 20%, black 40%, transparent 100%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 80% 60% at 50% 20%, black 40%, transparent 100%)',
          }}
        />

        {/* 900x600 glow orb top center */}
        <div
          className="glow-orb absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Copy & CTAs */}
            <div className="lg:col-span-7 flex flex-col items-start">
              {/* Pill Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-6">
                <Sparkles size={14} className="text-warning animate-pulse" />
                <span className="text-xs sm:text-sm font-medium tracking-wide text-slate-200">
                  Logic-tree analysis · not answer generation
                </span>
              </div>

              {/* Headline with 'one weak step.' on its own new line */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-white leading-[1.12] mb-6">
                Your proof has
                <br />
                <span className="text-gradient font-math italic font-normal">
                  one weak step.
                </span>
                <br />
                We'll find it.
              </h1>

              {/* Subheading Paragraph */}
              <p className="max-w-xl text-lg sm:text-xl text-slate-300/90 leading-relaxed font-normal mb-8">
                Photograph a handwritten proof. MathSentry rebuilds its logic as
                a tree, checks every dependency, and lights up the exact line
                that doesn't hold — with a hint, never the answer.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-10">
                <a
                  href="/app"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-base font-semibold bg-primary text-white shadow-indigo hover:opacity-95 hover:shadow-indigo-lg transition-all active:scale-[0.98]"
                >
                  <span>Analyze a proof free</span>
                  <ArrowRight size={18} />
                </a>
                <a
                  href="#how"
                  className="inline-flex items-center justify-center px-7 py-3.5 rounded-full text-base font-medium text-slate-200 border border-slate-600 hover:border-slate-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  See how it works
                </a>
              </div>

              {/* Trust Factor */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill="currentColor"
                      strokeWidth={0}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-slate-300">
                  Loved by students in 40+ universities
                </span>
              </div>
            </div>

            {/* Right Column: Interactive Proof Mockup Card */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="w-full max-w-md animate-floaty relative">
                {/* Main Card Container */}
                <div className="relative bg-white text-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-indigo overflow-hidden">
                  {/* Vertical Scanline Beam Overlay */}
                  <div
                    className="absolute left-0 right-0 h-16 scanline-bar pointer-events-none animate-scanline z-10 opacity-70"
                    aria-hidden="true"
                  />

                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-500 font-medium">
                        bernoulli_induction.jpg
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border transition-colors ${
                        interactiveStepFixed
                          ? 'bg-success-soft text-success border-emerald-200'
                          : 'bg-flaw-soft text-flaw border-red-200'
                      }`}
                    >
                      {interactiveStepFixed ? 'All steps verified ✓' : '1 flaw found'}
                    </span>
                  </div>

                  {/* 4 Proof Lines in Editorial Serif Math Font */}
                  <div className="space-y-3 font-math text-base sm:text-lg">
                    {/* Line 1 */}
                    <div className="flex items-start gap-3 p-2.5 rounded-xl bg-success-soft/60 border border-emerald-100/80 transition-all">
                      <div className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <div className="text-slate-800 leading-snug">
                        <span className="text-xs font-sans font-semibold text-emerald-800 block mb-0.5">
                          Step 1 · Base Hypothesis
                        </span>
                        Let <span className="italic">x</span> ∈ ℝ,{' '}
                        <span className="italic">n</span> ∈ ℕ
                      </div>
                    </div>

                    {/* Line 2 */}
                    <div className="flex items-start gap-3 p-2.5 rounded-xl bg-success-soft/60 border border-emerald-100/80 transition-all">
                      <div className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <div className="text-slate-800 leading-snug">
                        <span className="text-xs font-sans font-semibold text-emerald-800 block mb-0.5">
                          Step 2 · Induction Hypothesis
                        </span>
                        Assume (1 + <span className="italic">x</span>)
                        <sup className="text-xs">n</sup> ≥ 1 +{' '}
                        <span className="italic">n</span>
                        <span className="italic">x</span>
                      </div>
                    </div>

                    {/* Line 3: The Flawed Step with Pulse Ring */}
                    <div
                      onClick={() => setInteractiveStepFixed(!interactiveStepFixed)}
                      className={`group cursor-pointer relative flex items-start gap-3 p-2.5 rounded-xl border transition-all ${
                        interactiveStepFixed
                          ? 'bg-success-soft/60 border-emerald-100/80'
                          : 'bg-flaw-soft border-red-300 animate-pulse-ring'
                      }`}
                    >
                      <div
                        className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          interactiveStepFixed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-flaw text-white'
                        }`}
                      >
                        {interactiveStepFixed ? (
                          <Check size={12} strokeWidth={3} />
                        ) : (
                          <X size={12} strokeWidth={3} />
                        )}
                      </div>
                      <div className="flex-1 text-slate-900 leading-snug">
                        <div className="flex items-center justify-between mb-0.5">
                          <span
                            className={`text-xs font-sans font-semibold ${
                              interactiveStepFixed
                                ? 'text-emerald-800'
                                : 'text-flaw'
                            }`}
                          >
                            {interactiveStepFixed
                              ? 'Step 3 · Verified condition'
                              : 'Step 3 · Logical Gap'}
                          </span>
                          <span className="text-[10px] font-sans text-slate-400 group-hover:text-primary">
                            tap to toggle fix
                          </span>
                        </div>
                        {interactiveStepFixed ? (
                          <span>
                            Since 1 + <span className="italic">x</span> &gt; 0,
                            multiply both sides by (1 +{' '}
                            <span className="italic">x</span>)
                          </span>
                        ) : (
                          <span>
                            Multiply both sides by (1 +{' '}
                            <span className="italic">x</span>)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Line 4 */}
                    <div
                      className={`flex items-start gap-3 p-2.5 rounded-xl border border-slate-100 transition-opacity ${
                        interactiveStepFixed
                          ? 'bg-success-soft/40 opacity-100'
                          : 'bg-slate-50 opacity-50'
                      }`}
                    >
                      <div className="h-5 w-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-sans font-bold">
                        {interactiveStepFixed ? (
                          <Check size={12} className="text-emerald-600" />
                        ) : (
                          '4'
                        )}
                      </div>
                      <div className="text-slate-800 leading-snug">
                        <span className="text-xs font-sans font-semibold text-slate-500 block mb-0.5">
                          Step 4 · Conclusion
                        </span>
                        ∴ (1 + <span className="italic">x</span>)
                        <sup className="text-xs">n+1</sup> ≥ 1 + (
                        <span className="italic">n</span>+1)
                        <span className="italic">x</span>
                      </div>
                    </div>
                  </div>

                  {/* Socratic Hint Box */}
                  <div className="mt-4 p-3 rounded-2xl bg-warning-soft border border-amber-300 text-slate-800 flex items-start gap-2.5">
                    <Lightbulb
                      size={18}
                      className="text-amber-600 shrink-0 mt-0.5"
                    />
                    <p className="text-xs font-sans leading-relaxed text-amber-950 font-normal">
                      <strong className="font-semibold text-amber-900">
                        Socratic Hint:
                      </strong>{' '}
                      multiplying an inequality preserves direction only if the
                      factor is positive. What must be true about 1 +{' '}
                      <span className="font-math italic">x</span>?
                    </p>
                  </div>
                </div>

                {/* Floating Badge at bottom-left */}
                <div className="absolute -bottom-4 -left-4 sm:-bottom-5 sm:-left-6 bg-slate-deep text-white px-4 py-2.5 rounded-2xl border border-slate-600/80 shadow-xl flex items-center gap-2.5 z-20">
                  <div className="h-7 w-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Zap size={16} fill="currentColor" />
                  </div>
                  <div className="text-left">
                    <div className="text-[11px] text-slate-300 font-medium">
                      AST Graph Traversal
                    </div>
                    <div className="text-xs font-bold text-white tracking-tight">
                      Analyzed in 2.4s
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION C: LIGHT / WHITE MATH TOPICS MARQUEE
         ========================================================================= */}
      <section className="bg-white border-y border-slate-200/80 py-4 overflow-hidden select-none">
        <div className="flex w-[200%] animate-marquee">
          {/* Marquee Track Set 1 */}
          <div className="flex items-center gap-8 px-4 shrink-0 text-slate-800 font-math italic text-lg sm:text-xl tracking-wide">
            {marqueeItems.map((topic, index) => (
              <span key={index} className="flex items-center gap-8">
                <span className="hover:text-primary transition-colors cursor-default">
                  {topic}
                </span>
                <span className="text-primary not-italic text-sm">✦</span>
              </span>
            ))}
          </div>

          {/* Marquee Track Set 2 (Seamless loop duplicate) */}
          <div className="flex items-center gap-8 px-4 shrink-0 text-slate-800 font-math italic text-lg sm:text-xl tracking-wide">
            {marqueeItems.map((topic, index) => (
              <span key={`dup-${index}`} className="flex items-center gap-8">
                <span className="hover:text-primary transition-colors cursor-default">
                  {topic}
                </span>
                <span className="text-primary not-italic text-sm">✦</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION D: HOW IT WORKS (CLEAN & DIRECT)
         ========================================================================= */}
      <section id="how" className="py-24 sm:py-32 bg-canvas">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Title directly */}
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-slate-900 leading-tight text-center mb-20 sm:mb-24">
            From notebook to{' '}
            <span className="font-math italic text-primary">verdict</span> in
            seconds
          </h2>

          {/* 3 Icons connected with thin line and short descriptions */}
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 max-w-4xl mx-auto">
            {/* Connecting thin line for desktop */}
            <div
              className="hidden md:block absolute top-7 left-24 right-24 h-px bg-slate-200 z-0"
              aria-hidden="true"
            />

            {/* 01 Snap */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-primary flex items-center justify-center mb-5 shadow-sm">
                <Camera size={24} strokeWidth={2} />
              </div>
              <span className="font-mono text-xs font-bold text-slate-400 mb-1">
                01
              </span>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Snap
              </h3>
              <p className="text-slate-600 text-sm max-w-xs leading-relaxed">
                Photograph any page — messy handwriting welcome.
              </p>
            </div>

            {/* 02 Map */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-2xl bg-amber-50 border border-amber-100 text-warning flex items-center justify-center mb-5 shadow-sm">
                <GitBranch size={24} strokeWidth={2} />
              </div>
              <span className="font-mono text-xs font-bold text-slate-400 mb-1">
                02
              </span>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Map
              </h3>
              <p className="text-slate-600 text-sm max-w-xs leading-relaxed">
                Each line becomes a node linked to what it relies on.
              </p>
            </div>

            {/* 03 Verify */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-2xl bg-emerald-50 border border-emerald-100 text-success flex items-center justify-center mb-5 shadow-sm">
                <ShieldCheck size={24} strokeWidth={2} />
              </div>
              <span className="font-mono text-xs font-bold text-slate-400 mb-1">
                03
              </span>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Verify
              </h3>
              <p className="text-slate-600 text-sm max-w-xs leading-relaxed">
                Every link is checked. The weak one turns red.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION E: FEATURES (LIGHT SECTION, DARKER LOGIC TREE, SIMPLIFIED CARDS)
         ========================================================================= */}
      <section id="features" className="py-24 sm:py-32 bg-slate-50 border-t border-border-soft text-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Section Header */}
          <div className="max-w-2xl mb-16">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary block mb-3">
              FEATURES
            </span>
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-slate-900 leading-tight">
              Everything a proof needs. Nothing it doesn't.
            </h2>
          </div>

          {/* 3-Column Bento Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Large Bento Card: The Logic Tree (Darker card with math grid) */}
            <div className="lg:col-span-2 lg:row-span-2 bg-slate-deep text-white rounded-3xl p-8 sm:p-10 border border-slate-700/80 bg-grid relative overflow-hidden flex flex-col justify-between shadow-sm">
              <div>
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-6 border border-amber-500/20">
                  <GitBranch size={24} strokeWidth={2.2} />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                  The logic tree
                </h3>
                <p className="text-slate-300 text-base max-w-lg mb-8 leading-relaxed">
                  See your argument the way a professor does: every claim, every
                  dependency, every hidden assumption.
                </p>
              </div>

              {/* Visual Logic Tree Diagram */}
              <div className="bg-[#121826] rounded-2xl p-6 sm:p-8 border border-slate-700/60 font-mono text-xs sm:text-sm">
                <div className="flex flex-col items-center">
                  {/* Node 1: Hypothesis */}
                  <div className="px-5 py-2 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 shadow-sm">
                    [Hypothesis: x ∈ ℝ, n ∈ ℕ]
                  </div>

                  {/* Connecting Line */}
                  <div className="w-0.5 h-6 bg-slate-700 my-1" />

                  {/* Node 2 & 3: Steps */}
                  <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                    <div className="px-4 py-2 rounded-xl bg-slate-800/80 text-slate-300 border border-slate-700 text-center">
                      [Step 1: Base n=1]
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-slate-800/80 text-slate-300 border border-slate-700 text-center">
                      [Step 2: Induction Hyp]
                    </div>
                  </div>

                  {/* Connecting Line */}
                  <div className="w-0.5 h-6 bg-slate-700 my-1" />

                  {/* Node 4: Flaw with Pulsing Red Badge */}
                  <div className="px-5 py-2.5 rounded-xl bg-red-950/60 text-red-300 border border-red-500/80 flex items-center gap-2.5 animate-pulse-ring">
                    <AlertTriangle size={16} className="text-flaw" />
                    <span className="font-semibold">
                      [Step 3 — missing x &gt; −1]
                    </span>
                  </div>

                  {/* Connecting Line */}
                  <div className="w-0.5 h-6 border-l-2 border-dashed border-red-800/70 my-1" />

                  {/* Node 5: Dimmed Conclusion */}
                  <div className="px-5 py-2 rounded-xl bg-slate-900/40 text-slate-500 border border-dashed border-slate-800">
                    [Conclusion]
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Card 2: Hints, not handouts (Simplified, <= 9 words description) */}
            <div className="bg-white rounded-3xl p-8 border border-border-soft flex flex-col justify-between shadow-sm hover:border-slate-300 transition-colors">
              <div>
                <div className="h-12 w-12 rounded-xl bg-indigo-50 text-primary flex items-center justify-center mb-6 border border-indigo-100">
                  <Brain size={24} strokeWidth={2.2} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Hints, not handouts
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Socratic nudges that help you find the fix yourself.
                </p>
              </div>
            </div>

            {/* Feature Card 3: Typst export (Simplified, <= 9 words description) */}
            <div className="bg-white rounded-3xl p-8 border border-border-soft flex flex-col justify-between shadow-sm hover:border-slate-300 transition-colors">
              <div>
                <div className="h-12 w-12 rounded-xl bg-indigo-50 text-primary flex items-center justify-center mb-6 border border-indigo-100">
                  <FileCode2 size={24} strokeWidth={2.2} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Typst export
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  One tap from handwritten proof to typeset PDF.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION F: COMPARISON ("Why MathSentry — Answer bots make you lazy. We make you sharp.")
         ========================================================================= */}
      <section id="comparison" className="py-24 sm:py-32 bg-canvas">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary block mb-3">
              WHY MATHSENTRY
            </span>
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-slate-900 leading-tight">
              Answer bots make you lazy. We make you sharp.
            </h2>
          </div>

          {/* 3-Column Comparison Table Card */}
          <div className="bg-white rounded-3xl border border-border-soft shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/75">
                    <th className="py-5 px-6 font-semibold text-sm text-slate-700 w-1/2">
                      Capability
                    </th>
                    <th className="py-5 px-6 font-semibold text-sm text-primary text-center bg-indigo-50/50 w-1/4">
                      MathSentry
                    </th>
                    <th className="py-5 px-6 font-semibold text-sm text-slate-500 text-center w-1/4">
                      AI Chatbots
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {/* Row 1 */}
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-medium text-slate-900">
                      Shows where your logic breaks
                    </td>
                    <td className="py-4 px-6 text-center bg-indigo-50/30">
                      <div className="inline-flex h-6 w-6 rounded-full bg-emerald-100 text-emerald-600 items-center justify-center">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="inline-flex h-6 w-6 rounded-full bg-red-100 text-red-500 items-center justify-center">
                        <X size={14} strokeWidth={3} />
                      </div>
                    </td>
                  </tr>

                  {/* Row 2 */}
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-medium text-slate-900">
                      Teaches instead of solving
                    </td>
                    <td className="py-4 px-6 text-center bg-indigo-50/30">
                      <div className="inline-flex h-6 w-6 rounded-full bg-emerald-100 text-emerald-600 items-center justify-center">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="inline-flex h-6 w-6 rounded-full bg-red-100 text-red-500 items-center justify-center">
                        <X size={14} strokeWidth={3} />
                      </div>
                    </td>
                  </tr>

                  {/* Row 3 */}
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-medium text-slate-900">
                      Reads handwriting
                    </td>
                    <td className="py-4 px-6 text-center bg-indigo-50/30">
                      <div className="inline-flex h-6 w-6 rounded-full bg-emerald-100 text-emerald-600 items-center justify-center">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="inline-flex h-6 w-6 rounded-full bg-slate-100 text-slate-400 items-center justify-center">
                        <Check size={14} strokeWidth={2} />
                      </div>
                    </td>
                  </tr>

                  {/* Row 4 */}
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-medium text-slate-900">
                      Checks step dependencies
                    </td>
                    <td className="py-4 px-6 text-center bg-indigo-50/30">
                      <div className="inline-flex h-6 w-6 rounded-full bg-emerald-100 text-emerald-600 items-center justify-center">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="inline-flex h-6 w-6 rounded-full bg-red-100 text-red-500 items-center justify-center">
                        <X size={14} strokeWidth={3} />
                      </div>
                    </td>
                  </tr>

                  {/* Row 5 */}
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-medium text-slate-900">
                      Exports to Typst
                    </td>
                    <td className="py-4 px-6 text-center bg-indigo-50/30">
                      <div className="inline-flex h-6 w-6 rounded-full bg-emerald-100 text-emerald-600 items-center justify-center">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="inline-flex h-6 w-6 rounded-full bg-red-100 text-red-500 items-center justify-center">
                        <X size={14} strokeWidth={3} />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION G: LIVE STATS BANNER
         ========================================================================= */}
      <section className="bg-slate-deep py-16 sm:py-20 border-y border-slate-700/80 text-white relative overflow-hidden">
        <div
          className="glow-orb absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] opacity-40 pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 text-center">
            {/* Stat 1 */}
            <div className="flex flex-col items-center">
              <span className="font-math text-4xl sm:text-6xl font-semibold text-gradient mb-2 tracking-tight">
                12k+
              </span>
              <span className="text-sm font-medium text-slate-300">
                proofs analyzed
              </span>
            </div>

            {/* Stat 2 */}
            <div className="flex flex-col items-center">
              <span className="font-math text-4xl sm:text-6xl font-semibold text-gradient mb-2 tracking-tight">
                94%
              </span>
              <span className="text-sm font-medium text-slate-300">
                flaws caught on first scan
              </span>
            </div>

            {/* Stat 3 */}
            <div className="flex flex-col items-center">
              <span className="font-math text-4xl sm:text-6xl font-semibold text-gradient mb-2 tracking-tight">
                2.4s
              </span>
              <span className="text-sm font-medium text-slate-300">
                average analysis
              </span>
            </div>

            {/* Stat 4 */}
            <div className="flex flex-col items-center">
              <span className="font-math text-4xl sm:text-6xl font-semibold text-gradient mb-2 tracking-tight">
                4.9★
              </span>
              <span className="text-sm font-medium text-slate-300">
                student rating
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION H: STUDENT TESTIMONIALS
         ========================================================================= */}
      <section className="py-24 sm:py-32 bg-canvas">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary block mb-3">
              TESTIMONIALS
            </span>
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-slate-900 leading-tight">
              Trusted by proof-writers everywhere
            </h2>
          </div>

          {/* 3 Testimonial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white rounded-3xl p-8 border border-border-soft shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill="currentColor"
                      strokeWidth={0}
                    />
                  ))}
                </div>
                <p className="font-math italic text-lg text-slate-800 leading-relaxed mb-6">
                  “I lost points on induction proofs for a whole semester.
                  MathSentry showed me the gap in one scan.”
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                <div>
                  <strong className="font-bold text-slate-900 block">
                    Ioana M.
                  </strong>
                  <span className="text-slate-500 text-xs">Math, Year 2</span>
                </div>
                <span className="font-mono text-xs text-primary font-medium">
                  Verified Student
                </span>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white rounded-3xl p-8 border border-border-soft shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill="currentColor"
                      strokeWidth={0}
                    />
                  ))}
                </div>
                <p className="font-math italic text-lg text-slate-800 leading-relaxed mb-6">
                  “It's the first tool that doesn't just spit out an answer. It
                  actually made me better at writing proofs.”
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                <div>
                  <strong className="font-bold text-slate-900 block">
                    Daniel K.
                  </strong>
                  <span className="text-slate-500 text-xs">CS, Year 1</span>
                </div>
                <span className="font-mono text-xs text-primary font-medium">
                  Verified Student
                </span>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white rounded-3xl p-8 border border-border-soft shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill="currentColor"
                      strokeWidth={0}
                    />
                  ))}
                </div>
                <p className="font-math italic text-lg text-slate-800 leading-relaxed mb-6">
                  “I use it with my students to discuss why a step fails. The
                  logic tree is a fantastic teaching aid.”
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                <div>
                  <strong className="font-bold text-slate-900 block">
                    Dr. Elena R.
                  </strong>
                  <span className="text-slate-500 text-xs">Lecturer</span>
                </div>
                <span className="font-mono text-xs text-primary font-medium">
                  Faculty Member
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION I: PRICING ("Cheaper than one retake.")
         ========================================================================= */}
      <section id="pricing" className="py-24 sm:py-32 bg-slate-50 border-t border-border-soft">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary block mb-3">
              PRICING
            </span>
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-slate-900 leading-tight">
              Cheaper than one retake.
            </h2>
          </div>

          {/* 3 Tiered Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Plan 1: Free */}
            <div className="bg-white rounded-3xl p-8 border border-border-soft flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-slate-900">Free</h3>
                  <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                    Try it out
                  </span>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-slate-900">€0</span>
                  <span className="text-slate-500 text-sm ml-1">/ forever</span>
                </div>
                <ul className="space-y-3 text-sm text-slate-600 mb-8">
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-emerald-500" />
                    <span>5 proofs / month</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-emerald-500" />
                    <span>Logic tree view</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-emerald-500" />
                    <span>Flaw highlighting</span>
                  </li>
                </ul>
              </div>
              <a
                href="/app"
                className="w-full text-center py-3 rounded-full border border-slate-300 text-slate-700 font-semibold hover:border-slate-400 hover:bg-slate-50 transition-colors"
              >
                Get started
              </a>
            </div>

            {/* Plan 2: Student (Most Popular) - Elevated */}
            <div className="bg-slate-deep text-white rounded-3xl p-8 border border-indigo-500/50 flex flex-col justify-between shadow-indigo md:-translate-y-4 relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-white text-xs font-bold tracking-wide uppercase shadow-sm">
                Most popular
              </div>
              <div>
                <div className="flex justify-between items-center mb-4 pt-2">
                  <h3 className="text-xl font-bold text-white">Student</h3>
                  <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300">
                    Full access
                  </span>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">€6</span>
                  <span className="text-slate-400 text-sm ml-1">/ per month</span>
                </div>
                <ul className="space-y-3 text-sm text-slate-300 mb-8">
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-emerald-400" />
                    <span className="font-medium text-white">
                      Unlimited proofs
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-emerald-400" />
                    <span>Socratic hints</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-emerald-400" />
                    <span>Typst export</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-emerald-400" />
                    <span>Proof history & revision tracking</span>
                  </li>
                </ul>
              </div>
              <a
                href="/app"
                className="w-full text-center py-3.5 rounded-full bg-primary text-white font-semibold hover:opacity-95 shadow-indigo transition-all active:scale-[0.98]"
              >
                Start free trial
              </a>
            </div>

            {/* Plan 3: Classroom */}
            <div className="bg-white rounded-3xl p-8 border border-border-soft flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-slate-900">Classroom</h3>
                  <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                    For educators
                  </span>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-slate-900">€49</span>
                  <span className="text-slate-500 text-sm ml-1">/ per month</span>
                </div>
                <ul className="space-y-3 text-sm text-slate-600 mb-8">
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-emerald-500" />
                    <span>Up to 40 students</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-emerald-500" />
                    <span>Teacher dashboard & rubric</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-emerald-500" />
                    <span>Shared proof library</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-emerald-500" />
                    <span>Priority AST compute server</span>
                  </li>
                </ul>
              </div>
              <a
                href="/app"
                className="w-full text-center py-3 rounded-full border border-slate-300 text-slate-700 font-semibold hover:border-slate-400 hover:bg-slate-50 transition-colors"
              >
                Contact department
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION J: INTERACTIVE FAQ ACCORDION
         ========================================================================= */}
      <section id="faq" className="py-24 sm:py-32 bg-canvas">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary block mb-3">
              FAQ
            </span>
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-slate-900 leading-tight">
              Frequently asked questions
            </h2>
          </div>

          <div className="space-y-4">
            {/* Question 1 */}
            <div className="border border-border-soft rounded-2xl bg-white overflow-hidden transition-colors">
              <button
                onClick={() => toggleFaq(0)}
                className="w-full py-5 px-6 text-left font-semibold text-slate-900 flex items-center justify-between gap-4 hover:text-primary transition-colors"
              >
                <span className="text-base sm:text-lg">
                  Does MathSentry solve my homework?
                </span>
                <span className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-600">
                  {activeFaq === 0 ? <Minus size={16} /> : <Plus size={16} />}
                </span>
              </button>
              {activeFaq === 0 && (
                <div className="px-6 pb-6 text-slate-600 text-sm sm:text-base leading-relaxed border-t border-slate-50 pt-3">
                  No — by design. It shows where your reasoning breaks and gives
                  a hint. You write the fix. MathSentry preserves the productive
                  struggle of mathematics instead of generating cheap answers.
                </div>
              )}
            </div>

            {/* Question 2 */}
            <div className="border border-border-soft rounded-2xl bg-white overflow-hidden transition-colors">
              <button
                onClick={() => toggleFaq(1)}
                className="w-full py-5 px-6 text-left font-semibold text-slate-900 flex items-center justify-between gap-4 hover:text-primary transition-colors"
              >
                <span className="text-base sm:text-lg">
                  Can it read my handwriting?
                </span>
                <span className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-600">
                  {activeFaq === 1 ? <Minus size={16} /> : <Plus size={16} />}
                </span>
              </button>
              {activeFaq === 1 && (
                <div className="px-6 pb-6 text-slate-600 text-sm sm:text-base leading-relaxed border-t border-slate-50 pt-3">
                  Yes. It's trained on real student notebooks, including
                  crossed-out lines, margin scribbles, and arrows. Our pipeline
                  converts handwriting to clean LaTeX before mapping the AST.
                </div>
              )}
            </div>

            {/* Question 3 */}
            <div className="border border-border-soft rounded-2xl bg-white overflow-hidden transition-colors">
              <button
                onClick={() => toggleFaq(2)}
                className="w-full py-5 px-6 text-left font-semibold text-slate-900 flex items-center justify-between gap-4 hover:text-primary transition-colors"
              >
                <span className="text-base sm:text-lg">
                  Which topics are supported?
                </span>
                <span className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-600">
                  {activeFaq === 2 ? <Minus size={16} /> : <Plus size={16} />}
                </span>
              </button>
              {activeFaq === 2 && (
                <div className="px-6 pb-6 text-slate-600 text-sm sm:text-base leading-relaxed border-t border-slate-50 pt-3">
                  Induction, real analysis, algebra, number theory,
                  combinatorics and more — anything written as step-by-step
                  deductive reasoning.
                </div>
              )}
            </div>

            {/* Question 4 */}
            <div className="border border-border-soft rounded-2xl bg-white overflow-hidden transition-colors">
              <button
                onClick={() => toggleFaq(3)}
                className="w-full py-5 px-6 text-left font-semibold text-slate-900 flex items-center justify-between gap-4 hover:text-primary transition-colors"
              >
                <span className="text-base sm:text-lg">
                  Is there an Android and iOS app?
                </span>
                <span className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-600">
                  {activeFaq === 3 ? <Minus size={16} /> : <Plus size={16} />}
                </span>
              </button>
              {activeFaq === 3 && (
                <div className="px-6 pb-6 text-slate-600 text-sm sm:text-base leading-relaxed border-t border-slate-50 pt-3">
                  Yes, MathSentry runs on both iOS and Android natively via
                  Expo, as well as directly in the browser on desktop and
                  tablets.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION K: FINAL CTA CARD (LIGHTER SLATE + MATH SQUARE GRID) & FOOTER
         ========================================================================= */}
      <section className="py-20 sm:py-28 bg-canvas">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Rounded 2.5rem card in lighter slateDeep with math grid background */}
          <div className="relative rounded-[2.5rem] bg-slate-deep text-white px-8 py-16 sm:px-16 sm:py-24 text-center overflow-hidden border border-slate-700/80 shadow-2xl bg-grid">
            {/* Centered Glow Orb */}
            <div
              className="glow-orb absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none opacity-60"
              aria-hidden="true"
            />

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-4xl sm:text-6xl font-semibold tracking-tight text-white mb-6 leading-tight">
                Q.E.D.{' '}
                <span className="text-gradient font-math italic font-normal">
                  for real this time.
                </span>
              </h2>
              <p className="text-slate-300 text-lg sm:text-xl font-normal mb-10">
                Scan your first proof in under a minute. No account needed.
              </p>
              <a
                href="/app"
                className="inline-flex items-center justify-center gap-2 px-9 py-4 rounded-full text-base font-semibold bg-primary text-white shadow-indigo hover:opacity-95 hover:shadow-indigo-lg transition-all active:scale-[0.98]"
              >
                <span>Start proving</span>
                <ArrowRight size={18} />
              </a>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-20 pt-8 border-t border-slate-200 text-center text-sm text-slate-500">
            <p>© 2026 MathSentry · Built for people who prove things.</p>
          </footer>
        </div>
      </section>
    </div>
  );
}
