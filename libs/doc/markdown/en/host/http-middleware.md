---
title: HTTP middleware
slug: http-middleware
category: host
docKey: host/middleware-http
order: 0
description: Helmet, CORS, cookies, rate limit, and HTTP bootstrap via applyHttpMiddleware.
---

# HTTP middleware

Helmet, CORS, `cookie-parser`, and rate limiting are applied in one place: `applyHttpMiddleware` in `src/host/bootstrap/apply-http-middleware.ts`. `main.ts` calls it right after `NestFactory.create`.

```typescript
import { applyHttpMiddleware } from '@/host/bootstrap/apply-http-middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  applyHttpMiddleware(app);
  // ...
}
```

## Helmet (security headers)

The bootstrap registers [`helmet`](https://helmetjs.github.io/) **before** cookies, rate limit, and CORS. Configuration follows the Globo Seguros pattern:

| Option | Behavior |
| --- | --- |
| `contentSecurityPolicy` | Restrictive CSP (`defaultSrc: none`); Scalar scripts/styles/images via `cdn.jsdelivr.net`; fonts also from `fonts.scalar.com` |
| `hsts` | Enabled only when `NODE_ENV=production` |
| `upgradeInsecureRequests` | Production only |
| `crossOriginEmbedderPolicy` | `false` (compatible with Scalar / external assets) |

Other Helmet defaults (X-Content-Type-Options, X-Frame-Options, etc.) stay enabled.

## CORS

By default the API accepts **any origin** (`origin: true` with `credentials: true`), aligned with publicly consumable APIs.

To restrict, set `CORS_ORIGINS` in `.env` (comma-separated origins):

```env
CORS_ORIGINS=http://localhost:4200,https://app.example.com
```

Resolution lives in `resolveCorsOrigin()` (`src/core/utils/resolve-cors-origins.ts`):

| `CORS_ORIGINS` | Behavior |
| --- | --- |
| missing or empty | `true` — reflects the request origin |
| single origin | string |
| multiple origins | array of strings |

## Rate limit

Middleware in `src/core/http/rate-limit.middleware.ts`, registered by the bootstrap. **Disabled by default** (`RATE_LIMIT_MAX=0`).

```env
RATE_LIMIT_MAX=300
RATE_LIMIT_WINDOW_MS=60000
```

| Variable | Default | Description |
| --- | --- | --- |
| `RATE_LIMIT_MAX` | `0` | Max requests per IP per window; `0` disables |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Window in milliseconds |

When the limit is exceeded: HTTP **429** with a JSON message.

## Cookies

`cookie-parser` is registered in the bootstrap — required for refresh token cookies on `/auth/refresh` when JWT auth is installed.

## Tests

- `src/test/core/resolve-cors-origins.spec.ts`
- `src/test/core/http/rate-limit.middleware.spec.ts`

Layered view: [Security](./security.md).

See also: [Environment variables](../getting-started/environment-variables.md), [Project structure](../getting-started/project-structure.md).
