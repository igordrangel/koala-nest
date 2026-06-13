---
title: Variáveis de ambiente
slug: variaveis-de-ambiente
category: inicio
docKey: inicio/variaveis-de-ambiente
order: 1
description: Configuração e validação de variáveis de ambiente com Zod.
---

# Variáveis de ambiente

O Koala Nest valida variáveis de ambiente na inicialização usando **Zod**. Valores inválidos impedem o boot da aplicação, evitando erros silenciosos em runtime.

## Schema de ambiente

O schema fica em `src/core/env.ts`:

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

## Arquivo `.env`

Crie um `.env` na raiz do projeto (a CLI também copia `.env.example` como referência):

```env
PORT=3000
NODE_ENV=develop
DATABASE_URL=postgresql://postgres:root@localhost:5432/koala_nest
```

### Autenticação (quando instalada)

```env
JWT_PRIVATE_KEY=<chave privada RS256 em base64>
JWT_PUBLIC_KEY=<chave pública RS256 em base64>
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_TOKEN_EXPIRES_IN=7d
API_HOST=http://localhost:3000
```

### OAuth2 (qualquer provedor)

Suporta **N provedores** via lista em `OAUTH2_PROVIDERS`. Google e Microsoft no `.env.example` são só exemplos — repita `OAUTH2_{CHAVE}_*` para cada IdP (Auth0, Keycloak, Okta, etc.).

Guia completo: [Autenticação](../host/autenticacao.md#oauth2-qualquer-provedor-qualquer-quantidade).

```env
OAUTH2_PROVIDERS=google,auth0,keycloak
OAUTH2_AUTH0_DOMAIN=https://tenant.auth0.com
OAUTH2_AUTH0_CLIENT_ID=...
OAUTH2_AUTH0_CLIENT_SECRET=...
OAUTH2_AUTH0_SCOPE=openid profile email
```

**Servidor OAuth próprio** (sem discovery OIDC): `OAUTH2_{CHAVE}_AUTHORIZATION_URL`, `_TOKEN_URL`, `_USERINFO_URL`.

O `state` do OAuth2 é gravado temporariamente na API (anti-CSRF). **Redis não é obrigatório** — em instância única, memória basta. Com **várias réplicas**, recomenda-se `REDIS_CONNECTION_STRING` para o `state` ser validado em qualquer instância. Detalhes: [Validação do `state`](../host/autenticacao.md#validacao-do-state-autenticidade-do-fluxo).

### Cache (Redis)

`ICacheService` é para **cache de dados** nos handlers — sem relação com autenticação. Veja [Cache (Redis)](../core/cache.md).

| Cenário | Implementação |
|----------|---------------|
| `REDIS_CONNECTION_STRING` definido | `RedisCacheService` (ioredis) |
| Redis ausente | `InMemoryCacheService` (processo local) |
| Várias réplicas da API | **Recomendado** Redis (cache compartilhado, lock de CronJob, `state` OAuth2) |
| `NODE_ENV=test` | Lock de CronJob ignorado (testes) |

```env
# Opcional em instância única; recomendado com várias réplicas
# REDIS_CONNECTION_STRING=redis://localhost:6379
CACHE_KEY_PREFIX=koala-nest
```

Chaves no Redis são prefixadas com `CACHE_KEY_PREFIX` (padrão: nome do app). Exemplo de uso:

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

Veja [Cache (Redis)](../core/cache.md) e [Cron e Event Jobs](../core/cron-event-jobs.md).

### Jobs em background

```env
CRON_JOBS_ENABLED=true
BOOTSTRAP_DELAY_MS=0
```

| Variável | Descrição |
| --- | --- |
| `CRON_JOBS_ENABLED` | Habilita CronJobs no `JobsBootstrapService` (`true` no template de exemplo; defina `false` para desligar) |
| `BOOTSTRAP_DELAY_MS` | Aguarda N ms antes de iniciar jobs (warm-up de dependências) |

## Integração com ConfigModule

O `AppModule` registra o schema como validador global do NestJS:

```typescript
ConfigModule.forRoot({
  isGlobal: true,
  validate: (config) => validateEnvConfig(config),
}),
```

Na validação, variáveis `OAUTH2_{PROVIDER}_*` do `.env` são normalizadas em `OAUTH2_PROVIDER_ENV` (mapa tipado por provider).

## EnvService

A infraestrutura acessa variáveis tipadas via `EnvService`:

```typescript
env.get('DATABASE_URL');
env.get('OAUTH2_PROVIDER_ENV').google?.clientId;
```

## Estender o schema

Para adicionar novas variáveis fixas, inclua-as em `envSchema` e atualize o `.env.example`. Providers OAuth2 extras continuam no `.env` como `OAUTH2_{PROVIDER}_*`; o bootstrap agrupa tudo em `OAUTH2_PROVIDER_ENV`.
