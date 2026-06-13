---
title: Health check
slug: health-check
category: host
docKey: host/health-check
order: 5
description: Endpoint GET /health com NestJS Terminus — banco e Redis opcional.
---

# Health check

Feature **opt-in** instalada com `kl-nest new` (multiselect) ou `kl-nest add health`.

Expõe `GET /health` usando [@nestjs/terminus](https://docs.nestjs.com/recipes/terminus). O endpoint é **público** (`@IsPublic()`) e **omitido do OpenAPI** (`@ApiExcludeEndpoint()`).

## Indicadores

| Indicador | Quando roda |
| --- | --- |
| **Database** | Sempre — ping TypeORM |
| **Redis** | Apenas se `REDIS_CONNECTION_STRING` estiver definido no `.env` |

Se `REDIS_CONNECTION_STRING` existir mas o pacote `ioredis` não estiver instalado (cache Redis não foi adicionado), o indicador retorna `up` com aviso em vez de falhar o health check.

## Estrutura

```
src/host/controllers/health-check/
├── health-check.controller.ts
└── health-check.module.ts

src/infra/services/
├── database.indicator.service.ts
└── redis.indicator.service.ts
```

O `HealthCheckModule` é registrado no `AppModule` pela CLI.

## Exemplo de resposta

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

## Variáveis relacionadas

| Variável | Efeito no health |
| --- | --- |
| `REDIS_CONNECTION_STRING` | Ativa verificação Redis |
| Demais vars de DB | Usadas pelo ping TypeORM |

## Próximos passos

- [Cache (Redis)](../core/cache.md) — instalar `ioredis` para cache e ping Redis real
- [Variáveis de ambiente](../inicio/variaveis-de-ambiente.md)
