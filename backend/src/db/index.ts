import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.join(__dirname, '../../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'mathsentry.db');
export const db = new Database(DB_PATH);

// Enable WAL mode for high performance
db.pragma('journal_mode = WAL');

export function initDatabase(): void {
  // 1. Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      username TEXT NOT NULL,
      rank TEXT DEFAULT 'Olympiad Candidate',
      streak INTEGER DEFAULT 7,
      created_at TEXT NOT NULL
    );
  `);

  // 2. Proof Analyses Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS proof_analyses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      problem_id TEXT NOT NULL,
      problem_title TEXT NOT NULL,
      domain TEXT NOT NULL,
      problem_ro TEXT NOT NULL,
      phase TEXT NOT NULL,
      score_percentage REAL NOT NULL,
      onm_score REAL NOT NULL,
      bac_score REAL NOT NULL,
      fatal_flaw_step INTEGER,
      cascading_steps_json TEXT,
      step_breakdown_json TEXT NOT NULL,
      ast_node_break_json TEXT,
      explanation_ro TEXT NOT NULL,
      teacher_critique_ro TEXT NOT NULL,
      theorems_json TEXT NOT NULL,
      typst_source TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  seedDemoUserAndAnalyses();
}

function seedDemoUserAndAnalyses(): void {
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get('olimpic@mathsentry.ro');

  let userId: string;
  if (!existingUser) {
    userId = 'user_demo_01';
    const passwordHash = bcrypt.hashSync('olimpiada2026', 10);
    db.prepare(`
      INSERT INTO users (id, email, password_hash, username, rank, streak, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      'olimpic@mathsentry.ro',
      passwordHash,
      'Andrei Popescu',
      'Olympiad Candidate',
      7,
      new Date().toISOString()
    );
    console.log('[SQLite] Seeded demo user: olimpic@mathsentry.ro / olimpiada2026');
  } else {
    userId = (existingUser as any).id;
  }

  // Seed initial analyses if empty for this user
  const count = db.prepare('SELECT COUNT(*) as count FROM proof_analyses WHERE user_id = ?').get(userId) as any;
  if (count.count === 0) {
    const defaultTheorems = JSON.stringify([
      {
        name: "BERNOULLI'S INEQUALITY",
        statement: 'Pentru orice întreg n ≥ 0 și orice număr real x ≥ −1, (1 + x)ⁿ ≥ 1 + nx.',
      },
      {
        name: 'ORDER AXIOM FOR MULTIPLICATION',
        statement: 'Dacă a ≥ b și c > 0, atunci ac ≥ bc. Dacă c < 0, sensul inegalității se inversează.',
      },
    ]);

    const defaultTypst = `#set page(paper: "a4", margin: 2cm)
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

    // 1. Current active analysis: Bernoulli with Flaw
    const stepsBernoulli = JSON.stringify([
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
        commentRo: 'COLAPS ÎN CASCADĂ (0%): Concluzia se bazează pe pasul 3 care este invalidat.',
        onmPoints: 0.0,
        bacPoints: 0.0,
      },
    ]);

    const astBreak = JSON.stringify({
      rule: 'Inequality_Multiply_Rule',
      condition: '1 + x > 0',
      status: 'UNVERIFIED',
    });

    const now = new Date().toISOString();

    const insertStmt = db.prepare(`
      INSERT INTO proof_analyses (
        id, user_id, problem_id, problem_title, domain, problem_ro, phase,
        score_percentage, onm_score, bac_score, fatal_flaw_step, cascading_steps_json,
        step_breakdown_json, ast_node_break_json, explanation_ro, teacher_critique_ro,
        theorems_json, typst_source, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Record 1: Bernoulli (Today, Flaw)
    insertStmt.run(
      'analysis_bernoulli_01',
      userId,
      'ONM_RO_BERNOULLI',
      'Bernoulli via induction',
      'Algebră / Inegalități',
      'Să se demonstreze că pentru orice număr real x ≠ 0 și n ∈ ℕ*, avem (1 + x)ⁿ ≥ 1 + nx, știind că x > -1.',
      'flaw',
      40.0,
      2.8,
      4.6,
      3,
      JSON.stringify([4]),
      stepsBernoulli,
      astBreak,
      'Logica se rupe la Pasul 3. Ai aplicat pasul inductiv (înmulțind inegalitatea cu 1 + x), dar ai verificat dacă condiția de bază (x > −1) este respectată în acest domeniu?',
      'ATENȚIE: Eroare fatală de olimpiadă la Pasul 3! Ai înmulțit ambii membri ai inegalității P(k) cu (1 + x), dar ai omis să justifici că 1 + x > 0. Pasul 4 (Concluzia) este anulat automat (0 puncte) prin efect de cascadă!',
      defaultTheorems,
      defaultTypst,
      now,
      now
    );

    // Record 2: IMO 2001 P2 — AM-GM chain (2 days ago, Sound)
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString();
    insertStmt.run(
      'analysis_imo_01',
      userId,
      'IMO_2001_P2',
      'IMO 2001 P2 — AM-GM chain',
      'Algebră / Inegalități Simetrice',
      'Să se demonstreze că pentru orice a, b, c > 0 avem a / sqrt(a^2 + 8bc) + b / sqrt(b^2 + 8ca) + c / sqrt(c^2 + 8ab) >= 1.',
      'sound',
      100.0,
      7.0,
      10.0,
      null,
      JSON.stringify([]),
      JSON.stringify([
        { step: 1, label: 'Omogenizare și substituție Holder', maxPercentage: 30, awardedPercentage: 30, isSound: true, onmPoints: 2.1, bacPoints: 3.0 },
        { step: 2, label: 'Aplicarea inegalității AM-GM pe numitori', maxPercentage: 40, awardedPercentage: 40, isSound: true, onmPoints: 2.8, bacPoints: 4.0 },
        { step: 3, label: 'Egalitate și concluzie', maxPercentage: 30, awardedPercentage: 30, isSound: true, onmPoints: 2.1, bacPoints: 3.0 },
      ]),
      null,
      'Demonstrație impecabilă. Toate etapele reductive sunt demonstrate riguros.',
      'Comisia Națională acordă 7.0 / 7.0 puncte. Utilizarea inegalității Cauchy-Buniakovski-Schwarz este ireproșabilă.',
      defaultTheorems,
      defaultTypst,
      twoDaysAgo,
      twoDaysAgo
    );

    // Record 3: Cauchy–Schwarz lemma (USAMO) (5 days ago, Flaw)
    const fiveDaysAgo = new Date(Date.now() - 5 * 86400000).toISOString();
    insertStmt.run(
      'analysis_cauchy_01',
      userId,
      'USAMO_CAUCHY_LEMMA',
      'Cauchy–Schwarz lemma (USAMO)',
      'Algebră / Forme Pătratice',
      'Demonstrați lema lui Titu Andreescu (forma Bergström a inegalității Cauchy-Schwarz).',
      'flaw',
      40.0,
      2.8,
      4.6,
      2,
      JSON.stringify([3]),
      JSON.stringify([
        { step: 1, label: 'Identitatea algebrică pentru n=2', maxPercentage: 40, awardedPercentage: 40, isSound: true, onmPoints: 2.8, bacPoints: 4.0 },
        { step: 2, label: 'Generalizarea la n termeni prin inducție', maxPercentage: 35, awardedPercentage: 0, isSound: false, onmPoints: 0, bacPoints: 0 },
        { step: 3, label: 'Cazul de egalitate', maxPercentage: 25, awardedPercentage: 0, isSound: false, isCascadedFailure: true, onmPoints: 0, bacPoints: 0 },
      ]),
      JSON.stringify({ rule: 'Strict_Positive_Denominator', condition: 'b_i > 0', status: 'UNVERIFIED' }),
      'Ai omis condiția strictă ca numitorii b_i să fie strict pozitivi, ceea ce produce împărțire la zero.',
      'Eroare de domeniu: ai împărțit la numitori fără a stipula că b_i > 0. Pasul 3 se anulează în cascadă.',
      defaultTheorems,
      defaultTypst,
      fiveDaysAgo,
      fiveDaysAgo
    );

    // Record 4: Pigeonhole on residues mod 7 (1 week ago, Sound)
    const oneWeekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    insertStmt.run(
      'analysis_dirichlet_01',
      userId,
      'ONM_DIRICHLET_MOD7',
      'Pigeonhole on residues mod 7',
      'Teoria Numerelor / Combinatorică',
      'Fie 8 numere întregi arbitrare. Arătați că există două a căror diferență este divizibilă cu 7.',
      'sound',
      100.0,
      7.0,
      10.0,
      null,
      JSON.stringify([]),
      JSON.stringify([
        { step: 1, label: 'Analiza claselor de resturi modulo 7', maxPercentage: 40, awardedPercentage: 40, isSound: true, onmPoints: 2.8, bacPoints: 4.0 },
        { step: 2, label: 'Aplicarea principiului lui Dirichlet pe 8 elemente în 7 cutii', maxPercentage: 60, awardedPercentage: 60, isSound: true, onmPoints: 4.2, bacPoints: 6.0 },
      ]),
      null,
      'Toate argumentele combinatorice sunt complete.',
      'Soluție clară și precisă. Principiul cutiei a fost enunțat și aplicat fără cusur.',
      defaultTheorems,
      defaultTypst,
      oneWeekAgo,
      oneWeekAgo
    );

    console.log('[SQLite] Seeded 4 Olympiad analysis records for demo user.');
  }
}
