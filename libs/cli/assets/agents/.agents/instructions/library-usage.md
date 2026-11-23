# Library and template usage

## `@koalarx/utils` (≥ 5)

- Import prototypes once: `import '@koalarx/utils/prototypes'` in `src/host/main.ts` and test setups.
- Prefer native prototypes (e.g. `.maskCpf()`, `.orderBy()`).
- Keep `delay`, `randomString`, and holidays as **explicit** imports — not via prototypes.

Docs: https://utils.koalarx.com/llms.txt

## Template bases (extend; do not reinvent)

- `RequestHandlerBase`, `RequestValidatorBase`
- `RepositoryBase`
- `RouterConfigBase`
- Core `@Entity` (registers with `DbContext`)
- Queue: `QueueBase` + `IQueueService` when queue is installed

## NestJS

Prefer NestJS 11 patterns documented in Nest docs and, when available in the IDE, the NestJS MCP for official team patterns. Do not invent decorators or module wiring that contradicts the scaffolded project.
