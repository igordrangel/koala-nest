---
title: Environment variables
slug: environment-variables
category: getting-started
docKey: inicio/variaveis-de-ambiente
order: 1
description: Environment variable configuration and validation with Zod.
---

# Environment variables

Koala Nest validates environment variables on startup using **Zod**. Invalid values prevent the application from booting, avoiding silent runtime errors.

## Environment schema

The schema lives in `src/core/env.ts`:

```typescript
import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['test', 'develop', 'staging', 'production']),
  DATABASE_URL: z.string(),
  REDIS_CONNECTION_STRING: z.string().optional(),
  CACHE_KEY_PREFIX: z.string().optional(),
  CRON_JOBS_ENABLED: z.coerce.boolean().default(false),
  BOOTSTRAP_DELAY_MS: z.coerce.number().default(0),
  JWT_PRIVATE_KEY: z.string().optional(),
  JWT_PUBLIC_KEY: z.string().optional(),
  JWT_ACCESS_TOKEN_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
  API_HOST: z.string().optional(),
  OAUTH2_PROVIDERS: z.string().optional(),
});
```

## `.env` file

Create a `.env` at the project root (the CLI also copies `.env.example` as a reference):

```env
PORT=3000
NODE_ENV=develop
DATABASE_URL=postgresql://postgres:root@localhost:5432/koala_nest
```

### Authentication (when installed)

```env
JWT_PRIVATE_KEY=<RS256 private key in base64>
JWT_PUBLIC_KEY=<RS256 public key in base64>
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_TOKEN_EXPIRES_IN=7d
API_HOST=http://localhost:3000
```

### OAuth2 (any provider)

Supports **N providers** via `OAUTH2_PROVIDERS`. Google and Microsoft in `.env.example` are examples only — repeat `OAUTH2_{KEY}_*` for each IdP (Auth0, Keycloak, Okta, etc.).

Full guide: [Authentication](../host/authentication.md#oauth2-any-provider-any-quantity).

```env
OAUTH2_PROVIDERS=google,auth0,keycloak
OAUTH2_AUTH0_DOMAIN=https://tenant.auth0.com
OAUTH2_AUTH0_CLIENT_ID=...
OAUTH2_AUTH0_CLIENT_SECRET=...
OAUTH2_AUTH0_SCOPE=openid profile email
```

**Your own OAuth server** (no OIDC discovery): `OAUTH2_{KEY}_AUTHORIZATION_URL`, `_TOKEN_URL`, `_USERINFO_URL`.

OAuth2 `state` is stored temporarily on the API (anti-CSRF). **Redis is not required** — a single instance can use in-memory storage. With **multiple replicas**, `REDIS_CONNECTION_STRING` is **recommended** so any instance can validate `state`. Details: [State validation](../host/authentication.md#state-validation-flow-authenticity).

### Cache (Redis)

`ICacheService` is for **data caching** in handlers — unrelated to authentication. See [Cache (Redis)](../core/cache.md).

| Scenario | Implementation |
|----------|----------------|
| `REDIS_CONNECTION_STRING` set | `RedisCacheService` (ioredis) |
| Redis unset | `InMemoryCacheService` (process-local) |
| Multiple API replicas | **Recommended** Redis (shared cache, CronJob lock, OAuth2 `state`) |
| `NODE_ENV=test` | CronJob lock skipped (tests) |

```env
# Optional on a single instance; recommended with multiple replicas
# REDIS_CONNECTION_STRING=redis://localhost:6379
CACHE_KEY_PREFIX=koala-nest
```

Redis keys are prefixed with `CACHE_KEY_PREFIX` (default: app name). Usage example:

```typescript
@Injectable()
export class MyHandler {
  constructor(private readonly cache: ICacheService) {}

  async handle() {
    const cached = await this.cache.get('person:1');
    if (!cached) {
      await this.cache.set('person:1', JSON.stringify(data), 300);
    }
  }
}
```

See [Cache (Redis)](../core/cache.md) and [Cron and Event Jobs](../core/cron-event-jobs.md).

### Background jobs

```env
CRON_JOBS_ENABLED=true
BOOTSTRAP_DELAY_MS=0
```

| Variable | Description |
| --- | --- |
| `CRON_JOBS_ENABLED` | Enables CronJobs in `JobsBootstrapService` (`true` in the example template; set `false` to disable) |
| `BOOTSTRAP_DELAY_MS` | Waits N ms before starting jobs (dependency warm-up) |

## ConfigModule integration

`AppModule` registers the schema as the global NestJS validator:

```typescript
ConfigModule.forRoot({
  isGlobal: true,
  validate: (config) => validateEnvConfig(config),
}),
```

During validation, `.env` keys `OAUTH2_{PROVIDER}_*` are normalized into `OAUTH2_PROVIDER_ENV` (typed map per provider).

## EnvService

Infrastructure accesses typed variables via `EnvService`:

```typescript
env.get('DATABASE_URL');
env.get('OAUTH2_PROVIDER_ENV').google?.clientId;
```

## Extending the schema

To add new fixed variables, include them in `envSchema` and update `.env.example`. Extra OAuth2 providers still use `OAUTH2_{PROVIDER}_*` in `.env`; bootstrap groups them into `OAUTH2_PROVIDER_ENV`.
