---
title: Patch notes
slug: patch-notes
category: intro
docKey: intro/patch-notes
order: 3
description: Changelog of notable CLI, template, and workflow changes in Koala Nest.
---

# Patch notes

Changelog for anyone using or upgrading CLI-generated projects. Deep dives live on the linked documentation pages.

The published `@koalarx/nest` version is shown on the site and in the repo `package.json`. Root [`CHANGELOG.md`](https://github.com/igordrangel/koala-nest/blob/main/CHANGELOG.md) mirrors these notes.

## 4.2.0 — Migrations and entity discovery

### What changed

- **CLI entities:** `migration-datasource.ts` no longer uses a filesystem glob; it reads `DbContext.entities`, populated by `load-all-entities.ts` when generating/running migrations outside Nest. Entity load failures propagate (only a missing entities directory `ENOENT` is ignored).
- **API boot:** `dataSourceFactory` configures the `migrations` array and calls `runMigrations()` after `initialize()` — pending migrations apply on startup.
- **npm/pnpm scripts:** migrations use `ts-node` + `tsconfig-paths` so `@/` aliases resolve. `dotenv`, `ts-node`, and `tsconfig-paths` are part of the CLI core packages.
- **Auth:** auth install **no longer** patches `data-source-factory.ts`. Entities (e.g. `User`) register in `DbContext` via repository imports.
- **`@koalarx/utils` prototypes:** the template enables `import '@koalarx/utils/prototypes'` in `src/host/main.ts` and test setups. On the Nest backend, the default style is native methods (e.g. `.maskCpf()`, `.orderBy()`); `delay`, `randomString`, and holidays remain explicit imports. See [Koala Utils](../core/koala-utils.md).
- **Checklist / boot:** `load-all-entities.ts` and the other migration files are required by project validation; `main.ts` must import `@koalarx/utils/prototypes`.

### How it works (short guide)

1. Entities under `src/domain/entities/` use `@Entity` from `@/core/database/entity` (registers in `DbContext`).
2. At runtime, Nest imports repositories → loads entities → `dataSourceFactory` uses `DbContext`.
3. In the CLI (`migration:generate` / `migration:run`), `load-all-entities` `require`s entity files (skipping enums) to fill the same `DbContext`.
4. On API start, pending migrations run automatically. `migration:run` remains available for CI/ops.

Full guide: [Migrations](../infra/migrations.md) · [Database](../infra/database.md)

### Existing projects (upgrade)

If the project was generated from an older template:

1. Copy/adapt `src/infra/database/migrations/load-all-entities.ts` from the current template.
2. In `migration-datasource.ts`, import `./load-all-entities` and use `entities: Array.from(DbContext.entities.values())`.
3. In `data-source-factory.ts`, add the `migrations` glob + `await dataSource.runMigrations()`.
4. Remove manual `entities: [Person, ...]` lists (or any patch that keeps them).
5. For npm/pnpm, ensure `dotenv`, `ts-node`, and `tsconfig-paths`, with scripts using `--require tsconfig-paths/register`.
6. In `src/host/main.ts` (and test setups), import `@koalarx/utils/prototypes`.

There is no compatibility layer in the CLI: the new template is the source of truth.
