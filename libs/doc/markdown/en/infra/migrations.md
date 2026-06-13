---
title: Migrations
slug: migrations
category: infra
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

> The script uses `process.execPath` (Node/Bun from the environment). With npm or pnpm, the generated project's `package.json` invokes this file via `node --import ts-node/register/...`.

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

Entities are discovered by **glob** — just create the file in `src/domain/entities/`. The runtime `dataSourceFactory`, however, lists entities explicitly in the `entities` array.

## Recommended workflow

1. Change or create entities in `src/domain/entities/`.
2. Register new entities in `dataSourceFactory` (runtime).
3. Run `bun run migration:generate`.
4. Review the generated file in `src/infra/database/migrations/`.
5. Apply with `bun run migration:run`.

## Existing migrations in the template

The Person template includes example migrations:

- `1781281330533-Init.ts` — initial schema
- `1781282000000-AddPersonAddressRelation.ts` — address relationship
- Additional incremental migrations generated during template development

These migrations serve as a reference for naming and structure.
