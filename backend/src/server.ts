import express from 'express';
import cors from 'cors';
import routes from './routes';
import { initDatabase } from './db';

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
    time: new Date().toISOString(),
  });
});

app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`[MathSentry] Olympiad Backend with SQLite running on http://localhost:${PORT}`);
});
