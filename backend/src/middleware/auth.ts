import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db, EXAMPLES_USER_ID } from '../db';

const DEV_JWT_SECRET = 'mathsentry_dev_only_secret';
const isDevelopment = process.env.NODE_ENV === 'development';

// Only an explicit NODE_ENV=development may fall back to the built-in secret.
if (!isDevelopment && (process.env.JWT_SECRET || '').length < 32) {
  throw new Error('JWT_SECRET (at least 32 characters) is required unless NODE_ENV=development.');
}

export const JWT_SECRET = process.env.JWT_SECRET || DEV_JWT_SECRET;

export interface AuthenticatedRequest extends Request {
  userId?: string;
  isGuest?: boolean;
}

/** Resolves the bearer token to an existing user, or null. */
function resolveUser(req: Request): { id: string; isGuest: boolean } | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET, { algorithms: ['HS256'] }) as { userId: string };
    // The public examples account must never act as a session, even with a forged token
    if (decoded.userId === EXAMPLES_USER_ID) return null;
    const user = db.prepare('SELECT id, is_guest FROM users WHERE id = ?').get(decoded.userId) as
      | { id: string; is_guest: number }
      | undefined;
    return user ? { id: user.id, isGuest: Boolean(user.is_guest) } : null;
  } catch {
    return null;
  }
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const user = resolveUser(req);
  if (!user) {
    res.status(401).json({ error: 'Sesiunea a expirat. Autentifică-te din nou.' });
    return;
  }
  req.userId = user.id;
  req.isGuest = user.isGuest;
  next();
}

export function optionalAuthMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const user = resolveUser(req);
  if (user) {
    req.userId = user.id;
    req.isGuest = user.isGuest;
  }
  next();
}
