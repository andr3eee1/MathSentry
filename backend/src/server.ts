import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routes from './routes';
import { initDatabase } from './db';
import { isGeminiConfigured } from './services/gemini';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize SQLite Database schema & seeds
initDatabase();

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'MathSentry Olympiad Engine',
    database: 'SQLite (mathsentry.db)',
    geminiConfigured: isGeminiConfigured(),
    model: 'gemini-1.5-flash',
    time: new Date().toISOString(),
  });
});

app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`[MathSentry] Olympiad Backend with SQLite running on http://localhost:${PORT}`);
  if (isGeminiConfigured()) {
    console.log('[MathSentry] Gemini 1.5 Flash AI Engine: ACTIVE (Free Tier with Master Prompt)');
  } else {
    console.log('[MathSentry] Gemini 1.5 Flash AI Engine: READY (Add GEMINI_API_KEY in .env or pass x-gemini-api-key header)');
  }
});
