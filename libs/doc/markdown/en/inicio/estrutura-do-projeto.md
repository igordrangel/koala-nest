---
title: Project structure
slug: estrutura-do-projeto
category: inicio
order: 2
description: Application bootstrap, main modules, and entry point.
---

# Project structure

This guide describes how the NestJS application is initialized and how modules connect.

## Entry point

The `src/host/main.ts` file configures CORS, OpenAPI documentation, global error filter, and starts the server:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { defineDocumentation } from './open-api/define-documentation';
import { ErrorsFilter } from './filters/errors.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    credentials: true,
    origin: true,
    optionsSuccessStatus: 200,
  });

  defineDocumentation(app);

  app.useGlobalFilters(new ErrorsFilter());

  await app.listen(process.env.PORT || 3000);

  console.log(`Server is running on port ${process.env.PORT || 3000}`);
  console.log(
    `Documentation is available at http://localhost:${process.env.PORT || 3000}/doc`,
  );
}

bootstrap();
```

## Root module

`AppModule` imports environment validation and feature modules. In the **CRUD Example** template, `PersonModule` is already registered; in the **Default** template, you add modules as you create resources.

```typescript
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

## Module hierarchy

```
AppModule
└── PersonModule
    └── ControllerModule
        ├── MappingProvider (registers mappings on startup)
        └── InfraModule
            └── RepositoryModule
                └── DatabaseModule (TypeORM DataSource)
```

`MappingProvider` ensures all mappings are registered before any handler runs:

```typescript
@Injectable()
export class MappingProvider {
  constructor() {
    PersonMapper.createMap();
  }
}
```

## Import alias

Generated projects use the `@/` alias pointing to `src/`. Real import example:

```typescript
import { Person } from '@/domain/entities/person/person';
import { AutoMapper } from '@/core/tools/mapping';
import { IPersonRepository } from '@/domain/repositories/iperson.repository';
```

## Useful scripts

```bash
bun run start:dev          # server in watch mode
bun run migration:generate # generates migration from entities
bun run migration:run      # applies pending migrations
bun run migration:revert   # reverts the last migration
```
