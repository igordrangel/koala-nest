# Hard constraints

- Layers: `application` / `domain` / `host` / `infra` / `core` (+ `test`). Depend inward only. Extend template bases (`RequestHandlerBase`, `RequestValidatorBase`, `RepositoryBase`, `RouterConfigBase`, core `@Entity`).
- Prefer Bun; NestJS 11, TypeORM + PostgreSQL, Zod 4.
- App type: **API** boots with `NestFactory.create` + HTTP middleware/OpenAPI; **Worker** boots with `NestFactory.createApplicationContext` (no listen, Helmet, CORS, or Scalar). Do not add an HTTP surface to a Worker unless the project was scaffolded as API. Silent scaffold: `kl-nest new <name> -y --type worker --features queue` (see [Installation guide](https://nest.koalarx.com/markdown/en/getting-started/installation-guide.md)).
- `@koalarx/utils` ≥ 5: `import '@koalarx/utils/prototypes'` in `src/host/main.ts` and test setups; prefer native prototypes (`.maskCpf()`, `.orderBy()`). Keep `delay`, `randomString`, holidays as explicit imports.
- Class members: **private → protected → public** (attributes then methods; public attributes after protected); within a group, **dependency order**. See `.agents/instructions/class-members.md`.
- Do not invent undocumented APIs, decorators, or bases.
- Application code was **copied** into the repo via `kl-nest` — do **not** invent runtime imports of handlers, repositories, or controllers from `@koalarx/nest`.
