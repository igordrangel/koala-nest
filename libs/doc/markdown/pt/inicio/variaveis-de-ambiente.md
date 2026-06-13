---
title: Variáveis de ambiente
slug: variaveis-de-ambiente
category: inicio
order: 1
description: Configuração e validação de variáveis de ambiente com Zod.
---

# Variáveis de ambiente

O Koala Nest valida variáveis de ambiente na inicialização usando **Zod**. Valores inválidos impedem o boot da aplicação, evitando erros silenciosos em runtime.

## Schema de ambiente

O schema fica em `src/core/env.ts`:

```typescript
import 'dotenv/config';
import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['test', 'develop', 'staging', 'production']),
  DATABASE_URL: z.string(),
  REDIS_CONNECTION_STRING: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;
```

## Arquivo `.env`

Crie um `.env` na raiz do projeto (a CLI também copia `.env.example` como referência):

```env
PORT=3000
NODE_ENV=develop
DATABASE_URL=postgresql://postgres:root@localhost:5432/koala_nest
```

A variável `REDIS_CONNECTION_STRING` é opcional e reservada para funcionalidades futuras de cache.

## Integração com ConfigModule

O `AppModule` registra o schema como validador global do NestJS. O exemplo abaixo reflete o template **Exemplo de CRUD** (com `PersonModule`):

```typescript
import { envSchema } from '@/core/env';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PersonModule } from './controllers/person/person.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => envSchema.parse(config),
    }),
    PersonModule,
  ],
})
export class AppModule {}
```

## EnvService na infraestrutura

A camada de infraestrutura acessa variáveis tipadas via `EnvService`, injetado no factory do DataSource. No template **Exemplo de CRUD**, as entidades Person já estão registradas:

```typescript
// src/infra/database/data-source-factory.ts
export async function dataSourceFactory(env: EnvService) {
  const dataSource = new DataSource({
    type: 'postgres',
    url: env.get('DATABASE_URL'),
    entities: [Person, PersonAddress, PersonContact],
    invalidWhereValuesBehavior: {
      undefined: 'ignore',
    },
  });

  await dataSource.initialize();

  return dataSource;
}
```

## Estender o schema

Para adicionar novas variáveis, inclua-as em `envSchema` e atualize o `.env.example` do projeto. O tipo `Env` é inferido automaticamente.
