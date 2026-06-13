---
title: Overview
slug: overview
category: intro
docKey: intro/visao-geral
order: 1
description: What Koala Nest is and how it fits into NestJS projects with DDD.
---

# Overview

**Koala Nest** is a facilitator for building NestJS APIs with DDD architecture. Instead of relying on an opaque library, the CLI copies ready-made modules into your project — an approach similar to [shadcn/ui](https://ui.shadcn.com). The generated code lives in your repository, ready to read, adapt, and maintain.

## Core (always installed)

When you run `kl-nest new`, the CLI automatically installs:

- environment variable validation with **Zod**;
- **TypeORM** with PostgreSQL and migration scripts;
- OpenAPI documentation at `/doc` via **Scalar**;
- global error filter (Zod, TypeORM, and HTTP exceptions);
- reusable bases for controllers, handlers, validators, and repositories;
- mapping system between entities, requests, and responses;
- **[`@koalarx/utils`](../core/koala-utils.md)** — delay, CPF/CNPJ, strings, dates, and arrays.

## Optional features

Choose during `kl-nest new` or add later with `kl-nest add`:

| Feature | Command | Description |
| --- | --- | --- |
| JWT/OAuth2 auth | `kl-nest add auth jwt` / `oauth2` | Global guards, Scalar OAuth |
| Redis cache | `kl-nest add cache` | `ICacheService` + `ioredis` |
| Health check | `kl-nest add health` | `GET /health` with Terminus |
| Cron jobs | `kl-nest add cron` | `CronJobHandlerBase` + `JobsModule` |
| Event jobs | `kl-nest add events` | `EventJob` + in-memory handlers |

OAuth2 and cron jobs automatically install **in-memory cache** when Redis was not selected (no `ioredis`).

## Templates

| Template | Contents |
| --- | --- |
| **Default** | Core only — no sample code |
| **CRUD Example** | Complete `Person` module **with auth, Redis cache, cron and event jobs** |

In the CRUD template, auth, cache, and jobs are **included automatically** to demonstrate the full flow. Only **health check** remains optional during creation (or via `kl-nest add health`).

## Folder structure

Generated projects follow this organization:

```
src/
├── application/   # use cases, validators, mappings
├── core/          # utilities, env, shared tools
├── domain/        # entities, DTOs, repository contracts
├── host/          # controllers, Nest modules, filters, OpenAPI
├── infra/         # database, repositories, external services
└── test/          # unit tests
```

## Next steps

- [Installation guide](../getting-started/installation-guide.md) — `kl-nest new` and `kl-nest add`
- [DDD Architecture](./ddd-architecture.md) — layers and responsibilities
- [Project structure](../getting-started/project-structure.md) — bootstrap and Nest modules
- [Person CRUD flow](../guides/person-crud-flow.md) — end-to-end example (CRUD template)
- [Health check](../host/health-check.md) — monitoring with Terminus
- [Cache (Redis)](../core/cache.md) — distributed cache
- [Cron and Event Jobs](../core/cron-event-jobs.md) — background jobs
