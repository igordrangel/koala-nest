---
title: AI context
slug: ai-context
category: getting-started
docKey: inicio/contexto-ai
order: 3
description: Vibecoding with Cursor and GitHub Copilot — what the CLI scaffolds and the recommended context layout.
---

# AI context

> **Opt-in:** during `kl-nest new` (prompt) or `kl-nest add ai-context cursor` / `github` / both. With `-y`, context is **not** generated — use `add` afterwards. The CLI does **not** overwrite existing files.

## What it is for

Reduce hallucination in vibecoding: the agent reads the generated repository (DDD layers, template bases, docs-first via [`llms.txt`](https://nest.koalarx.com/llms-en.txt)) instead of inventing `@koalarx/nest` imports or APIs that are not in the project.

The core (`AGENTS.md` and editor rules) points at public docs and lists hard constraints (layers, Bun, Zod, API vs Worker, etc.). **Domain/business** content for your product should live separately — see [recommended layout](./ai-context.md#recommended-layout-for-future-context).

## Supported IDEs and tools

| CLI target | Tool | What the CLI generates |
| --- | --- | --- |
| `cursor` | [Cursor](https://cursor.com) | `AGENTS.md` + `.cursor/rules/*.mdc` |
| `github` | GitHub Copilot (VS Code / GitHub) | `AGENTS.md` + `.github/copilot-instructions.md` |

Aliases for `github`: `copilot`, `github-copilot`. You can install both in one command:

```bash
kl-nest add ai-context cursor
kl-nest add ai-context github
kl-nest add ai-context cursor github
```

## What the CLI installs today

Files copied from `libs/cli/assets/ai-context/` (in the published package):

| File | Role |
| --- | --- |
| `AGENTS.md` | Short entry — docs-first + hard constraints (read by Cursor and Copilot) |
| `.cursor/rules/koala-*.mdc` | Path-scoped rules per layer (host, application, domain, …) |
| `.github/copilot-instructions.md` | Copilot entry (same spirit as `AGENTS.md`) |

This covers the Koala Nest **framework**. It does not include your product requirements, business rules, or operational policies.

## Recommended layout for future context

To grow context without duplicating sources of truth, use folders under `.github/` (pattern used in production Koala Nest projects):

```text
AGENTS.md                         # Cursor / agents entry (CLI)
.cursor/rules/                    # path-scoped Cursor rules (CLI)
.github/
  copilot-instructions.md         # Copilot entry (CLI) — points at instructions/
  instructions/                   # canonical domain / business / ops context
    README.md                     # index + reading order
    ...                           # requirements, business rules, policies, etc.
  agents/                         # (optional) specialized agents
    README.md
  prompts/                        # (optional) reusable prompts
    README.md
  skills/                         # (optional) domain skills / guides
    README.md
```

### Conventions

- **One source of truth:** domain and business live in `.github/instructions/`; do not copy the same long text into `AGENTS.md`, Copilot, and Cursor.
- **Short entries:** keep `AGENTS.md` and `copilot-instructions.md` lean and **link** to `instructions/`.
- **`agents` / `prompts` / `skills`:** optional folders for later evolution (the CLI does **not** create them today).
- **Cursor path-scoped:** keep using `.cursor/rules` for folder-level rules; long domain content belongs in `instructions/`.

Example `instructions/README.md` index: reading order (policy → technical usage → requirements → business rules) and a quick “where to look” guide.

## Next steps

- [Installation guide](./installation-guide.md) — `new`, `-y`, and the `add` catalog
- [Overview](../intro/overview.md) — optional features
- LLM indexes: [llms.txt](https://nest.koalarx.com/llms.txt) · [llms-en.txt](https://nest.koalarx.com/llms-en.txt)
