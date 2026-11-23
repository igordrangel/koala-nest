# Skill: Koala code review

**Activation phrase (ask the agent verbatim):**

> Faça uma revisão completa utilizando os padrões Koala

When this phrase is used, run a full review of the relevant changes (or the requested scope) against the checklist below. Read `AGENTS.md` and the linked `.agents/instructions/*` files first. Prefer project docs (`llms.txt`) and existing `src/` patterns over invented APIs.

## Checklist

### 1. Best practices

- Clear naming, single responsibility, no dead code or speculative abstractions.
- Prefer clarity over cleverness; match existing project style.
- Failures surface as domain/application errors consistent with the template.

### 2. Nest.js patterns (Nest MCP)

- When the NestJS MCP is available in the IDE, use it to validate controllers, modules, providers, pipes, guards, and lifecycle usage against official Nest team patterns.
- Controllers stay thin; DI and modules follow Nest conventions already used in this repo.
- Do not introduce undocumented Nest APIs or antipatterns (fat controllers, circular modules, bypassing DI).

### 3. Clean Code

- Functions/methods do one thing; avoid deep nesting and magic values.
- Comments only where intent is non-obvious; no commented-out code.
- Consistent formatting with the project’s lint/format setup.

### 4. Abstraction

- Extend template bases (`RequestHandlerBase`, `RequestValidatorBase`, `RepositoryBase`, `RouterConfigBase`, `QueueBase`) instead of parallel hierarchies.
- Do not invent runtime imports of handlers/repos/controllers from `@koalarx/nest`.
- Abstract at the domain/application boundary; keep infra details behind contracts.

### 5. DDD

- Respect layer boundaries (see `.agents/instructions/layers-ddd.md`): depend inward only.
- Domain holds entities and repository contracts; infra implements; application orchestrates; host exposes.
- No business rules in controllers; no TypeORM/Nest infra leaking into domain beyond template patterns.

### 6. Test coverage

- New behavior should include or update unit and/or e2e tests following existing `src/test` patterns.
- Cover happy path and meaningful edge/error cases for handlers and critical host routes.
- Do not weaken existing tests without justification.

### 7. Security

- Auth: reuse project decorators/guards; mark public routes intentionally.
- Validate inputs with Zod validators; never trust raw request bodies.
- No secrets in code; respect `.env` / env schema. Check for injection, over-exposure of data, and insecure defaults.
- See security docs when auth is installed: https://nest.koalarx.com/markdown/en/host/security.md

### 8. Standardized library usage

- `@koalarx/utils`: prototypes imported once; prefer `.maskCpf()` / `.orderBy()`; explicit imports for `delay`, `randomString`, holidays (see `.agents/instructions/library-usage.md`).
- Zod 4 in validators; TypeORM + PostgreSQL as scaffolded.
- Class member order: private → protected → public with dependency order (`.agents/instructions/class-members.md`).

## Review output

Produce a structured review with:

1. **Summary** — overall verdict (approve / request changes).
2. **Findings** — ordered by severity (blocker → suggestion), each with file/area and concrete fix.
3. **Checklist status** — which of the eight areas passed, failed, or were not applicable.
4. **Follow-ups** — optional improvements that are not blockers.
