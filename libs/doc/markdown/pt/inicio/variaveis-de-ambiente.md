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

### OAuth2 genérico (opcional)

Variáveis dinâmicas por provider (`OAUTH2_{KEY}_*`) são lidas via `EnvService.getDynamic()`:

```env
OAUTH2_PROVIDERS=google,microsoft
OAUTH2_GOOGLE_DOMAIN=https://accounts.google.com
OAUTH2_GOOGLE_CLIENT_ID=...
OAUTH2_GOOGLE_CLIENT_SECRET=...
OAUTH2_GOOGLE_SCOPE=openid profile email
```

## Integração com ConfigModule

O `AppModule` registra o schema como validador global do NestJS:

```typescript
ConfigModule.forRoot({
  isGlobal: true,
  validate: (config) => envSchema.parse(config),
}),
```

## EnvService

A infraestrutura acessa variáveis tipadas via `EnvService`:

```typescript
env.get('DATABASE_URL');
env.getDynamic('OAUTH2_GOOGLE_CLIENT_ID'); // fora do schema Zod
```

## Estender o schema

Para adicionar novas variáveis fixas, inclua-as em `envSchema` e atualize o `.env.example`. Providers OAuth2 extras só precisam das variáveis `OAUTH2_{PROVIDER}_*` no `.env`.
