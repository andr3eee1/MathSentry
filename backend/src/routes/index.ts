import { Router } from 'express';
import { analyzeProof } from '../controllers/analysis';

const router = Router();

router.post('/analyze', analyzeProof);
router.post('/re-analyze', analyzeProof);

export default router;
