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

### Generic OAuth2 (optional)

Per-provider variables (`OAUTH2_{KEY}_*`) are read via `EnvService.getDynamic()`:

```env
OAUTH2_PROVIDERS=google,microsoft
OAUTH2_GOOGLE_DOMAIN=https://accounts.google.com
OAUTH2_GOOGLE_CLIENT_ID=...
OAUTH2_GOOGLE_CLIENT_SECRET=...
OAUTH2_GOOGLE_SCOPE=openid profile email
```

## ConfigModule integration

`AppModule` registers the schema as the global NestJS validator:

```typescript
ConfigModule.forRoot({
  isGlobal: true,
  validate: (config) => envSchema.parse(config),
}),
```

## EnvService

Infrastructure accesses typed variables via `EnvService`:

```typescript
env.get('DATABASE_URL');
env.getDynamic('OAUTH2_GOOGLE_CLIENT_ID'); // outside Zod schema
```

## Extending the schema

To add new fixed variables, include them in `envSchema` and update `.env.example`. Extra OAuth2 providers only need `OAUTH2_{PROVIDER}_*` variables in `.env`.
