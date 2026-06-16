import { createRateLimitMiddleware } from '@/core/http/rate-limit.middleware';
import { resolveCorsOrigin } from '@/core/utils/resolve-cors-origins';
import { EnvService } from '@/infra/common/env.service';
import type { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';

export function applyHttpMiddleware(app: INestApplication) {
  const env = app.get(EnvService);

  app.use(cookieParser());
  app.use(
    createRateLimitMiddleware({
      windowMs: env.get('RATE_LIMIT_WINDOW_MS'),
      maxRequests: env.get('RATE_LIMIT_MAX'),
    }),
  );
  app.enableCors({
    credentials: true,
    origin: resolveCorsOrigin(env.get('CORS_ORIGINS')),
    optionsSuccessStatus: 200,
  });
}
