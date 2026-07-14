---
title: Migrations
slug: migrations
category: infra
docKey: infra/migrations
order: 3
description: TypeORM migration generation and execution in Koala Nest.
---

# Migrations

Migrations live in `src/infra/database/migrations/` and are managed by the generated project's scripts. Pending migrations are applied automatically when the API starts (`dataSourceFactory` → `runMigrations()`).

## Available scripts

```bash
bun run migration:generate # generates migration from entities
bun run migration:run      # applies pending migrations (fallback / CI)
bun run migration:revert   # reverts the last migration
```

## Migration generator

The `generate-migration.ts` script wraps the TypeORM CLI:

```typescript
const isAutoName = !process.argv[2];
const timestamp = String(Date.now());
const name = process.argv[2] ?? `Migration-${timestamp}`;

const migrationPath = path.join('src/infra/database/migrations', name);
const command = [
  './node_modules/typeorm/cli.js',
  'migration:generate',
  migrationPath,
  '-d',
  './src/infra/database/migrations/migration-datasource.ts',
];

if (isAutoName) {
  command.push('-t', timestamp);
}

const result = spawnSync(process.execPath, command, {
  stdio: 'inherit',
  cwd: process.cwd(),
});

process.exit(result.status ?? 1);
```

> The script uses `process.execPath` (Node/Bun from the environment). With npm or pnpm, `migration:generate`, `migration:run`, and `migration:revert` use `node --import ts-node/register/transpile-only --require tsconfig-paths/register` to load TypeScript and `@/` path aliases.

### Usage

```bash
# automatic name with timestamp
bun run migration:generate

# explicit name
bun run migration:generate AddProductTable
```

## Migration datasource

Migrations use a dedicated datasource in `migration-datasource.ts`, separate from the runtime factory. Both read entities from `DbContext`:

```typescript
import { DbContext } from '@/core/database/db-context';
import 'dotenv/config';
import './load-all-entities';
import path from 'node:path';
import { DataSource } from 'typeorm';

const root = process.cwd();
const schema = process.env.DATABASE_SCHEMA;

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ...(schema
    ? {
        schema,
        extra: { options: `-c search_path=${schema},public` },
      }
    : {}),
  entities: Array.from(DbContext.entities.values()),
  migrations: [path.join(root, 'src/infra/database/migrations/[0-9]*.{js,ts}')],
  migrationsTableName: 'migrations',
  migrationsTransactionMode: 'all',
});
```

`load-all-entities.ts` imports every file under `src/domain/entities/` (excluding enums) to populate `DbContext` outside Nest — required because the CLI does not load application modules. At runtime, Nest imports repositories/entities and the same `DbContext` feeds `dataSourceFactory`.

## Recommended workflow

1. Change or create entities in `src/domain/entities/` with `@Entity` from `@/core/database/entity`.
2. Run `bun run migration:generate`.
3. Review the generated file in `src/infra/database/migrations/`.
4. Start the API (applies pending migrations automatically) or run `bun run migration:run`.

## Existing migrations in the template

The Person template includes one consolidated initial migration:

- `1781281330533-Init.ts` — full schema (`person`, `person_address`, `person_contact`, `users`) and demo user

Use it as a naming and structure reference. New schema changes should generate incremental migrations via `migration:generate`.
