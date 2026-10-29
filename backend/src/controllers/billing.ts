import { Request, Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest } from '../middleware/auth';
import { newId } from '../services/analysisStore';
import { billingMode, grantPro, periodDays, priceBani, priceLabel } from '../services/billing';

const STRIPE_API = 'https://api.stripe.com/v1';
const STRIPE_TIMEOUT_MS = 15000;
const DEMO_CARD = '4242424242424242';
const STRIPE_ERROR = 'Procesatorul de plăți nu a răspuns. Încearcă din nou în câteva momente.';

export const getBillingConfig = (req: Request, res: Response): void => {
  res.json({
    mode: billingMode(),
    priceBani: priceBani(),
    currency: 'RON',
    priceLabel: priceLabel(),
    periodDays: periodDays(),
  });
};

/** Calls Stripe's REST API; throws a message-free error so the key can never leak. */
async function stripeRequest(method: 'GET' | 'POST', path: string, form?: URLSearchParams): Promise<any> {
  const response = await fetch(`${STRIPE_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${(process.env.STRIPE_SECRET_KEY || '').trim()}`,
      ...(form ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
    },
    body: form ? form.toString() : undefined,
    signal: AbortSignal.timeout(STRIPE_TIMEOUT_MS),
  });
  const data: any = await response.json().catch(() => null);
  if (!response.ok || !data) {
    console.error(`Stripe ${method} ${path.split('?')[0]} failed: HTTP ${response.status} ${data?.error?.code || ''}`);
    throw new StripeFailure();
  }
  return data;
}

class StripeFailure extends Error {}

const sendStripeError = (res: Response): void => {
  res.status(502).json({ error: STRIPE_ERROR, code: 'BILLING_PROVIDER_ERROR' });
};

export const createCheckout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (req.isGuest) {
    res.status(403).json({ error: 'Creează un cont gratuit înainte de a trece la Pro.', code: 'ACCOUNT_REQUIRED' });
    return;
  }
  const userId = req.userId!;
  const mode = billingMode();

  if (mode === 'disabled') {
    res.status(503).json({ error: 'Plățile nu sunt disponibile momentan.', code: 'BILLING_DISABLED' });
    return;
  }

  if (mode === 'demo') {
    const sessionId = newId('demo');
    db.prepare(`
      INSERT INTO payments (user_id, provider, external_id, amount_bani, currency, status, created_at)
      VALUES (?, 'demo', ?, ?, 'RON', 'pending', ?)
    `).run(userId, sessionId, priceBani(), new Date().toISOString());
    res.json({ mode: 'demo', sessionId });
    return;
  }

  const base = (process.env.PUBLIC_API_BASE || `${req.protocol}://${req.get('host')}`).replace(/\/+$/, '');
  const form = new URLSearchParams({
    mode: 'payment',
    'line_items[0][price_data][currency]': 'ron',
    'line_items[0][price_data][unit_amount]': String(priceBani()),
    'line_items[0][price_data][product_data][name]': `MathSentry Pro (${periodDays()} zile)`,
    'line_items[0][quantity]': '1',
    client_reference_id: userId,
    'metadata[user_id]': userId,
    success_url: `${base}/api/billing/return?status=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/api/billing/return?status=cancel`,
  });
  try {
    const session = await stripeRequest('POST', '/checkout/sessions', form);
    if (typeof session.url !== 'string' || typeof session.id !== 'string') throw new StripeFailure();
    res.json({ mode: 'stripe', url: session.url, sessionId: session.id });
  } catch (error) {
    if (!(error instanceof StripeFailure)) console.error('Stripe checkout error:', (error as Error).name);
    sendStripeError(res);
  }
};

function currentPro(userId: string): { plan: 'pro'; proUntil: string } {
  const row = db.prepare('SELECT pro_until FROM users WHERE id = ?').get(userId) as { pro_until: string };
  return { plan: 'pro', proUntil: row.pro_until };
}

export const confirmPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (req.isGuest) {
    res.status(403).json({ error: 'Creează un cont gratuit înainte de a trece la Pro.', code: 'ACCOUNT_REQUIRED' });
    return;
  }
  const userId = req.userId!;
  const sessionId = typeof req.body?.sessionId === 'string' ? req.body.sessionId.trim() : '';
  if (!sessionId || sessionId.length > 200) {
    res.status(400).json({ error: 'Sesiunea de plată lipsește.' });
    return;
  }

  if (sessionId.startsWith('cs_')) {
    if (billingMode() !== 'stripe') {
      res.status(400).json({ error: 'Sesiune de plată necunoscută.' });
      return;
    }
    if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) {
      res.status(400).json({ error: 'Sesiune de plată necunoscută.' });
      return;
    }
    let session: any;
    try {
      session = await stripeRequest('GET', `/checkout/sessions/${sessionId}`);
    } catch (error) {
      if (!(error instanceof StripeFailure)) console.error('Stripe confirm error:', (error as Error).name);
      sendStripeError(res);
      return;
    }
    if (session.client_reference_id !== userId) {
      res.status(403).json({ error: 'Această plată aparține altui cont.', code: 'PAYMENT_FORBIDDEN' });
      return;
    }
    if (session.payment_status !== 'paid') {
      res.status(402).json({ error: 'Plata nu a fost finalizată.', code: 'PAYMENT_PENDING' });
      return;
    }
    // The UNIQUE external_id makes this idempotent: only the first confirmation grants Pro.
    const proUntil = db.transaction((): string | null => {
      const info = db.prepare(`
        INSERT OR IGNORE INTO payments (user_id, provider, external_id, amount_bani, currency, status, created_at)
        VALUES (?, 'stripe', ?, ?, ?, 'paid', ?)
      `).run(
        userId,
        sessionId,
        Number.isInteger(session.amount_total) ? session.amount_total : priceBani(),
        String(session.currency || 'ron').toUpperCase(),
        new Date().toISOString()
      );
      return info.changes === 1 ? grantPro(userId) : null;
    })();
    res.json(proUntil ? { plan: 'pro', proUntil } : currentPro(userId));
    return;
  }

  if (billingMode() !== 'demo') {
    res.status(400).json({ error: 'Sesiune de plată necunoscută.' });
    return;
  }
  const card = typeof req.body?.card === 'string' ? req.body.card.replace(/\s+/g, '') : '';
  const pending = db
    .prepare("SELECT id FROM payments WHERE external_id = ? AND user_id = ? AND provider = 'demo' AND status = 'pending'")
    .get(sessionId, userId) as { id: number } | undefined;

  if (!pending) {
    // Already paid by this user: report the current state instead of extending again.
    const done = db
      .prepare("SELECT id FROM payments WHERE external_id = ? AND user_id = ? AND provider = 'demo' AND status = 'paid'")
      .get(sessionId, userId);
    if (done) {
      res.json(currentPro(userId));
      return;
    }
    res.status(404).json({ error: 'Sesiune de plată necunoscută sau expirată.', code: 'SESSION_NOT_FOUND' });
    return;
  }
  if (card !== DEMO_CARD) {
    res.status(402).json({
      error: 'Card refuzat. În modul demonstrativ folosește cardul de test 4242 4242 4242 4242.',
      code: 'CARD_DECLINED',
    });
    return;
  }
  const proUntil = db.transaction((): string | null => {
    const info = db.prepare("UPDATE payments SET status = 'paid' WHERE id = ? AND status = 'pending'").run(pending.id);
    return info.changes === 1 ? grantPro(userId) : null;
  })();
  res.json(proUntil ? { plan: 'pro', proUntil } : currentPro(userId));
};

const escapeHtml = (s: string): string => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export const billingReturn = (req: Request, res: Response): void => {
  const success = req.query.status === 'success';
  const title = success ? 'Plata a fost înregistrată' : 'Plata a fost anulată';
  const text = success
    ? 'Plata a fost înregistrată. Te poți întoarce în aplicația MathSentry.'
    : 'Plata a fost anulată. Nu s-a retras nimic. Te poți întoarce în aplicația MathSentry.';
  res
    .status(200)
    .type('html')
    .setHeader('Cache-Control', 'no-store')
    .send(`<!doctype html><html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MathSentry</title><style>body{font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0}main{max-width:420px;padding:32px;text-align:center}h1{font-size:22px}p{line-height:1.5;color:#94a3b8}</style></head><body><main><h1>${escapeHtml(title)}</h1><p>${escapeHtml(text)}</p></main></body></html>`);
};
