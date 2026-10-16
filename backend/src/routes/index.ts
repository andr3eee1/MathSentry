import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth';
import {
  analyzeProof,
  getHistory,
  getProofById,
  scanProof,
  getGeminiStatus,
} from '../controllers/analysis';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth';

const router = Router();

// Auth routes
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', authMiddleware, getMe);

// Proof & Olympiad Analysis routes
router.post('/proof/analyze', optionalAuthMiddleware, analyzeProof);
router.post('/proof/re-analyze', optionalAuthMiddleware, analyzeProof);
router.get('/proof/history', optionalAuthMiddleware, getHistory);
router.get('/proof/gemini-status', optionalAuthMiddleware, getGeminiStatus);
router.get('/proof/:id', optionalAuthMiddleware, getProofById);
router.post('/proof/scan', optionalAuthMiddleware, scanProof);

// Backward-compatible root aliases
router.post('/analyze', optionalAuthMiddleware, analyzeProof);
router.post('/re-analyze', optionalAuthMiddleware, analyzeProof);
router.get('/gemini-status', optionalAuthMiddleware, getGeminiStatus);

export default router;
