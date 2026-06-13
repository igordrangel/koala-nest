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

## What the template includes

When you run `kl-nest new`, the CLI automatically installs the **core** module with:

- environment variable validation with **Zod**;
- **TypeORM** with PostgreSQL and migration scripts;
- OpenAPI documentation at `/doc` via **Scalar**;
- global error filter (Zod, TypeORM, and HTTP exceptions);
- reusable bases for controllers, handlers, validators, and repositories;
- mapping system between entities, requests, and responses;
- **optional authentication** (JWT + generic OAuth2) via CLI;
- **CronJob** and **EventJob** examples in the Person module (CRUD template).

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

## Reference template: Person

The **CRUD Example** template includes a complete `Person` module — entities with relationships, repository, handlers, controllers, and mappings — that serves as a reference for new resources.

## Next steps

- [DDD Architecture](./ddd-architecture.md) — layers and responsibilities
- [Project structure](../inicio/project-structure.md) — bootstrap and Nest modules
- [Person CRUD flow](../guias/person-crud-flow.md) — end-to-end example
