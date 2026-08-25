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

## 4.4.0 — Build, Docker, and QueueBase

### What changed

- **`tsc-alias` in build:** generated projects use `nest build && tsc-alias -p tsconfig.build.json` so `@/*` imports work in `dist/` (production/Docker).
- **Dockerfile per package manager:** `kl-nest new` writes `Dockerfile` + `entrypoint.sh` for `bun`, `npm`, or `pnpm`.
- **Queue jobs (opt-in):** `kl-nest new` / `kl-nest add queue` copies `QueueBase`, `IQueueService`, stub `QueueService`, and a test fake; injects abstract env vars (`QUEUE_MAX_CONCURRENCY`, delays). No broker SDK — implement infra later.

### Upgrade

On existing projects: update the `build` script and add `tsc-alias` as a devDependency; copy a Dockerfile matching your PM if you containerize; use `kl-nest add queue` for messaging.

## 4.3.1 — OpenAPI scaffold and tsconfig

### What changed

- **Scalar `hiddenClients`:** removed invalid IDs (`request`, `http1`, `http2`, `httr`) that caused TypeScript errors in generated `define-documentation.ts`.
- **Sync OpenAPI slim variants:** no-auth and JWT-only templates no longer use `async` without `await` (avoids `@typescript-eslint/require-await`).
- **`tsconfig.spec.json` in scaffold:** copied/generated with core (Bun: template with `bun-types` + `@types/bun`; npm/pnpm: minimal variant) so ESLint finds the file referenced in `parserOptions.project`.

### Upgrade

On existing projects: align the `hiddenClients` list and drop unnecessary `async` in OpenAPI to match the current template; if ESLint points at a missing `tsconfig.spec.json`, copy it from the template (or the npm/pnpm variant) and, on Bun, add `@types/bun` as a devDependency.

## 4.3.0 — API Key (M2M auth)

### What changed

- **New additive `api-key` strategy:** use with JWT and/or OAuth2 (`--auth jwt,api-key`). Cannot be selected alone.
- **CRUD `/api-key`:** issues a long-lived RS256 JWT (`typ: api-key`) and validates origin (`domain` / `host` / `uri`).
- **Optional internal subnet:** `--api-key-internal-subnet` (or CLI prompt) allows private IPs for pod-to-pod traffic on `domain` type.
- **Scalar:** `ApiKey` header scheme alongside JWT/OAuth2.
- Auth docs cover M2M edge auth without replacing broker/storage.
- **AI context (vibecoding):** in `kl-nest new` (prompt) and `kl-nest add ai-context cursor|github` — scaffolds `AGENTS.md` plus Cursor rules / Copilot instructions for the generated project (docs-first + DDD constraints). Skipped with `-y`; use `add` afterwards. Does not overwrite existing files.
- **JWT keys in `.env`:** when choosing JWT, OAuth2 and/or API Key in `new` or `add auth`, the CLI generates an RS256 key pair (`JWT_PRIVATE_KEY` / `JWT_PUBLIC_KEY` as base64) and fills `.env`. `.env.example` keeps empty placeholders; existing values are not overwritten.

### Upgrade

On existing projects: `kl-nest add auth api-key` (with JWT/OAuth2 already installed), optionally `--api-key-internal-subnet`. Apply the `CreateApiKey` migration and add `passport-custom` if needed.

For AI context on existing projects: `kl-nest add ai-context cursor`, `github`, or both.

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
