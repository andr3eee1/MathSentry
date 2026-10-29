import { Response } from 'express';
import { db } from '../db';

const DEFAULT_DAILY_LIMIT = 20;
const DEFAULT_GUEST_DAILY_LIMIT = 5;
const DEFAULT_PRO_DAILY_LIMIT = 200;
const DEFAULT_GLOBAL_DAILY_LIMIT = 2000;

function envInt(name: string, fallback: number): number {
  const parsed = parseInt(process.env[name] || '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export type UserTier = 'guest' | 'free' | 'pro';

export function tierOf(isGuest: boolean, isPro: boolean): UserTier {
  return isGuest ? 'guest' : isPro ? 'pro' : 'free';
}

export function dailyLimitFor(tier: UserTier): number {
  if (tier === 'guest') return envInt('GUEST_DAILY_ANALYSIS_LIMIT', DEFAULT_GUEST_DAILY_LIMIT);
  if (tier === 'pro') return envInt('PRO_DAILY_ANALYSIS_LIMIT', DEFAULT_PRO_DAILY_LIMIT);
  return envInt('DAILY_ANALYSIS_LIMIT', DEFAULT_DAILY_LIMIT);
}

function startOfUtcDay(): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

export function usedToday(userId: string): number {
  const row = db
    .prepare('SELECT COUNT(*) as count FROM usage_events WHERE user_id = ? AND created_at >= ?')
    .get(userId, startOfUtcDay()) as { count: number };
  return row.count;
}

export type Reservation = { error: string; code: 'QUOTA_EXCEEDED' | 'ENGINE_UNAVAILABLE' } | { eventId: number };

const GLOBAL_LIMIT_MESSAGE = 'Serviciul este foarte solicitat azi. Încearcă din nou mâine.';

/**
 * Atomically checks the per-user and global daily limits and books one usage
 * event. better-sqlite3 is synchronous, so the transaction cannot interleave
 * with other requests. Call releaseQuota() if the audit did not consume AI.
 */
export function reserveQuota(userId: string, isGuest: boolean, kind: string, isPro = false): Reservation {
  return db.transaction((): Reservation => {
    const start = startOfUtcDay();
    const globalRow = db
      .prepare('SELECT COUNT(*) as count FROM usage_events WHERE created_at >= ?')
      .get(start) as { count: number };
    if (globalRow.count >= envInt('GLOBAL_DAILY_AUDIT_LIMIT', DEFAULT_GLOBAL_DAILY_LIMIT)) {
      return { error: GLOBAL_LIMIT_MESSAGE, code: 'ENGINE_UNAVAILABLE' };
    }

    const limit = dailyLimitFor(tierOf(isGuest, isPro));
    if (usedToday(userId) >= limit) {
      return {
        error: isGuest
          ? `Ai folosit cele ${limit} audituri gratuite de azi. Creează un cont gratuit pentru mai multe.`
          : `Ai atins limita de ${limit} audituri pe zi. Revino mâine.`,
        code: 'QUOTA_EXCEEDED',
      };
    }

    const info = db
      .prepare('INSERT INTO usage_events (user_id, kind, created_at) VALUES (?, ?, ?)')
      .run(userId, kind, new Date().toISOString());
    return { eventId: Number(info.lastInsertRowid) };
  })();
}

export function releaseQuota(eventId: number): void {
  db.prepare('DELETE FROM usage_events WHERE id = ?').run(eventId);
}

/** Sends the 429/503 response for a failed reservation. */
export function sendReservationError(res: Response, reservation: { error: string; code: string }): void {
  res
    .status(reservation.code === 'QUOTA_EXCEEDED' ? 429 : 503)
    .json({ error: reservation.error, code: reservation.code });
}
