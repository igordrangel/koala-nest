---
title: Installation guide
slug: installation-guide
category: getting-started
docKey: inicio/guia-de-instalacao
order: 0
description: kl-nest CLI — new (API/Worker), silent -y mode, flags, and add.
---

# Installation guide

The `@koalarx/nest` package exposes the **`kl-nest`** command. You can use it in three ways.

## Quick start: using the CLI

### Global installation (recommended)

Install once and use `kl-nest` from any folder:

```bash
npm install -g @koalarx/nest
# or: bun install -g @koalarx/nest
# or: pnpm add -g @koalarx/nest

kl-nest new
kl-nest --help
```

### Without installing (bunx / npx)

Run the published version directly:

```bash
bunx @koalarx/nest new
npx @koalarx/nest new
```

Useful for testing a specific version:

```bash
bunx @koalarx/nest@latest new
npx @koalarx/nest@latest new
```

The interactive `new` command prompts, in order:

1. project name;
2. package manager (`bun`, `npm`, or `pnpm` — Bun recommended);
3. **app type:** **API** or **Worker** (see [API vs Worker](#api-vs-worker));
4. template (**Default** or **CRUD Example** — API only);
5. authentication (**JWT**, **OAuth2**, and/or **API Key** — API only; required on CRUD; API Key is additive);
6. extra features (depends on type — see table below);
7. **AI context** for vibecoding: **Cursor**, **GitHub Copilot**, both, or none.

## API vs Worker

In `kl-nest new`, the CLI asks for the **application type** (or use `--type` / `--app-type` in silent mode).

| | **API** | **Worker** |
| --- | --- | --- |
| Use | Public HTTP / BFF / OpenAPI | Broker, queue, integration, background |
| Boot | `NestFactory.create` + `listen` | `NestFactory.createApplicationContext` |
| HTTP | Helmet, CORS, cookies, rate limit, Scalar `/doc` | **No** HTTP surface |
| HTTP env | `PORT`, `HOST`, `API_HOST`, `CORS_ORIGINS`, `RATE_LIMIT_*` | Those vars omitted |
| Docker | `EXPOSE 3000` | No `EXPOSE` |
| Template | `default` or `crud` | `default` only |
| Auth / health | JWT, OAuth2, API Key, health | **Not** available |
| Typical features | cache, health, cron, events, queue | cache, **queue**, cron, events |
| Controllers | `host/controllers` | Prefer queue/cron handlers in `application` + `host/services` |

Type aliases: `api` / `http` → API; `worker` / `broker` / `background` / `background-service` → Worker.

HTTP security overview: [Security](../host/security.md). Bootstrap: [Project structure](./project-structure.md).

The **core** module installs essentials. For **API**: `@koalarx/utils`, `@nestjs/config`, `@nestjs/swagger`, `typeorm`, `pg`, `zod`, `@scalar/nestjs-api-reference`, `helmet`. For **Worker**: no swagger/Scalar/helmet/cookie-parser. Extra dependencies:

| Option | Additional packages |
| --- | --- |
| **JWT / OAuth2** (API only) | `@nestjs/jwt`, `passport`, `cookie-parser`, … |
| **Cache (Redis)** | `ioredis` + `ICacheService` |
| **Cron jobs** | `cron-parser` + `background-services` bases |
| **Health check** (API only) | `@nestjs/terminus` + `GET /health` |
| **Queue** | `QueueBase` + stub `QueueService` (implement infra later) |

OAuth2 and cron jobs automatically install **in-memory cache** (without `ioredis`) when Redis was not selected. See [Koala Utils](../core/koala-utils.md) and [Cache (Redis)](../core/cache.md).

## Silent mode (`-y` / `--yes`)

`-y` **skips all prompts** and requires the **project name** on the command line. Omitted values use defaults:

| Flag | Default with `-y` | Values / aliases |
| --- | --- | --- |
| (name) | **required** | `kl-nest new my-app -y …` |
| `--pm` | `bun` | `bun`, `npm`, `pnpm` |
| `--type` / `--app-type` | `api` | `api`/`http` · `worker`/`broker`/`background` |
| `--template` / `-t` | `default` | `default` · `crud` (API only) |
| `--auth` | `none` (empty list) | `none`, `jwt`, `oauth2`, `api-key` (comma; API only) |
| `--features` | none | `cache,health,cron,events,queue` (comma; `health` API only) |
| `--api-key-internal-subnet` | off | boolean flag (with API Key) |
| AI context | **not generated** | use `kl-nest add ai-context cursor\|github` afterwards |

Rules for Worker + `-y`:

- `--template crud` → error
- any `--auth` other than none → error
- `--features` including `health` → error

Examples (useful for agents / CI):

```bash
# Minimal API
kl-nest new my-api -y --pm bun --auth none

# CRUD API + JWT
kl-nest new my-api -y --template crud --pm bun --auth jwt

# Worker / broker with queue and cron
kl-nest new my-worker -y --type worker --pm bun --features queue,cron
kl-nest new my-broker -y --app-type broker --features queue

# API + features + verbose
kl-nest new my-api -y --features cache,health,queue --verbose
```

`kl-nest add` has **no** `-y`: passing items on the command line is already the direct (non-prompt) mode. Bare `kl-nest add` opens the interactive multiselect.

## Available commands

| Command | Description |
| --- | --- |
| `kl-nest new [name] [flags]` | Creates a project (interactive or `-y`) |
| `kl-nest add [items]` | Adds features (direct when items are passed) |
| `kl-nest version` | CLI version |
| `kl-nest help` | Help (`new` flags, examples) |

Global option: `--verbose` — echoes npm/bun/nest output.

## Adding features later (`add`)

From an existing project root:

```bash
cd my-api

# interactive — lists only what is not installed yet
kl-nest add

# direct (no prompts)
kl-nest add cache
kl-nest add auth jwt
kl-nest add health cron events
kl-nest add queue
kl-nest add ai-context cursor
kl-nest add ai-context github
kl-nest add ai-context cursor github
```

| Item | Command | Notes |
| --- | --- | --- |
| JWT auth | `kl-nest add auth jwt` | Meaningful on API only |
| OAuth2 auth | `kl-nest add auth oauth2` | Includes in-memory cache for OAuth `state` |
| Redis cache | `kl-nest add cache` | Adds `ioredis`; on CRUD, restores list caching |
| Health check | `kl-nest add health` | HTTP Terminus — API only |
| Cron jobs | `kl-nest add cron` | Requires in-memory cache (installed automatically) |
| Event jobs | `kl-nest add events` | On CRUD, restores example handlers |
| Queue jobs | `kl-nest add queue` | Ideal on Worker; also valid on API |
| AI context (Cursor) | `kl-nest add ai-context cursor` | `AGENTS.md` + `.cursor/rules` (no overwrite) |
| AI context (Copilot) | `kl-nest add ai-context github` | `AGENTS.md` + `.github/copilot-instructions.md` |

## Templates

**Default** — DDD structure ready to start from scratch, without example domain code. Only template for **Worker**.

**CRUD Example** — **API** only. Includes the complete `Person` module with **auth, Redis cache, cron jobs, and event jobs** pre-installed. Only **health check** is optional during creation.

## Environment variables

After creating the project, the CLI already generates a `.env` from `.env.example` (with `DATABASE_URL` adjusted to the project name). With JWT / OAuth2 / API Key authentication, `JWT_PRIVATE_KEY` and `JWT_PUBLIC_KEY` are also generated automatically in `.env`. On **Worker**, there is no `PORT`/`HOST`/`CORS_*`/`RATE_LIMIT_*`.

```env
PORT=3000
NODE_ENV=develop
DATABASE_URL=postgresql://postgres:root@localhost:5432/koala_nest
```

## Useful scripts in the generated project

`kl-nest new` configures scripts for the package manager you choose. Equivalent examples:

**Bun (recommended)**

```bash
bun run start:dev
bun run start:prod
bun test
bun test --watch
bun run test:e2e
bun run migration:generate
bun run migration:run
bun run migration:revert
```

**npm**

```bash
npm run start:dev
npm run start:prod
npm run test
npm run test:watch
npm run test:e2e
npm run migration:generate
npm run migration:run
npm run migration:revert
```

**pnpm**

```bash
pnpm run start:dev
pnpm run start:prod
pnpm run test
pnpm run test:watch
pnpm run test:e2e
pnpm run migration:generate
pnpm run migration:run
pnpm run migration:revert
```

> **Important:** in any project, pending migrations are applied automatically when the API starts (`runMigrations` in `dataSourceFactory`). The `migration:run` script remains available for CI/ops. The **CRUD Example** template ships the initial migration (`1781281330533-Init.ts`); the **Default** template has no initial migrations. Unit tests: **Bun** uses `bun test`; **npm/pnpm** use **Vitest** (`npm run test`). **E2E:** every project includes `test:e2e` and infrastructure under `src/test/`. On **API**, **Default** ships a minimal `app.e2e.spec.ts`; **CRUD** adds Person/auth. On **Worker**, E2E uses `Test.createTestingModule(...).compile()` (no HTTP). Requires `DATABASE_URL` pointing to a local Postgres instance.

## Local CLI development

To contribute or test local changes:

```bash
git clone https://github.com/igordrangel/koala-nest.git
cd koala-nest
bun install
bun run build
bun kl-nest new
```

## Next steps

- [Environment variables](./environment-variables.md) — Zod schema and boot validation
- [Project structure](./project-structure.md) — API and Worker bootstrap
- [Security](../host/security.md) — HTTP layers (API only)
- [Overview](../intro/overview.md) — what the template includes
