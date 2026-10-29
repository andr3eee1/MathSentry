import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { db } from '../db';
import { JWT_SECRET, AuthenticatedRequest } from '../middleware/auth';
import { newId } from '../services/analysisStore';
import { dailyLimitFor, tierOf, usedToday } from '../services/quota';
import { isProRow } from '../services/billing';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function signToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
}

function publicUser(row: any) {
  return {
    id: row.id,
    email: row.is_guest ? '' : row.email,
    username: row.username,
    rank: row.rank,
    streak: row.streak,
    isGuest: Boolean(row.is_guest),
    plan: isProRow(row) ? 'pro' : 'free',
    proUntil: isProRow(row) ? row.pro_until : null,
  };
}

const MAX_PASSWORD_CHARS = 128;
// Burns the same time as a real check so unknown emails are not distinguishable by latency
const DUMMY_HASH = bcrypt.hashSync('mathsentry-dummy-password', 10);

export const register = (req: AuthenticatedRequest, res: Response): void => {
  const email = String(req.body.email || '').toLowerCase().trim();
  const password = String(req.body.password || '');
  const username = String(req.body.username || '').trim().slice(0, 80);

  if (!email || !password || !username) {
    res.status(400).json({ error: 'Email, parola și numele sunt obligatorii.' });
    return;
  }
  if (!EMAIL_RE.test(email)) {
    res.status(400).json({ error: 'Adresa de email nu este validă.' });
    return;
  }
  if (password.length > MAX_PASSWORD_CHARS) {
    res.status(400).json({ error: `Parola poate avea cel mult ${MAX_PASSWORD_CHARS} de caractere.` });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: 'Parola trebuie să conțină minim 6 caractere.' });
    return;
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    res.status(409).json({ error: 'Există deja un cont asociat acestei adrese de email.' });
    return;
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  // A guest who signs up keeps their history: upgrade the guest row in place.
  if (req.userId && req.isGuest) {
    db.prepare('UPDATE users SET email = ?, password_hash = ?, username = ?, is_guest = 0 WHERE id = ?')
      .run(email, passwordHash, username, req.userId);
    const upgraded = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
    res.status(201).json({ token: signToken(req.userId), user: publicUser(upgraded) });
    return;
  }

  const userId = newId('user');
  db.prepare(`
    INSERT INTO users (id, email, password_hash, username, rank, streak, created_at, is_guest)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0)
  `).run(userId, email, passwordHash, username, 'Olympiad Candidate', 0, new Date().toISOString());

  const created = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  res.status(201).json({ token: signToken(userId), user: publicUser(created) });
};

export const login = (req: Request, res: Response): void => {
  const email = String(req.body.email || '').toLowerCase().trim();
  const password = String(req.body.password || '');

  if (!email || !password) {
    res.status(400).json({ error: 'Introduceți adresa de email și parola.' });
    return;
  }

  if (password.length > MAX_PASSWORD_CHARS) {
    res.status(400).json({ error: `Parola poate avea cel mult ${MAX_PASSWORD_CHARS} de caractere.` });
    return;
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ? AND is_guest = 0').get(email) as any;
  if (!user) {
    bcrypt.compareSync(password, DUMMY_HASH);
    res.status(401).json({ error: 'Email sau parolă incorectă.' });
    return;
  }
  if (!user.password_hash.startsWith('$2') || !bcrypt.compareSync(password, user.password_hash)) {
    res.status(401).json({ error: 'Email sau parolă incorectă.' });
    return;
  }

  res.json({ token: signToken(user.id), user: publicUser(user) });
};

/** Creates a private anonymous account so guests never share data. */
export const createGuest = (req: Request, res: Response): void => {
  const userId = newId('guest');
  db.prepare(`
    INSERT INTO users (id, email, password_hash, username, rank, streak, created_at, is_guest)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `).run(
    userId,
    `${userId}@guest.mathsentry.local`,
    randomBytes(16).toString('hex'), // not a bcrypt hash: guests cannot log in with a password
    'Oaspete',
    'Olympiad Explorer',
    0,
    new Date().toISOString()
  );

  const created = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  res.status(201).json({ token: signToken(userId), user: publicUser(created) });
};

/** Consecutive days (ending today or yesterday) with at least one analysis. */
function computeStreak(userId: string): number {
  const rows = db.prepare(`
    SELECT DISTINCT substr(created_at, 1, 10) as day
    FROM proof_analyses WHERE user_id = ?
    ORDER BY day DESC LIMIT 366
  `).all(userId) as Array<{ day: string }>;

  const days = new Set(rows.map((r) => r.day));
  const cursor = new Date();
  const key = () => cursor.toISOString().slice(0, 10);

  if (!days.has(key())) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    if (!days.has(key())) return 0;
  }

  let streak = 0;
  while (days.has(key())) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

export const getMe = (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.userId!;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
  if (!user) {
    res.status(404).json({ error: 'Utilizatorul nu a fost găsit.' });
    return;
  }

  const agg = db.prepare(`
    SELECT COUNT(*) as total,
           SUM(CASE WHEN phase = 'sound' THEN 1 ELSE 0 END) as sound,
           AVG(onm_score) as avgOnm
    FROM proof_analyses WHERE user_id = ?
  `).get(userId) as { total: number; sound: number | null; avgOnm: number | null };

  const total = agg.total || 0;
  const limit = dailyLimitFor(tierOf(Boolean(user.is_guest), isProRow(user)));

  res.json({
    user: publicUser(user),
    stats: {
      totalProofs: total,
      soundPercentage: total > 0 ? Math.round(((agg.sound || 0) / total) * 100) : 0,
      averageOnm: total > 0 ? Math.round((agg.avgOnm || 0) * 100) / 100 : null,
      streak: computeStreak(userId),
      rank: user.rank || 'Olympiad Candidate',
      auditsLeftToday: Math.max(0, limit - usedToday(userId)),
      dailyLimit: limit,
    },
  });
};
