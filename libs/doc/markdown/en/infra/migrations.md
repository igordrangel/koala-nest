---
title: Migrations
slug: migrations
category: infra
docKey: infra/migrations
order: 3
description: TypeORM migration generation and execution in Koala Nest.
---

# Migrations

Migrations live in `src/infra/database/migrations/` and are managed by the generated project's scripts.

## Available scripts

```bash
bun run migration:generate # generates migration from entities
bun run migration:run      # applies pending migrations
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

> The script uses `process.execPath` (Node/Bun from the environment). With npm or pnpm, `migration:generate`, `migration:run`, and `migration:revert` use `node --import ts-node/register/transpile-only` to load TypeScript files.

### Usage

```bash
# automatic name with timestamp
bun run migration:generate

# explicit name
bun run migration:generate AddProductTable
```

## Migration datasource

Migrations use a dedicated datasource in `migration-datasource.ts`, separate from the runtime factory:

```typescript
export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [path.join(root, 'src/domain/entities/**/*.{js,ts}')],
  migrations: [path.join(root, 'src/infra/database/migrations/[0-9]*.{js,ts}')],
  migrationsTableName: 'migrations',
  migrationsTransactionMode: 'all',
});
```

Entities are discovered by **glob** — just create the file in `src/domain/entities/` with the core `@Entity` decorator. The runtime `dataSourceFactory` reads entities registered automatically in `DbContext.entities`.

## Recommended workflow

1. Change or create entities in `src/domain/entities/` with `@Entity` from `@/core/database/entity`.
2. Run `bun run migration:generate`.
3. Review the generated file in `src/infra/database/migrations/`.
4. Apply with `bun run migration:run`.

## Existing migrations in the template

The Person template includes one consolidated initial migration:

- `1781281330533-Init.ts` — full schema (`person`, `person_address`, `person_contact`, `users`) and demo user

Use it as a naming and structure reference. New schema changes should generate incremental migrations via `migration:generate`.
