# Koala Nest — agent instructions

This project was scaffolded with `kl-nest` (Koala Nest). Application code lives under `src/` and was **copied** into the repo — do **not** invent runtime imports of handlers, repositories, or controllers from `@koalarx/nest`.

Use this file as the entry index. Detailed guidance lives under `.agents/instructions/`. Skills live under `.agents/skills/`.

## Docs first

Before inventing APIs or patterns, read the relevant topic from the indexes:

- Nest PT: https://nest.koalarx.com/llms.txt · EN: https://nest.koalarx.com/llms-en.txt
- Utils: https://utils.koalarx.com/llms.txt

See `.agents/instructions/docs-first.md`.

## When → Read

| Task | Open |
|------|------|
| Docs indexes and entry topics | `.agents/instructions/docs-first.md` |
| Hard constraints (layers, Bun, Zod, API vs Worker) | `.agents/instructions/hard-constraints.md` |
| DDD layers and dependencies | `.agents/instructions/layers-ddd.md` |
| New resource / Person CRUD recipe | `.agents/instructions/new-resource.md` |
| Class member order | `.agents/instructions/class-members.md` |
| `@koalarx/utils` and template bases | `.agents/instructions/library-usage.md` |
| Full code review (Koala standards) | `.agents/skills/code-review.md` |

## Hard constraints (summary)

- Layers: `application` / `domain` / `host` / `infra` / `core` (+ `test`). Depend inward only. Extend template bases only.
- Prefer Bun; NestJS 11, TypeORM + PostgreSQL, Zod 4.
- Do not invent undocumented APIs, decorators, or bases.

Full list: `.agents/instructions/hard-constraints.md`.

## Skills

| Skill | How to activate |
|-------|-----------------|
| Code review | Ask the agent: **Faça uma revisão completa utilizando os padrões Koala** |

Details: `.agents/skills/code-review.md`.
