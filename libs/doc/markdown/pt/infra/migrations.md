---
title: Migrations
slug: migrations
category: infra
docKey: infra/migrations
order: 3
description: Geração e execução de migrations TypeORM no Koala Nest.
---

# Migrations

Migrations ficam em `src/infra/database/migrations/` e são gerenciadas pelos scripts do projeto gerado.

## Scripts disponíveis

```bash
bun run migration:generate # gera migration a partir das entidades
bun run migration:run      # aplica migrations pendentes
bun run migration:revert   # reverte a última migration
```

## Gerador de migration

O script `generate-migration.ts` encapsula a CLI do TypeORM:

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

> O script usa `process.execPath` (Node/Bun do ambiente). Com npm ou pnpm, `migration:generate`, `migration:run` e `migration:revert` usam `node --import ts-node/register/transpile-only` para carregar os arquivos TypeScript.

### Uso

```bash
# nome automático com timestamp
bun run migration:generate

# nome explícito
bun run migration:generate AddProductTable
```

## Datasource de migrations

Migrations usam um datasource dedicado em `migration-datasource.ts`, separado do factory de runtime:

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

Entidades são descobertas por **glob** — basta criar o arquivo em `src/domain/entities/`. O `dataSourceFactory` de runtime, porém, lista entidades explicitamente no array `entities`.

## Fluxo recomendado

1. Altere ou crie entidades em `src/domain/entities/`.
2. Registre novas entidades no `dataSourceFactory` (runtime).
3. Execute `bun run migration:generate`.
4. Revise o arquivo gerado em `src/infra/database/migrations/`.
5. Aplique com `bun run migration:run`.

## Migrations existentes no template

O template Person inclui uma migration inicial consolidada:

- `1781281330533-Init.ts` — schema completo (`person`, `person_address`, `person_contact`, `users`) e usuário demo

Serve como referência de nomenclatura e estrutura. Novas alterações de schema devem gerar migrations incrementais com `migration:generate`.
