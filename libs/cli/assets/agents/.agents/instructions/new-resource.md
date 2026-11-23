# New resource recipe

1. Follow the Person CRUD layout in docs (handler → validator/request/response → mapper → entity → repository contract → infra repo → controller + `RouterConfig`) — for **API** projects. On **Worker**, prefer queue/cron/event handlers without controllers. Queue uses `QueueBase` (no `host/jobs`); `JobsModule` only when cron/events are installed.
2. Wire the module in `app.module` / feature module; bind the repository in `RepositoryModule`.
3. Register entities via core `@Entity` (feeds `DbContext`); add a TypeORM migration when the schema changes.
4. Auth/cache/health/cron/events/queue may be present — reuse existing patterns in this repo; do not assume features that are not installed.

Reference: [Person CRUD flow](https://nest.koalarx.com/markdown/en/guides/person-crud-flow.md).

## Optional features

If `kl-nest add` installed auth, Redis cache, health, cron, events, or queue, match the local files and modules already in the tree. Public routes use the project’s auth decorators; inject `ILoggedUserInfoService` when you need the logged user. For queue handlers, extend `QueueBase` and replace the `QueueService` stub with your messaging adapter.
