---
title: Installation guide
slug: installation-guide
category: getting-started
docKey: inicio/guia-de-instalacao
order: 0
description: Install the CLI and create your first NestJS project with DDD.
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

The `new` command prompts for:

- project name;
- package manager (`bun`, `npm`, or `pnpm` — Bun recommended);
- template (**Default** or **CRUD Example**);
- authentication strategy (**JWT** or **OAuth2** — required on CRUD);
- extra features (**Default**: cache, health, cron, events; **CRUD**: health check only — auth, Redis cache, and jobs are bundled).

The **core** module installs only essentials (`@koalarx/utils`, `@nestjs/config`, `@nestjs/swagger`, `typeorm`, `pg`, `zod`, `@scalar/nestjs-api-reference`). Extra dependencies are added based on selected options:

| Option | Additional packages |
| --- | --- |
| **JWT / OAuth2** | `@nestjs/jwt`, `passport`, `cookie-parser`, … |
| **Cache (Redis)** | `ioredis` + `ICacheService` |
| **Cron jobs** | `cron-parser` + `background-services` bases |
| **Health check** | `@nestjs/terminus` + `GET /health` (DB and optional Redis) |

OAuth2 and cron jobs automatically install **in-memory cache** (without `ioredis`) when Redis was not selected. See [Koala Utils](../core/koala-utils.md) and [Cache (Redis)](../core/cache.md).

## Available commands

| Command | Description |
| --- | --- |
| `kl-nest new` | Creates a new project (interactive flow) |
| `kl-nest add [items]` | Adds features to an existing project |
| `kl-nest version` | Displays the CLI version |
| `kl-nest help` | Lists available commands |

## Adding features later (`add`)

From an existing project root:

```bash
cd my-api

# interactive — lists only what is not installed yet
kl-nest add

# direct
kl-nest add cache
kl-nest add auth jwt
kl-nest add health cron events
```

| Item | Command | Notes |
| --- | --- | --- |
| JWT auth | `kl-nest add auth jwt` | Installs `cookie-parser` and global guards |
| OAuth2 auth | `kl-nest add auth oauth2` | Includes in-memory cache for OAuth `state` |
| Redis cache | `kl-nest add cache` | Adds `ioredis`; on CRUD, restores list caching |
| Health check | `kl-nest add health` | Terminus: PostgreSQL ping + Redis (when configured) |
| Cron jobs | `kl-nest add cron` | Requires in-memory cache (installed automatically) |
| Event jobs | `kl-nest add events` | On CRUD, restores example handlers |

## Templates

**Default** — DDD structure ready to start from scratch, without example domain code.

**CRUD Example** — includes the complete `Person` module with **auth, Redis cache, cron jobs, and event jobs** pre-installed. Only **health check** is optional during creation.

## Environment variables

After creating the project, configure a `.env` at the root:

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
pnpm run migration:generate
pnpm run migration:run
pnpm run migration:revert
```

> **Important:** with the **CRUD Example** template, run `migration:run` before starting the API. The **Default** template has no initial migrations. Tests: **Bun** uses `bun test`; **npm/pnpm** use **Vitest** (`npm run test`). Generated projects do not include a `test:e2e` script by default.

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
- [Project structure](./project-structure.md) — bootstrap and Nest modules
- [Overview](../intro/overview.md) — what the template includes
