---
title: Health check
slug: health-check
category: host
docKey: host/health-check
order: 5
description: GET /health endpoint with NestJS Terminus — database and optional Redis.
---

# Health check

**Opt-in** feature installed with `kl-nest new` (multiselect) or `kl-nest add health`.

Exposes `GET /health` using [@nestjs/terminus](https://docs.nestjs.com/recipes/terminus). The endpoint is **public** (`@IsPublic()`) and **excluded from OpenAPI** (`@ApiExcludeEndpoint()`).

## Indicators

| Indicator | When it runs |
| --- | --- |
| **Database** | Always — TypeORM ping |
| **Redis** | Only when `REDIS_CONNECTION_STRING` is set in `.env` |

If `REDIS_CONNECTION_STRING` is set but the `ioredis` package is not installed (Redis cache was not added), the indicator returns `up` with a warning instead of failing the health check.

## Structure

```
src/host/controllers/health-check/
├── health-check.controller.ts
└── health-check.module.ts

src/infra/services/
├── database.indicator.service.ts
└── redis.indicator.service.ts
```

The CLI registers `HealthCheckModule` in `AppModule`.

## Sample response

```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "redis": { "status": "up" }
  },
  "error": {},
  "details": {
    "database": { "status": "up" },
    "redis": { "status": "up" }
  }
}
```

## Related variables

| Variable | Health effect |
| --- | --- |
| `REDIS_CONNECTION_STRING` | Enables Redis check |
| Other DB vars | Used by TypeORM ping |

## Next steps

- [Cache (Redis)](../core/cache.md) — install `ioredis` for cache and real Redis ping
- [Environment variables](../getting-started/environment-variables.md)
