import { Router } from 'express';
import { scan, inspect, hint, feedback, health } from '../controllers';
const router = Router();
router.get('/', health);
router.post('/scan', scan);
router.get('/inspect/:id', inspect);
router.get('/hint/:stepId', hint);
router.post('/feedback', feedback);
export default router;
