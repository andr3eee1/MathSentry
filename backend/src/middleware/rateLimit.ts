import { Request, Response, NextFunction } from 'express';

const MAX_TRACKED_KEYS = 10000;

/** Keys IPv4 by address and IPv6 by its /64 prefix, so one host cannot rotate through its range. */
export function ipKey(ip: string | undefined): string {
  if (!ip) return 'unknown';
  const mapped = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  if (mapped) return mapped[1];
  if (!ip.includes(':')) return ip;

  const [head, tail] = ip.split('%')[0].split('::');
  const headParts = head ? head.split(':') : [];
  const tailParts = tail !== undefined && tail ? tail.split(':') : [];
  const groups = tail === undefined
    ? headParts
    : [...headParts, ...Array(Math.max(0, 8 - headParts.length - tailParts.length)).fill('0'), ...tailParts];
  return groups.slice(0, 4).map((g) => (g || '0').toLowerCase().replace(/^0+(?=.)/, '')).join(':') + '::/64';
}

/**
 * Minimal fixed-window, per-IP rate limiter (in memory, single instance).
 * Swap for a Redis-backed limiter when running more than one server.
 */
export function rateLimit({ windowMs, max }: { windowMs: number; max: number }) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now();
    const key = ipKey(req.ip);
    const entry = hits.get(key);

    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      if (hits.size > MAX_TRACKED_KEYS) {
        for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
        // Still too many live entries: drop the oldest (Map keeps insertion order)
        for (const k of hits.keys()) {
          if (hits.size <= MAX_TRACKED_KEYS) break;
          hits.delete(k);
        }
      }
      next();
      return;
    }

    entry.count++;
    if (entry.count > max) {
      res.setHeader('Retry-After', Math.ceil((entry.resetAt - now) / 1000));
      res.status(429).json({ error: 'Prea multe încercări. Așteaptă puțin și încearcă din nou.' });
      return;
    }
    next();
  };
}
