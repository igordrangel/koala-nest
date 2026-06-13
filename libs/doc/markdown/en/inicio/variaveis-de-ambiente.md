---
title: Environment variables
slug: variaveis-de-ambiente
category: inicio
order: 1
description: Environment variable configuration and validation with Zod.
---

# Environment variables

Koala Nest validates environment variables on startup using **Zod**. Invalid values prevent the application from booting, avoiding silent runtime errors.

## Environment schema

The schema lives in `src/core/env.ts`:

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

## `.env` file

Create a `.env` at the project root (the CLI also copies `.env.example` as a reference):

```env
PORT=3000
NODE_ENV=develop
DATABASE_URL=postgresql://postgres:root@localhost:5432/koala_nest
```

The `REDIS_CONNECTION_STRING` variable is optional and reserved for future caching features.

## ConfigModule integration

`AppModule` registers the schema as the global NestJS validator. The example below reflects the **CRUD Example** template (with `PersonModule`):

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

## EnvService in infrastructure

The infrastructure layer accesses typed variables via `EnvService`, injected into the DataSource factory. In the **CRUD Example** template, Person entities are already registered:

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

## Extending the schema

To add new variables, include them in `envSchema` and update the project's `.env.example`. The `Env` type is inferred automatically.
