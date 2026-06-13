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
- authentication strategy (**JWT**, **OAuth2**, or none);
- extra features (future options appear disabled).

## Available commands

| Command | Description |
| --- | --- |
| `kl-nest new` | Creates a new project (interactive flow) |
| `kl-nest version` | Displays the CLI version |
| `kl-nest help` | Lists available commands |

## Templates

**Default** — DDD structure ready to start from scratch, without example domain code.

**CRUD Example** — includes a complete `Person` module (entities, repository, handlers, controllers, and mappings) to serve as a reference.

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

> **Important:** with the **CRUD Example** template, run `migration:run` before starting the API. The **Default** template has no initial migrations. **Bun** projects use the native test runner (`bun test`); with **npm** or **pnpm**, tests run with **Vitest** (`vitest.config.ts` at the project root).

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
