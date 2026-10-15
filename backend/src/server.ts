import express from 'express';
import cors from 'cors';
import routes from './routes';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'MathSentry Olympiad Engine', time: new Date().toISOString() });
});

app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`[MathSentry] Olympiad Backend running on http://localhost:${PORT}`);
});
