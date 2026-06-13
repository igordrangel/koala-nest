---
title: Project structure
slug: project-structure
category: getting-started
docKey: inicio/estrutura-do-projeto
order: 2
description: Application bootstrap, main modules, and entry point.
---

# Project structure

This guide describes how the NestJS application is initialized and how modules connect.

## Entry point

The `src/host/main.ts` file configures CORS, OpenAPI documentation, global error filter, and starts the server. `nest-cli.json` sets `entryFile` to `host/main`, and `start:prod` runs `node dist/host/main`.

```typescript
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { bootstrapKoalaJobs } from './bootstrap/koala-bootstrap';
import { defineDocumentation } from './open-api/define-documentation';
import { ErrorsFilter } from './filters/errors.filter';
import { HttpAdapterHost } from '@nestjs/core';
import { ILoggingService } from '@/domain/common/ilogging.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    credentials: true,
    origin: true,
    optionsSuccessStatus: 200,
  });

  await defineDocumentation(app);

  const { httpAdapter } = app.get(HttpAdapterHost);
  const loggingService = app.get(ILoggingService);
  app.useGlobalFilters(new ErrorsFilter(httpAdapter, loggingService));

  const config = app.get(ConfigService);
  await bootstrapKoalaJobs(app, {
    cronJobsEnabled: config.get('CRON_JOBS_ENABLED'),
    bootstrapDelayMs: config.get('BOOTSTRAP_DELAY_MS'),
  });

  await app.listen(process.env.PORT || 3000);
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

## Background jobs

In the **CRUD Example** template, `main.ts` calls `bootstrapKoalaJobs()` before `listen` (controlled by `CRON_JOBS_ENABLED`):

```typescript
KoalaGlobalVars.appName = 'koala-nest';
KoalaGlobalVars.internalUserName = 'integration.bot';

await bootstrapKoalaJobs(app, {
  cronJobsEnabled: config.get('CRON_JOBS_ENABLED'),
  bootstrapDelayMs: config.get('BOOTSTRAP_DELAY_MS'),
});
```

By default, `CRON_JOBS_ENABLED=false` in `.env.example`. Tune `BOOTSTRAP_DELAY_MS` if dependencies need warm-up before jobs. See [Cron and Event Jobs](../core/cron-event-jobs.md).

## Module hierarchy

```
AppModule
└── PersonModule
    └── ControllerModule
        ├── MappingProvider (registers mappings on startup)
        └── InfraModule
            ├── ICacheService (Redis or memory)
            ├── IRedLockService (CronJob lock)
            ├── ILoggingService (error reporting)
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

**Bun**

```bash
bun run start:dev
bun run start:prod
bun test
bun test --watch
bun run migration:generate
bun run migration:run
bun run migration:revert
```

**npm / pnpm** — use `npm run` or `pnpm run` with the same script names. Tests use **Vitest**; `migration:generate`, `migration:run`, and `migration:revert` use `node --import ts-node/register/transpile-only`.
