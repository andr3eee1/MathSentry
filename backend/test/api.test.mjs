/**
 * MathSentry backend API tests (Node built-in runner, no dependencies).
 *
 * Start a THROWAWAY server (never the real data/mathsentry.db):
 *
 *   T=$(mktemp -d)
 *   cp -r backend/{src,package.json,tsconfig.json} $T/ && mkdir $T/data
 *   ln -s $PWD/backend/node_modules $T/node_modules
 *   (cd $T && NODE_ENV=development TRUST_PROXY= PORT=4777 GEMINI_API_KEY= GOOGLE_API_KEY= LORA_API_URL= COLAB_API_URL= \
 *      npx ts-node-dev --transpile-only src/server.ts) &
 *
 * Then run:
 *
 *   API_URL=http://localhost:4777/api TEST_DB=$T/data/mathsentry.db npm test
 *
 * - API_URL   defaults to http://localhost:4777/api
 * - TEST_DB   path of the throwaway server's SQLite file; the quota test is
 *             skipped without it (it inserts usage_events rows directly).
 * - NODE_ENV=development is required: it enables the offline grader and the
 *   built-in JWT secret (production refuses to start without a real secret).
 * - Empty AI keys make the server use its offline grader (engine
 *   'local-deterministic'), so no real AI is called and usage is not recorded.
 * - The final test exhausts the /auth/guest rate limit (10/hour/IP); restart
 *   the server before running the suite again.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { randomBytes } from 'node:crypto';

const API = process.env.API_URL || 'http://localhost:4777/api';
const TEST_DB = process.env.TEST_DB;
const EXAMPLE_IDS = ['analysis_bernoulli_01', 'analysis_imo_01', 'analysis_cauchy_01', 'analysis_dirichlet_01'];
const PROOF = 'Fie n un numar natural. Demonstram prin inductie ca 1+2+...+n = n(n+1)/2.';

async function call(method, path, { token, body, raw } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined || raw !== undefined) headers['Content-Type'] = 'application/json';
  const res = await fetch(API + path, {
    method,
    headers,
    body: raw !== undefined ? raw : body !== undefined ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try { json = await res.json(); } catch { /* non-JSON */ }
  return { status: res.status, json };
}

const uniqueEmail = (p) => `${p}_${randomBytes(4).toString('hex')}@test.example`;

async function registerUser(prefix, guestToken) {
  const email = uniqueEmail(prefix);
  const r = await call('POST', '/auth/register', {
    token: guestToken,
    body: { email, password: 'secret123', username: prefix },
  });
  assert.equal(r.status, 201, JSON.stringify(r.json));
  return { email, password: 'secret123', token: r.json.token, id: r.json.user.id };
}

let A, B;

test('setup: register users A and B', async () => {
  A = await registerUser('alice');
  B = await registerUser('bob');
});

test('auth: unauthenticated data routes return 401', async () => {
  for (const [m, p] of [
    ['GET', '/proof/history'],
    ['GET', '/proof/analysis_bernoulli_01'],
    ['POST', '/proof/analyze'],
    ['GET', '/problems'],
    ['POST', '/problems'],
    ['GET', '/auth/me'],
  ]) {
    const r = await call(m, p, m === 'POST' ? { body: {} } : {});
    assert.equal(r.status, 401, `${m} ${p}`);
  }
  const bad = await call('GET', '/proof/history', { token: 'garbage' });
  assert.equal(bad.status, 401);
});

test('auth: register validation', async () => {
  const noEmail = await call('POST', '/auth/register', { body: { email: 'not-an-email', password: 'secret123', username: 'x' } });
  assert.equal(noEmail.status, 400);
  const short = await call('POST', '/auth/register', { body: { email: uniqueEmail('s'), password: '12345', username: 'x' } });
  assert.equal(short.status, 400);
  const missing = await call('POST', '/auth/register', { body: { email: uniqueEmail('m') } });
  assert.equal(missing.status, 400);
  const dup = await call('POST', '/auth/register', { body: { email: A.email.toUpperCase(), password: 'secret123', username: 'dup' } });
  assert.equal(dup.status, 409);
});

test('auth: login success and failures', async () => {
  const ok = await call('POST', '/auth/login', { body: { email: A.email, password: A.password } });
  assert.equal(ok.status, 200);
  assert.ok(ok.json.token);
  assert.equal(ok.json.user.isGuest, false);
  const wrong = await call('POST', '/auth/login', { body: { email: A.email, password: 'wrongpass' } });
  assert.equal(wrong.status, 401);
  const unknown = await call('POST', '/auth/login', { body: { email: uniqueEmail('nobody'), password: 'secret123' } });
  assert.equal(unknown.status, 401);
  const empty = await call('POST', '/auth/login', { body: {} });
  assert.equal(empty.status, 400);
});

test('auth: examples account cannot log in by password', async () => {
  for (const password of ['!', '', 'password', 'examples']) {
    const r = await call('POST', '/auth/login', { body: { email: 'examples@mathsentry.local', password } });
    assert.ok([400, 401].includes(r.status), `password "${password}" -> ${r.status}`);
    assert.equal(r.json.token, undefined);
  }
});

test('auth: guest creation, guest cannot log in, /auth/me stats', async () => {
  const g = await call('POST', '/auth/guest');
  assert.equal(g.status, 201);
  assert.ok(g.json.token);
  assert.equal(g.json.user.isGuest, true);
  assert.equal(g.json.user.email, '');

  const guestEmail = `${g.json.user.id}@guest.mathsentry.local`;
  const login = await call('POST', '/auth/login', { body: { email: guestEmail, password: 'anything1' } });
  assert.equal(login.status, 401);

  const me = await call('GET', '/auth/me', { token: g.json.token });
  assert.equal(me.status, 200);
  const s = me.json.stats;
  for (const k of ['totalProofs', 'soundPercentage', 'averageOnm', 'streak', 'auditsLeftToday', 'dailyLimit']) {
    assert.ok(k in s, `missing stats.${k}`);
  }
  assert.equal(s.totalProofs, 0);
  assert.equal(s.dailyLimit, 5);
  assert.equal(s.auditsLeftToday, 5);

  const meA = await call('GET', '/auth/me', { token: A.token });
  assert.equal(meA.json.stats.dailyLimit, 20);
});

test('auth: registering with a guest token upgrades the same user and keeps history', async () => {
  const g = await call('POST', '/auth/guest');
  const guestId = g.json.user.id;
  const an = await call('POST', '/proof/analyze', { token: g.json.token, body: { proofText: PROOF, problemTitle: 'Guest proof' } });
  assert.equal(an.status, 200);

  const email = uniqueEmail('upgraded');
  const reg = await call('POST', '/auth/register', { token: g.json.token, body: { email, password: 'secret123', username: 'Upgraded' } });
  assert.equal(reg.status, 201);
  assert.equal(reg.json.user.id, guestId);
  assert.equal(reg.json.user.isGuest, false);

  const hist = await call('GET', '/proof/history', { token: reg.json.token });
  assert.equal(hist.json.length, 1);
  assert.equal(hist.json[0].id, an.json.id);

  const login = await call('POST', '/auth/login', { body: { email, password: 'secret123' } });
  assert.equal(login.status, 200);
  assert.equal(login.json.user.id, guestId);
});

test('analyze: validation (empty, too long)', async () => {
  const none = await call('POST', '/proof/analyze', { token: A.token, body: {} });
  assert.equal(none.status, 400);
  const blank = await call('POST', '/proof/analyze', { token: A.token, body: { proofText: '   ' } });
  assert.equal(blank.status, 400);
  const long = await call('POST', '/proof/analyze', { token: A.token, body: { proofText: 'x'.repeat(20001) } });
  assert.equal(long.status, 400);
  const edge = await call('POST', '/proof/analyze', { token: A.token, body: { proofText: 'x'.repeat(20000) } });
  assert.equal(edge.status, 200);
});

let aAnalysisId;

test('analyze: offline engine, creates analysis in own history', async () => {
  const before = (await call('GET', '/proof/history', { token: A.token })).json.length;
  const r = await call('POST', '/proof/analyze', { token: A.token, body: { proofText: PROOF, problemTitle: 'Suma Gauss' } });
  assert.equal(r.status, 200);
  assert.equal(r.json._meta.engine, 'local-deterministic');
  assert.equal(r.json.isExample, false);
  assert.equal(r.json.problemTitle, 'Suma Gauss');
  aAnalysisId = r.json.id;
  const hist = await call('GET', '/proof/history', { token: A.token });
  assert.equal(hist.json.length, before + 1);
  assert.ok(hist.json.some((h) => h.id === aAnalysisId));
  const get = await call('GET', `/proof/${aAnalysisId}`, { token: A.token });
  assert.equal(get.status, 200);
  assert.equal(get.json.id, aAnalysisId);
});

test('analyze: re-audit with own id updates in place', async () => {
  const before = (await call('GET', '/proof/history', { token: A.token })).json.length;
  const r = await call('POST', '/proof/analyze', { token: A.token, body: { id: aAnalysisId, proofText: PROOF + ' Q.E.D.', problemTitle: 'Titlu nou' } });
  assert.equal(r.status, 200);
  assert.equal(r.json.id, aAnalysisId);
  const hist = await call('GET', '/proof/history', { token: A.token });
  assert.equal(hist.json.length, before);
  assert.equal(hist.json.find((h) => h.id === aAnalysisId).title, 'Titlu nou');
});

test('access: users cannot read each other\'s analyses', async () => {
  const r = await call('GET', `/proof/${aAnalysisId}`, { token: B.token });
  assert.equal(r.status, 404);
  const missing = await call('GET', '/proof/does_not_exist', { token: B.token });
  assert.equal(missing.status, 404);
});

test('access: public examples readable by anyone, never in history', async () => {
  for (const id of EXAMPLE_IDS) {
    for (const u of [A, B]) {
      const r = await call('GET', `/proof/${id}`, { token: u.token });
      assert.equal(r.status, 200, id);
      assert.equal(r.json.isExample, true);
    }
  }
  for (const u of [A, B]) {
    const hist = await call('GET', '/proof/history', { token: u.token });
    for (const h of hist.json) assert.ok(!EXAMPLE_IDS.includes(h.id));
  }
});

test('analyze: example id or foreign id yields a new analysis; example unchanged', async () => {
  for (const id of [EXAMPLE_IDS[0], aAnalysisId]) {
    const owner = id === aAnalysisId ? A : null;
    const snapshotToken = owner ? owner.token : B.token;
    const beforeRes = await call('GET', `/proof/${id}`, { token: snapshotToken });
    const histBefore = (await call('GET', '/proof/history', { token: B.token })).json.length;

    const r = await call('POST', '/proof/analyze', { token: B.token, body: { id, proofText: 'Alta demonstratie complet diferita.', problemTitle: 'B copy' } });
    assert.equal(r.status, 200);
    assert.notEqual(r.json.id, id);

    const afterRes = await call('GET', `/proof/${id}`, { token: snapshotToken });
    assert.deepEqual(afterRes.json, beforeRes.json, `${id} must remain unchanged`);

    const histB = await call('GET', '/proof/history', { token: B.token });
    assert.equal(histB.json.length, histBefore + 1);
    assert.ok(histB.json.some((h) => h.id === r.json.id));
    const mine = await call('GET', `/proof/${r.json.id}`, { token: B.token });
    assert.equal(mine.status, 200);
    const notA = await call('GET', `/proof/${r.json.id}`, { token: A.token });
    assert.equal(notA.status, 404);
  }
});

let probId;

test('problems: typed create requires enuntRo, appears in list', async () => {
  const bad = await call('POST', '/problems', { token: A.token, body: { title: 'fara enunt' } });
  assert.equal(bad.status, 400);
  const blank = await call('POST', '/problems', { token: A.token, body: { enuntRo: '   ' } });
  assert.equal(blank.status, 400);

  const r = await call('POST', '/problems', { token: A.token, body: { title: 'P1', domain: 'Algebra', enuntRo: 'Aratati ca 1+1=2.' } });
  assert.equal(r.status, 201);
  assert.equal(r.json.title, 'P1');
  assert.equal(r.json.solutionCount, 0);
  probId = r.json.id;

  const list = await call('GET', '/problems', { token: A.token });
  const p = list.json.find((x) => x.id === probId);
  assert.ok(p);
  assert.equal(p.solutionCount, 0);

  const listB = await call('GET', '/problems', { token: B.token });
  assert.ok(!listB.json.some((x) => x.id === probId));
});

test('problems: defaults for title/domain', async () => {
  const r = await call('POST', '/problems', { token: A.token, body: { enuntRo: 'Enunt fara titlu' } });
  assert.equal(r.status, 201);
  assert.equal(r.json.title, 'Enunt fara titlu');
  assert.ok(r.json.domain);
  await call('DELETE', `/problems/${r.json.id}`, { token: A.token });
});

test('problems: access control for other users', async () => {
  assert.equal((await call('GET', `/problems/${probId}`, { token: B.token })).status, 404);
  assert.equal((await call('DELETE', `/problems/${probId}`, { token: B.token })).status, 404);
  assert.equal((await call('POST', `/problems/${probId}/solutions`, { token: B.token, body: { proofText: PROOF } })).status, 404);
  assert.equal((await call('GET', `/problems/${probId}`, { token: A.token })).status, 200);
});

let solId;

test('problems: submit solution links analysis to problem', async () => {
  const empty = await call('POST', `/problems/${probId}/solutions`, { token: A.token, body: {} });
  assert.equal(empty.status, 400);

  const r = await call('POST', `/problems/${probId}/solutions`, { token: A.token, body: { proofText: PROOF } });
  assert.equal(r.status, 200);
  assert.equal(r.json.problemId, probId);
  solId = r.json.id;

  const list = await call('GET', '/problems', { token: A.token });
  assert.equal(list.json.find((x) => x.id === probId).solutionCount, 1);

  const detail = await call('GET', `/problems/${probId}`, { token: A.token });
  assert.equal(detail.json.solutions.length, 1);
  assert.equal(detail.json.solutions[0].id, solId);
  assert.equal((await call('GET', `/proof/${solId}`, { token: A.token })).status, 200);
});

test('problems: delete removes problem and its solutions', async () => {
  const del = await call('DELETE', `/problems/${probId}`, { token: A.token });
  assert.equal(del.status, 200);
  assert.equal((await call('GET', `/problems/${probId}`, { token: A.token })).status, 404);
  const list = await call('GET', '/problems', { token: A.token });
  assert.ok(!list.json.some((x) => x.id === probId));
  assert.equal((await call('GET', `/proof/${solId}`, { token: A.token })).status, 404);
  const hist = await call('GET', '/proof/history', { token: A.token });
  assert.ok(!hist.json.some((h) => h.id === solId));
  assert.equal((await call('DELETE', `/problems/${probId}`, { token: A.token })).status, 404);
});

test('errors: malformed JSON -> 400 JSON, unknown route -> 404 JSON', async () => {
  const bad = await call('POST', '/auth/login', { raw: '{"email": ' });
  assert.equal(bad.status, 400);
  assert.ok(bad.json && bad.json.error);
  const nf = await call('GET', '/nope/nothing');
  assert.equal(nf.status, 404);
  assert.ok(nf.json && nf.json.error);
});

test('quota: guest at limit gets 429 and /auth/me reflects it', { skip: !TEST_DB && 'set TEST_DB to the throwaway DB path' }, async () => {
  const require = createRequire(new URL('../package.json', import.meta.url));
  const Database = require('better-sqlite3');
  const g = await call('POST', '/auth/guest');
  const uid = g.json.user.id;

  const db = new Database(TEST_DB);
  const ins = db.prepare('INSERT INTO usage_events (user_id, kind, created_at) VALUES (?, ?, ?)');
  const yesterday = new Date(Date.now() - 36 * 3600 * 1000).toISOString();
  ins.run(uid, 'analyze', yesterday); // old event must not count
  for (let i = 0; i < 4; i++) ins.run(uid, 'analyze', new Date().toISOString());

  let me = await call('GET', '/auth/me', { token: g.json.token });
  assert.equal(me.json.stats.auditsLeftToday, 1);
  const ok = await call('POST', '/proof/analyze', { token: g.json.token, body: { proofText: PROOF } });
  assert.equal(ok.status, 200);

  ins.run(uid, 'analyze', new Date().toISOString());
  db.close();

  me = await call('GET', '/auth/me', { token: g.json.token });
  assert.equal(me.json.stats.auditsLeftToday, 0);
  const blocked = await call('POST', '/proof/analyze', { token: g.json.token, body: { proofText: PROOF } });
  assert.equal(blocked.status, 429);
  assert.equal(blocked.json.code, 'QUOTA_EXCEEDED');

  // solutions endpoint is also gated
  const prob = await call('POST', '/problems', { token: g.json.token, body: { enuntRo: 'Enunt' } });
  const sol = await call('POST', `/problems/${prob.json.id}/solutions`, { token: g.json.token, body: { proofText: PROOF } });
  assert.equal(sol.status, 429);
});

test('validation: non-string fields, oversized enunt/title, bad mimeType -> 400', async () => {
  const arr = await call('POST', '/proof/analyze', { token: A.token, body: { proofText: ['a', 'b'] } });
  assert.equal(arr.status, 400);
  const obj = await call('POST', '/proof/analyze', { token: A.token, body: { proofText: PROOF, problemTitle: { x: 1 } } });
  assert.equal(obj.status, 400);
  const enunt = await call('POST', '/proof/analyze', { token: A.token, body: { proofText: PROOF, enunt: 'e'.repeat(5001) } });
  assert.equal(enunt.status, 400);
  const title = await call('POST', '/proof/analyze', { token: A.token, body: { proofText: PROOF, problemTitle: 't'.repeat(201) } });
  assert.equal(title.status, 400);
  const mime = await call('POST', '/proof/scan', { token: A.token, body: { imageBase64: 'AAAA', mimeType: 'application/pdf' } });
  assert.equal(mime.status, 400);
  const prob = await call('POST', '/problems', { token: A.token, body: { enuntRo: ['x'] } });
  assert.equal(prob.status, 400);
});

test('validation: decoded image over 8 MB -> 413', async () => {
  const big = 'A'.repeat(Math.ceil((8 * 1024 * 1024 * 4) / 3) + 8);
  const r = await call('POST', '/proof/scan', { token: A.token, body: { imageBase64: big, mimeType: 'image/png' } });
  assert.equal(r.status, 413);
  assert.ok(r.json.error);
});

test('body size: >100kb is rejected on non-photo routes, unauthenticated photo route gets 401', async () => {
  const huge = await call('POST', '/auth/login', { body: { email: 'a@b.co', password: 'x'.repeat(200000) } });
  assert.equal(huge.status, 413);
  const unauth = await call('POST', '/proof/scan', { body: { imageBase64: 'A'.repeat(500000) } });
  assert.equal(unauth.status, 401);
});

test('password: over 128 chars -> 400', async () => {
  const r = await call('POST', '/auth/login', { body: { email: A.email, password: 'p'.repeat(129) } });
  assert.equal(r.status, 400);
});

test('quota: offline engine releases its reservation', async () => {
  const g = await call('POST', '/auth/guest');
  const before = (await call('GET', '/auth/me', { token: g.json.token })).json.stats.auditsLeftToday;
  const r = await call('POST', '/proof/analyze', { token: g.json.token, body: { proofText: PROOF } });
  assert.equal(r.status, 200);
  assert.equal(r.json._meta.engine, 'local-deterministic');
  const after = (await call('GET', '/auth/me', { token: g.json.token })).json.stats.auditsLeftToday;
  assert.equal(after, before);
});

// Keep last: consumes the per-IP /auth/guest bucket (10 per hour).
test('rate limit: /auth/guest allows 10 per hour per IP then 429', async () => {
  const statuses = [];
  for (let i = 0; i < 12; i++) statuses.push((await call('POST', '/auth/guest')).status);
  const first429 = statuses.indexOf(429);
  assert.notEqual(first429, -1, `never rate limited: ${statuses}`);
  assert.ok(statuses.slice(first429).every((s) => s === 429));
  assert.ok(statuses.slice(0, first429).every((s) => s === 201));
  // Guests created earlier in the suite also count towards the 10.
  assert.ok(first429 <= 10, `limit exceeded 10: ${statuses}`);
});
