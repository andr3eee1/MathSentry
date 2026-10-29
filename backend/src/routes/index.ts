import { Router, json } from 'express';
import { register, login, getMe, createGuest } from '../controllers/auth';
import {
  analyzeProof,
  getHistory,
  getProofById,
  scanProof,
  getGeminiStatus,
} from '../controllers/analysis';
import {
  getProblems,
  createProblem,
  getProblemById,
  submitProblemSolution,
  deleteProblem,
} from '../controllers/problems';
import { getBillingConfig, createCheckout, confirmPayment, billingReturn } from '../controllers/billing';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

// Brute-force / signup-spam protection per IP
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });
const registerLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10 });
const guestLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10 });
const billingLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

// Base64 phone photos are ~1.33x the JPEG size. Only authenticated photo routes
// get the big parser (the global parser stops at 100kb).
const photoBody = json({ limit: '15mb' });

// Auth routes (register accepts a guest token so the guest's history is kept)
router.post('/auth/register', registerLimiter, optionalAuthMiddleware, register);
router.post('/auth/login', loginLimiter, login);
router.post('/auth/guest', guestLimiter, createGuest);
router.get('/auth/me', authMiddleware, getMe);

// Billing (Pro plan). /billing/return only shows a page; it never grants anything.
router.get('/billing/config', getBillingConfig);
router.post('/billing/checkout', billingLimiter, authMiddleware, asyncHandler(createCheckout));
router.post('/billing/confirm', billingLimiter, authMiddleware, asyncHandler(confirmPayment));
router.get('/billing/return', billingReturn);

// Proof & Olympiad Analysis routes
router.post('/proof/analyze', authMiddleware, photoBody, asyncHandler(analyzeProof));
router.post('/proof/re-analyze', authMiddleware, photoBody, asyncHandler(analyzeProof));
router.get('/proof/history', authMiddleware, getHistory);
router.get('/proof/engine-status', getGeminiStatus);
router.get('/proof/gemini-status', getGeminiStatus);
router.post('/proof/scan', authMiddleware, photoBody, asyncHandler(scanProof));
router.get('/proof/:id', authMiddleware, getProofById);

// User Problems Bank & Per-Problem Solutions
router.get('/problems', authMiddleware, getProblems);
router.post('/problems', authMiddleware, photoBody, asyncHandler(createProblem));
router.get('/problems/:id', authMiddleware, getProblemById);
router.post('/problems/:id/solutions', authMiddleware, photoBody, asyncHandler(submitProblemSolution));
router.delete('/problems/:id', authMiddleware, deleteProblem);

export default router;
