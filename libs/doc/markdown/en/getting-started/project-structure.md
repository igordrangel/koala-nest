---
title: Project structure
slug: project-structure
category: getting-started
docKey: inicio/estrutura-do-projeto
order: 2
description: Application bootstrap, main modules, and entry point.
---

# Project structure

This guide describes how the NestJS application is initialized and how modules connect. The profile (**API** or **Worker**) is chosen in `kl-nest new` — see [Installation guide](./installation-guide.md#api-vs-worker).

## Entry point (API)

On an **API**, `src/host/main.ts` configures OpenAPI documentation, the global error filter, and starts the server. CORS, cookies, and rate limit live in `applyHttpMiddleware` (`src/host/bootstrap/`). Details: [HTTP middleware](../host/http-middleware.md). **Core** projects (without auth/cron) stay slim — the CLI removes optional imports and blocks when features were not selected.

```typescript
import 'dotenv/config';
import '@koalarx/utils/prototypes';

import { applyHttpMiddleware } from '@/host/bootstrap/apply-http-middleware';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { defineDocumentation } from './open-api/define-documentation';
import { ErrorsFilter } from './filters/errors.filter';
import { HttpAdapterHost } from '@nestjs/core';
import { ILoggingService } from '@/domain/common/ilogging.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  applyHttpMiddleware(app);

  await defineDocumentation(app);

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new ErrorsFilter(httpAdapter, app.get(ILoggingService)));

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
```

**With authentication** (`kl-nest add auth` or selected in `new`): global guards (`AuthGuard`, `ProfilesGuard`). Cookies are already handled by `applyHttpMiddleware`.

**With cron/event jobs** (`kl-nest add cron` / `add events`): infrastructure under `src/core/background-services/` and `JobsModule.register()` in `AppModule` (empty arrays in Default; sample handlers in CRUD).

## Entry point (Worker)

On a **Worker**, there is no `listen`, Helmet, CORS, or OpenAPI. Bootstrap uses `NestFactory.createApplicationContext` and closes the context on `SIGINT`/`SIGTERM`:

```typescript
import 'dotenv/config';
import '@koalarx/utils/prototypes';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const shutdown = async () => {
    await app.close();
  };

  process.once('SIGINT', () => {
    void shutdown();
  });
  process.once('SIGTERM', () => {
    void shutdown();
  });
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

Queue handlers (`QueueBase`) are typically started from modules under `host/services` (or resolved in `main` after the context). Prefer `--features queue` (and/or cron/events) when scaffolding.

## Root module

`AppModule` imports environment validation and feature modules. In the **CRUD Example** template, `PersonModule` is already registered; in the **Default** template, you add modules as you create resources.

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => envSchema.parse(config),
    }),
    JobsModule.register({
      eventHandlers: [], // or sample handlers in CRUD template
      cronJobs: [],
    }),
    PersonModule, // CRUD template
  ],
})
export class AppModule {}
```

> **Authentication:** in the **CRUD Example** template, auth is **required** — the CLI installs `AuthModule`, `SecurityModule`, and global guards. In the **Default** template, auth is optional. See [Authentication](../host/authentication.md).

## Background jobs

Every project includes `src/host/jobs/` with `JobsModule.register()`. Pass handler classes in `eventHandlers` and `cronJobs`; `JobsBootstrapService` subscribes to events and starts cron jobs on `OnModuleInit` (controlled by `CRON_JOBS_ENABLED`).

```typescript
JobsModule.register({
  eventHandlers: [InactivePersonHandler],
  cronJobs: [CreatePersonJob, DeleteInactiveJob],
})
```

In the example template, `CRON_JOBS_ENABLED=true` in `.env.example`. Tune `BOOTSTRAP_DELAY_MS` if dependencies need warm-up before jobs. See [Cron and Event Jobs](../core/cron-event-jobs.md).

In the application module, organize jobs by type and specialty:

```
src/application/<resource>/jobs/
├── cron/                          # CronJobHandlerBase
│   └── my-job.ts
└── events/
    └── <resource>/                # EventJob aggregate
        ├── <resource>-event.job.ts
        └── <specialty>/           # event + handler
            ├── my-event.event.ts
            └── my-event.handler.ts
```

Person example: `jobs/cron/create-person.job.ts` and `jobs/events/person/inactive-person/`.

## Module hierarchy

```
AppModule
├── ConfigModule (Zod env)
├── HealthCheckModule     # opt-in: kl-nest add health
├── SecurityModule        # opt-in: auth
├── AuthModule            # opt-in: auth
└── PersonModule          # CRUD template
    └── ControllerModule
        ├── MappingProvider
        └── InfraModule
            ├── ILoggingService
            ├── ICacheService      # opt-in: cache / OAuth2 / cron
            ├── IRedLockService    # opt-in: cache with cron
            └── RepositoryModule
                └── DatabaseModule
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

**npm / pnpm** — use `npm run` or `pnpm run` with the same script names. Tests use **Vitest**; `migration:generate`, `migration:run`, and `migration:revert` use `node --import ts-node/register/transpile-only --require tsconfig-paths/register`. Starting the API (`start:dev` / `start:prod`) already applies pending migrations via `dataSourceFactory` → `runMigrations()`; `migration:run` remains a fallback / CI option.
