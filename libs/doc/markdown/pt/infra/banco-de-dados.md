---
title: Banco de dados
slug: banco-de-dados
category: infra
docKey: infra/banco-de-dados
order: 1
description: Configuração TypeORM com PostgreSQL via DatabaseModule e DataSource factory.
---

# Banco de dados

A infraestrutura de banco usa **TypeORM** com **PostgreSQL**. A conexão é gerenciada por um `DataSource` singleton injetado via token customizado.

## DatabaseModule

```typescript
@Module({
  providers: [
    EnvService,
    {
      provide: DATA_SOURCE_PROVIDER_TOKEN,
      useFactory: dataSourceFactory,
      inject: [EnvService],
    },
  ],
  exports: [EnvService, DATA_SOURCE_PROVIDER_TOKEN],
})
export class DatabaseModule {}
```

## Factory do DataSource

```typescript
import { DbContext } from '@/core/database/db-context';
import path from 'node:path';

export const DATA_SOURCE_PROVIDER_TOKEN = 'DATA_SOURCE';

export async function dataSourceFactory(env: EnvService) {
  const dataSource = new DataSource({
    type: 'postgres',
    url: env.get('DATABASE_URL'),
    schema: env.get('DATABASE_SCHEMA'),
    entities: Array.from(DbContext.entities.values()),
    migrations: [path.join(__dirname, 'migrations', '[0-9]*.{ts,js}')],
    migrationsTableName: 'migrations',
    migrationsTransactionMode: 'all',
    invalidWhereValuesBehavior: {
      undefined: 'ignore',
    },
  });

  await dataSource.initialize();
  await dataSource.runMigrations();

  return dataSource;
}
```

Migrations pendentes são aplicadas automaticamente no start da API. Os scripts `migration:run` / `migration:revert` permanecem disponíveis para CI e operações manuais.

## Token de injeção

Repositórios recebem o DataSource via token, não pela classe diretamente:

```typescript
constructor(@Inject(DATA_SOURCE_PROVIDER_TOKEN) dataSource: DataSource) {
  super(dataSource, Person);
}
```

## Variável de ambiente

A URL de conexão vem de `DATABASE_URL`, validada no schema Zod (formato do `.env.example`):

```env
DATABASE_URL=postgresql://postgres:root@localhost:5432/koala_nest
```

## Adicionar novas entidades

1. Crie a entidade em `src/domain/entities/` com `@Entity` de `@/core/database/entity`.
2. Gere a migration e reinicie a API (ou use `migration:run`).

O decorador `@Entity` registra a classe em `DbContext.entities`. No runtime, o Nest importa as entidades via repositórios; no CLI, `load-all-entities.ts` carrega os arquivos de `src/domain/entities/` para popular o mesmo `DbContext` usado por `migration-datasource.ts` — não é necessário listar entidades manualmente.

## InfraModule

O `InfraModule` agrega repositórios e exporta o `RepositoryModule`:

```typescript
@Module({
  imports: [RepositoryModule],
  exports: [RepositoryModule],
})
export class InfraModule {}
```
