import type { NextFunction, Request, Response } from 'express';

export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

export function createRateLimitMiddleware(options: RateLimitOptions) {
  const hits = new Map<string, number[]>();

  return (req: Request, res: Response, next: NextFunction) => {
    if (options.maxRequests <= 0) {
      next();
      return;
    }

    const key = req.ip ?? req.socket.remoteAddress ?? 'unknown';
    const now = Date.now();
    const windowStart = now - options.windowMs;
    const timestamps = (hits.get(key) ?? []).filter(
      (timestamp) => timestamp > windowStart,
    );

    if (timestamps.length >= options.maxRequests) {
      res.status(429).json({
        statusCode: 429,
        message: 'Muitas requisições. Tente novamente em instantes.',
      });
      return;
    }

    timestamps.push(now);
    hits.set(key, timestamps);
    next();
  };
}
