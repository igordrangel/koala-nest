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

O arquivo `src/host/main.ts` configura CORS, documentação OpenAPI, filtro global de erros e inicia o servidor. O `nest-cli.json` aponta `entryFile` para `host/main`, e o script `start:prod` executa `node dist/host/main`.

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

## Módulo raiz

O `AppModule` importa a validação de ambiente e os módulos de feature. No template **Exemplo de CRUD**, o `PersonModule` já vem registrado; no template **Padrão**, você adiciona módulos conforme criar recursos.

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

## Jobs em background

No template **Exemplo de CRUD**, `main.ts` chama `bootstrapKoalaJobs()` antes de `listen` (controlado por `CRON_JOBS_ENABLED`):

```typescript
KoalaGlobalVars.appName = 'koala-nest';
KoalaGlobalVars.internalUserName = 'integration.bot';

await bootstrapKoalaJobs(app, {
  cronJobsEnabled: config.get('CRON_JOBS_ENABLED'),
  bootstrapDelayMs: config.get('BOOTSTRAP_DELAY_MS'),
});
```

Por padrão, `CRON_JOBS_ENABLED=false` no `.env.example`. Ajuste `BOOTSTRAP_DELAY_MS` se precisar aguardar dependências antes dos jobs. Detalhes em [Cron e Event Jobs](../core/cron-event-jobs.md).

## Hierarquia de módulos

```
AppModule
└── PersonModule
    └── ControllerModule
        ├── MappingProvider (registra mapeamentos na inicialização)
        └── InfraModule
            ├── ICacheService (Redis ou memória)
            ├── IRedLockService (lock de CronJob)
            ├── ILoggingService (relato de erros)
            └── RepositoryModule
                └── DatabaseModule (DataSource TypeORM)
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
