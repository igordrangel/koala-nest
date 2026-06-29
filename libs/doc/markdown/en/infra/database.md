---
title: Database
slug: database
category: infra
docKey: infra/banco-de-dados
order: 1
description: TypeORM configuration with PostgreSQL via DatabaseModule and DataSource factory.
---

# Database

The database infrastructure uses **TypeORM** with **PostgreSQL**. The connection is managed by a singleton `DataSource` injected via a custom token.

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

## DataSource factory

```typescript
import { DbContext } from '@/core/database/db-context';

export const DATA_SOURCE_PROVIDER_TOKEN = 'DATA_SOURCE';

export async function dataSourceFactory(env: EnvService) {
  const dataSource = new DataSource({
    type: 'postgres',
    url: env.get('DATABASE_URL'),
    schema: env.get('DATABASE_SCHEMA'),
    entities: Array.from(DbContext.entities.values()),
    invalidWhereValuesBehavior: {
      undefined: 'ignore',
    },
  });

  await dataSource.initialize();

  return dataSource;
}
```

## Injection token

Repositories receive the DataSource via token, not the class directly:

```typescript
constructor(@Inject(DATA_SOURCE_PROVIDER_TOKEN) dataSource: DataSource) {
  super(dataSource, Person);
}
```

## Environment variable

The connection URL comes from `DATABASE_URL`, validated in the Zod schema (format from `.env.example`):

```env
DATABASE_URL=postgresql://postgres:root@localhost:5432/koala_nest
```

## Adding new entities

1. Create the entity in `src/domain/entities/` with `@Entity` from `@/core/database/entity`.
2. Generate and apply the migration.

The `@Entity` decorator registers the class in `DbContext.entities`, used by `dataSourceFactory` at runtime. `migration-datasource.ts` discovers entities automatically via glob — no manual registration is needed in either place.

## InfraModule

`InfraModule` aggregates repositories and exports `RepositoryModule`:

```typescript
@Module({
  imports: [RepositoryModule],
  exports: [RepositoryModule],
})
export class InfraModule {}
```
