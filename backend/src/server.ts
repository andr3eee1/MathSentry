import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import routes from './routes';
import { initDatabase } from './db';
import { isGeminiConfigured } from './services/gemini';
import { isLoraConfigured } from './services/lora';

const app = express();
const PORT = process.env.PORT || 4000;

// TRUST_PROXY: unset = false, "1" = one proxy hop, or a name like "loopback".
// Wrong values let clients spoof X-Forwarded-For and dodge the rate limits.
const trustProxyEnv = (process.env.TRUST_PROXY || '').trim();
app.set('trust proxy', trustProxyEnv === '' ? false : /^\d+$/.test(trustProxyEnv) ? Number(trustProxyEnv) : trustProxyEnv);
app.disable('x-powered-by');

app.use(cors());
// Small default parser. Photo routes get a 15mb parser after authentication
// (see routes/index.ts), so they are skipped here.
const PHOTO_ROUTE_RE = /^\/api\/(proof\/(analyze|re-analyze|scan)|problems(\/[^/]+\/solutions)?)\/?$/;
const smallJson = express.json({ limit: '100kb' });
app.use((req, res, next) => {
  if (req.method === 'POST' && PHOTO_ROUTE_RE.test(req.path)) return next();
  smallJson(req, res, next);
});

// Initialize SQLite Database schema & seeds
initDatabase();

const healthResponse = () => ({
  status: 'ok',
  service: 'MathSentry Olympiad Engine',
  loraConfigured: isLoraConfigured(),
  geminiConfigured: isGeminiConfigured(),
  time: new Date().toISOString(),
});

// Root & Health endpoints (accessible with or without /api prefix)
app.get('/', (req, res) => res.json(healthResponse()));
app.get('/health', (req, res) => res.json(healthResponse()));
app.get('/api', (req, res) => res.json(healthResponse()));
app.get('/api/health', (req, res) => res.json(healthResponse()));

app.use('/api', routes);

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Ruta nu există.' });
});

// Always answer JSON so the app can show a readable message
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  if (err?.type === 'entity.too.large') {
    res.status(413).json({ error: 'Fotografia este prea mare. Încearcă o poză cu rezoluție mai mică.' });
    return;
  }
  if (err?.type === 'entity.parse.failed') {
    res.status(400).json({ error: 'Cerere invalidă.' });
    return;
  }
  console.error('[MathSentry] Unhandled error:', err);
  res.status(500).json({ error: 'Eroare internă a serverului.' });
});

process.on('unhandledRejection', (reason) => {
  console.error('[MathSentry] Unhandled rejection:', reason);
});

app.listen(PORT, () => {
  console.log(`[MathSentry] Olympiad Backend with SQLite running on http://localhost:${PORT}`);
  if (isGeminiConfigured()) {
    console.log('[MathSentry] Gemini AI Engine: ACTIVE');
  } else if (process.env.NODE_ENV !== 'development') {
    console.error('[MathSentry] WARNING: GEMINI_API_KEY is not set. Proof audits will return 503.');
  } else {
    console.log('[MathSentry] Gemini AI Engine: not configured — audits return an offline demo result (dev only).');
  }
});
