import { Request, Response } from 'express';
import mock from '../fixtures/mock.json';

export const health = (_req: Request, res: Response) => res.json({ status: 'ok' });
export const scan = (_req: Request, res: Response) => res.json(mock.scan);
export const inspect = (_req: Request, res: Response) => res.json(mock.inspect);
export const hint = (_req: Request, res: Response) => res.json(mock.hint);
export const feedback = (_req: Request, res: Response) => res.json({ ok: true });
