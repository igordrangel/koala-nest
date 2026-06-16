---
title: Estrutura do projeto
slug: estrutura-do-projeto
category: inicio
docKey: inicio/estrutura-do-projeto
order: 2
description: Bootstrap da aplicação, módulos principais e ponto de entrada.
---

# Estrutura do projeto

Este guia descreve como a aplicação NestJS é inicializada e como os módulos se conectam.

## Ponto de entrada

O arquivo `src/host/main.ts` configura documentação OpenAPI, filtro global de erros e inicia o servidor. CORS, cookies e rate limit ficam em `applyHttpMiddleware` (`src/host/bootstrap/`). Detalhes: [Middleware HTTP](../host/middleware-http.md). Projetos **core** (sem auth/cron) ficam enxutos — a CLI remove imports e trechos opcionais quando as features não são selecionadas.

```typescript
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

**Com autenticação** (`kl-nest add auth` ou seleção no `new`): guards globais (`AuthGuard`, `ProfilesGuard`). Cookies já passam pelo `applyHttpMiddleware`.

**Com cron/event jobs** (`kl-nest add cron` / `add events`): infraestrutura em `src/core/background-services/` e `JobsModule.register()` no `AppModule` (arrays vazios no template Padrão; handlers de exemplo no CRUD).

## Módulo raiz

O `AppModule` importa a validação de ambiente e os módulos de feature. No template **Exemplo de CRUD**, o `PersonModule` já vem registrado; no template **Padrão**, você adiciona módulos conforme criar recursos.

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => envSchema.parse(config),
    }),
    JobsModule.register({
      eventHandlers: [], // ou handlers de exemplo no template CRUD
      cronJobs: [],
    }),
    PersonModule, // template CRUD
  ],
})
export class AppModule {}
```

> **Autenticação:** no template **Exemplo de CRUD**, auth é **obrigatória** — a CLI instala `AuthModule`, `SecurityModule` e guards globais. No template **Padrão**, auth é opcional. Veja [Autenticação](/pt/host/autenticacao).

## Jobs em background

Todo projeto inclui `src/host/jobs/` com `JobsModule.register()`. Passe as classes de handler em `eventHandlers` e `cronJobs`; o `JobsBootstrapService` inscreve eventos e inicia cron jobs no `OnModuleInit` (controlado por `CRON_JOBS_ENABLED`).

```typescript
JobsModule.register({
  eventHandlers: [InactivePersonHandler],
  cronJobs: [CreatePersonJob, DeleteInactiveJob],
})
```

No template de exemplo, `CRON_JOBS_ENABLED=true` no `.env.example`. Ajuste `BOOTSTRAP_DELAY_MS` se precisar aguardar dependências antes dos jobs. Detalhes em [Cron e Event Jobs](../core/cron-event-jobs.md).

No módulo de aplicação, organize jobs por tipo e especialidade:

```
src/application/<recurso>/jobs/
├── cron/                          # CronJobHandlerBase
│   └── meu-job.ts
└── events/
    └── <recurso>/                 # agregado EventJob
        ├── <recurso>-event.job.ts
        └── <especialidade>/       # evento + handler
            ├── meu-evento.event.ts
            └── meu-evento.handler.ts
```

Exemplo no Person: `jobs/cron/create-person.job.ts` e `jobs/events/person/inactive-person/`.

## Hierarquia de módulos

```
AppModule
├── ConfigModule (env Zod)
├── HealthCheckModule     # opt-in: kl-nest add health
├── SecurityModule        # opt-in: auth
├── AuthModule            # opt-in: auth
└── PersonModule          # template CRUD
    └── ControllerModule
        ├── MappingProvider
        └── InfraModule
            ├── ILoggingService
            ├── ICacheService      # opt-in: cache / OAuth2 / cron
            ├── IRedLockService    # opt-in: cache com cron
            └── RepositoryModule
                └── DatabaseModule
```

O `MappingProvider` garante que todos os mapeamentos estejam registrados antes de qualquer handler executar:

```typescript
@Injectable()
export class MappingProvider {
  constructor() {
    PersonMapper.createMap();
  }
}
```

## Alias de importação

Projetos gerados usam o alias `@/` apontando para `src/`. Exemplo real de import:

```typescript
import { Person } from '@/domain/entities/person/person';
import { AutoMapper } from '@/core/tools/mapping';
import { IPersonRepository } from '@/domain/repositories/iperson.repository';
```

## Scripts úteis

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

**npm / pnpm** — use `npm run` ou `pnpm run` nos mesmos nomes. Testes via **Vitest**; `migration:generate`, `migration:run` e `migration:revert` usam `node --import ts-node/register/transpile-only`.
