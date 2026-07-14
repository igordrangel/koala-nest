# Koala Nest — agent instructions

This project was scaffolded with `kl-nest` (Koala Nest). Application code lives under `src/` and was **copied** into the repo — do **not** invent runtime imports of handlers, repositories, or controllers from `@koalarx/nest`.

## Docs first

Before inventing APIs or patterns, read the relevant topic from the indexes:

- Nest PT: https://nest.koalarx.com/llms.txt · EN: https://nest.koalarx.com/llms-en.txt
- Utils: https://utils.koalarx.com/llms.txt

Useful entry points: [reusable bases](https://nest.koalarx.com/markdown/en/core/reusable-bases.md), [Person CRUD flow](https://nest.koalarx.com/markdown/en/guides/person-crud-flow.md), [Koala Utils (Nest)](https://nest.koalarx.com/markdown/en/core/koala-utils.md).

## Hard constraints

- Layers: `application` / `domain` / `host` / `infra` / `core` (+ `test`). Depend inward only. Extend template bases (`RequestHandlerBase`, `RequestValidatorBase`, `RepositoryBase`, `RouterConfigBase`, core `@Entity`).
- Prefer Bun; NestJS 11, TypeORM + PostgreSQL, Zod 4.
- `@koalarx/utils` ≥ 5: `import '@koalarx/utils/prototypes'` in `src/host/main.ts` and test setups; prefer native prototypes (`.maskCpf()`, `.orderBy()`). Keep `delay`, `randomString`, holidays as explicit imports.
- Class members: **private → protected → public** (attributes then methods; public attributes after protected); within a group, **dependency order**.
- Do not invent undocumented APIs, decorators, or bases.

## New resource recipe

1. Follow the Person CRUD layout in docs (handler → validator/request/response → mapper → entity → repository contract → infra repo → controller + `RouterConfig`).
2. Wire the module in `app.module` / feature module; bind the repository in `RepositoryModule`.
3. Register entities via core `@Entity` (feeds `DbContext`); add a TypeORM migration when the schema changes.
4. Auth/cache/health/cron/events may be present — reuse existing patterns in this repo; do not assume features that are not installed.

## Optional features

If `kl-nest add` installed auth, Redis cache, health, cron, or events, match the local files and modules already in the tree. Public routes use the project’s auth decorators; inject `ILoggedUserInfoService` when you need the logged user.
