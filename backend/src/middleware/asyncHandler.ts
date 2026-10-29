import { Request, Response, NextFunction, RequestHandler } from 'express';

/** Express 4 ignores rejected promises; forward them to the JSON error handler. */
export function asyncHandler(
  fn: (req: any, res: Response, next: NextFunction) => Promise<unknown> | unknown
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
