---
title: AI context
slug: ai-context
category: getting-started
docKey: inicio/contexto-ai
order: 3
description: IDE-agnostic vibecoding — AGENTS.md, .agents/instructions, Koala code-review skill.
---

# AI context

> **Opt-in:** during `kl-nest new` (prompt “Configurar contexto para agentes de IA?”) or `kl-nest add agents`. With `-y`, context is **not** generated — use `add agents` afterwards. The CLI **fully replaces** the generated structure (and removes legacy Cursor/Copilot `ai-context` files if present).

## Purpose

Reduce hallucination in vibecoding: the agent reads the scaffolded repo (DDD layers, template bases, docs-first via [`llms.txt`](https://nest.koalarx.com/llms.txt)) instead of inventing `@koalarx/nest` runtime imports or APIs that do not exist in the project.

The entry point is **`AGENTS.md`** (recognized by Cursor, Copilot, and other IDEs). Details live under `.agents/instructions/`; skills under `.agents/skills/`.

## Command

```bash
kl-nest add agents
```

In interactive `kl-nest new`, confirm whether to configure agent context. In silent mode (`-y`), run `add agents` afterwards.

## What the CLI installs

Files copied from `libs/cli/assets/agents/` (in the published package):

```text
AGENTS.md
.agents/
  instructions/
    docs-first.md
    hard-constraints.md
    layers-ddd.md
    new-resource.md
    class-members.md
    library-usage.md
  skills/
    code-review.md
```

| File | Role |
| --- | --- |
| `AGENTS.md` | Short index — docs-first, hard-constraint summary, When→Read map, skills |
| `.agents/instructions/*.md` | Purpose-split instructions (layers, resource recipe, libs, etc.) |
| `.agents/skills/code-review.md` | Full review skill against Koala standards |

This covers the Koala Nest **framework**. Product domain/business rules should live in your own files (e.g. under `.agents/instructions/` or `.github/instructions/`), without duplicating the CLI-generated core.

## Code review skill

Ask the agent (verbatim phrase):

> Faça uma revisão completa utilizando os padrões Koala

The skill in `.agents/skills/code-review.md` covers: best practices, Nest.js patterns (via Nest MCP when available in the IDE), Clean Code, abstraction, DDD, test coverage, security, and standardized library/template usage.

## Install behavior

- **`new` (when confirmed)** and **`add agents`**: purge previous structure + force-copy assets.
- Removes legacy `ai-context`: `.cursor/rules/koala-*.mdc` and `.github/copilot-instructions.md`.
- No longer generates `.mdc` rules or `copilot-instructions.md` — context is IDE-agnostic via `AGENTS.md`.

## Next steps

- [Installation guide](./installation-guide.md) — `new`, `-y`, and `add` catalog
- [Overview](../intro/overview.md) — optional features
- LLM indexes: [llms.txt](https://nest.koalarx.com/llms.txt) · [llms-en.txt](https://nest.koalarx.com/llms-en.txt)
