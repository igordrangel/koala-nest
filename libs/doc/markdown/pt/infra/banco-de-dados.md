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
2. Gere e aplique a migration.

O decorador `@Entity` registra a classe em `DbContext.entities`, usado pelo `dataSourceFactory` em runtime. O `migration-datasource.ts` descobre entidades automaticamente via glob — não é necessário registrá-las manualmente em nenhum dos dois.

## InfraModule

O `InfraModule` agrega repositórios e exporta o `RepositoryModule`:

```typescript
@Module({
  imports: [RepositoryModule],
  exports: [RepositoryModule],
})
export class InfraModule {}
```
