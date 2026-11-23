# DDD layers

Depend inward only. Do not invent imports of handlers/repos/controllers from `@koalarx/nest` — the code already lives under `src/`.

## Layers

- `domain` — entities and repository contracts; no TypeORM/Nest infra details in domain entities beyond the template pattern.
- `application` — handlers, Zod validators, requests/responses, mappers. Extend `RequestHandlerBase`, `RequestValidatorBase`. Prefer Zod 4 validators over generic Nest pipes. Mirror an existing handler (e.g. Person).
- `infra` — implementations (TypeORM repos, cache, auth providers); binds domain contracts.
- `host` — thin controllers, modules, security, OpenAPI; orchestrates handlers. No business rules in controllers. Use `RouterConfig` / `RouterConfigBase`. Reuse `host/security` when auth is installed.
- `core` — shared bases, env, utilities.

## Worker notes

- `main.ts` uses `NestFactory.createApplicationContext` — no `listen`, Helmet, CORS, Scalar, HTTP controllers, decorators, or filters.
- Queues use `QueueBase` + `IQueueService` (no need for `host/jobs`).
- `host/jobs` / `JobsModule` exist only when cron or events are installed.

Docs: https://nest.koalarx.com/llms.txt · https://nest.koalarx.com/llms-en.txt
