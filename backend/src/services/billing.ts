import { db } from '../db';

export type BillingMode = 'stripe' | 'demo' | 'disabled';

function envInt(name: string, fallback: number): number {
  const parsed = parseInt(process.env[name] || '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function billingMode(): BillingMode {
  if ((process.env.STRIPE_SECRET_KEY || '').trim()) return 'stripe';
  if (process.env.BILLING_DEMO === 'true' || process.env.NODE_ENV === 'development') return 'demo';
  return 'disabled';
}

export const priceBani = (): number => envInt('PRO_PRICE_BANI', 1999);
export const periodDays = (): number => envInt('PRO_PERIOD_DAYS', 30);

export function priceLabel(): string {
  const bani = priceBani();
  const lei = Math.floor(bani / 100);
  const rest = bani % 100;
  return `${lei}${rest ? ',' + String(rest).padStart(2, '0') : ''} lei / lună`;
}

/** A user is Pro only while plan = 'pro' and pro_until is in the future. */
export function isProRow(row: { plan?: string | null; pro_until?: string | null }): boolean {
  return row.plan === 'pro' && !!row.pro_until && new Date(row.pro_until).getTime() > Date.now();
}

/** Extends Pro to max(now, current pro_until) + periodDays and returns the new expiry. */
export function grantPro(userId: string): string {
  const row = db.prepare('SELECT plan, pro_until FROM users WHERE id = ?').get(userId) as
    | { plan: string; pro_until: string | null }
    | undefined;
  const base = row && isProRow(row) ? new Date(row.pro_until as string).getTime() : Date.now();
  const proUntil = new Date(base + periodDays() * 86400000).toISOString();
  db.prepare("UPDATE users SET plan = 'pro', pro_until = ? WHERE id = ?").run(proUntil, userId);
  return proUntil;
}
