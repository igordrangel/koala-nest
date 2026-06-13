---
title: Installation guide
slug: guia-de-instalacao
category: inicio
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
- authentication strategy and extra features (future options appear disabled).

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
DATABASE_URL=postgresql://postgres:root@localhost:5432/my_api
```

## Useful scripts in the generated project

```bash
bun run start:dev          # server in watch mode
bun run migration:generate # generates migration from entities
bun run migration:run      # applies pending migrations
bun run migration:revert   # reverts the last migration
```

> **Important:** with the **CRUD Example** template, run `bun run migration:run` (or `npm run` / `pnpm run`) to apply migrations before starting the API. The **Default** template has no initial migrations.

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

- [Environment variables](./variaveis-de-ambiente.md) — Zod schema and boot validation
- [Project structure](./estrutura-do-projeto.md) — bootstrap and Nest modules
- [Overview](../intro/visao-geral.md) — what the template includes
