# Koala Nest — agent instructions

CLI to scaffold NestJS DDD APIs. Modules are **copied** via `kl-nest` (shadcn-style) — do not invent runtime imports of handlers/repos/controllers from `@koalarx/nest`.

## Docs first

Before inventing APIs or patterns, read the relevant topic from the indexes:

- Nest PT: https://nest.koalarx.com/llms.txt · EN: https://nest.koalarx.com/llms-en.txt
- Utils: https://utils.koalarx.com/llms.txt

Useful entry points: [bases](https://nest.koalarx.com/markdown/pt/core/bases-reutilizaveis.md), [Person CRUD](https://nest.koalarx.com/markdown/pt/guias/fluxo-crud-person.md), [Koala Utils (Nest)](https://nest.koalarx.com/markdown/pt/core/koala-utils.md).

## When → Read

| Task | Open (repo path) |
|------|------------------|
| New resource / DDD / auth / cache / jobs | Nest `llms.txt` + Person CRUD + relevant topic |
| Masks, dates, arrays, prototypes (`@koalarx/utils`) | https://utils.koalarx.com/llms.txt |
| Site docs / frontmatter / `llms.txt` pipeline | `.agents/documentation.md` |
| User-facing CLI/template/API change (patch notes) | `.agents/patch-notes.md` |
| Generated-project validation rules | `libs/cli/constants/cli-project-checklist.ts` |
| Class member order / TypeScript style in template | `.agents/typescript-conventions.md` |
| Consumer AI context (`kl-nest new`/`add`) | `libs/cli/assets/ai-context/` — keep in sync after template/docs/pattern changes (see below) |

## Hard constraints

- Layers: `application` / `domain` / `host` / `infra` / `core` (+ `test`). Extend template bases only.
- Prefer Bun; apps target NestJS 11, TypeORM + PostgreSQL, Zod 4.
- `@koalarx/utils` ≥ 5: `import '@koalarx/utils/prototypes'` in `src/host/main.ts` and test setups; prefer native prototypes (`.maskCpf()`, `.orderBy()`). Keep `delay`, `randomString`, holidays as explicit imports.
- Class members: **private → protected → public** (attrs then methods; public attrs after protected); within a group, **dependency order**. See `.agents/typescript-conventions.md`.
- Do not invent undocumented APIs.

## Maintaining agent context

Context must stay **VS Code (Copilot) + Cursor compatible**. Same files, no editor fork.

- Canonical body: **`.agents/agents.md` only**. Root `AGENTS.md` and `.github/copilot-instructions.md` are symlinks — never duplicate the text.
- Keep this file short: index + hard constraints only.
- Put detailed procedures in `.agents/*.md` playbooks; link them from the When→Read map (repo-root paths).
- Path-scoped: nested `AGENTS.md` and `.github/instructions/*.instructions.md` (`applyTo` frontmatter) are pointers only — no copied bodies.
- **Never** create `.cursor/`, `.cursor/rules/`, or `*.mdc` Cursor-only rules. Cursor already reads `AGENTS.md` / Copilot instructions; path-scoped guidance goes under `.github/instructions/`.
- Prefer adding a reference over pasting long guidance here.
- **Consumer AI scaffolding:** `libs/cli/assets/ai-context/` is copied into projects via `kl-nest new` / `add ai-context`. After changing template layers, docs URLs, bases, auth/features, or hard constraints that agents must know, **review and update** those assets (and related CLI install/detect if needed) so generated vibecoding context stays accurate.
