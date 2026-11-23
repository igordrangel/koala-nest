---
title: Contexto AI
slug: contexto-ai
category: inicio
docKey: inicio/contexto-ai
order: 3
description: Vibecoding IDE-agnóstico — AGENTS.md, .agents/instructions, skill de revisão Koala.
---

# Contexto AI

> **Opt-in:** no `kl-nest new` (prompt “Configurar contexto para agentes de IA?”) ou `kl-nest add agents`. Com `-y` o contexto **não** é gerado — use `add agents` depois. A CLI **substitui por completo** a estrutura gerada (e remove o legado Cursor/Copilot de `ai-context`, se existir).

## Para que serve

Reduzir alucinação em vibecoding: o agente lê o repositório gerado (camadas DDD, bases do template, docs-first via [`llms.txt`](https://nest.koalarx.com/llms.txt)) em vez de inventar imports de `@koalarx/nest` ou APIs que não existem no projeto.

O entry point é **`AGENTS.md`** (padrão reconhecido por Cursor, Copilot e outras IDEs). Detalhes ficam em `.agents/instructions/`; skills em `.agents/skills/`.

## Comando

```bash
kl-nest add agents
```

No `kl-nest new` interativo, confirme se deseja configurar o contexto. Em modo silencioso (`-y`), rode `add agents` depois.

## O que a CLI instala

Arquivos copiados de `libs/cli/assets/agents/` (no pacote publicado):

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

| Arquivo | Papel |
| --- | --- |
| `AGENTS.md` | Índice curto — docs-first, hard constraints resumidos, mapa When→Read, skills |
| `.agents/instructions/*.md` | Instruções por finalidade (camadas, receita de recurso, libs, etc.) |
| `.agents/skills/code-review.md` | Skill de revisão completa nos padrões Koala |

Isso cobre o **framework** Koala Nest. Requisitos e regras de negócio do seu produto devem viver em arquivos seus (por exemplo sob `.agents/instructions/` ou `.github/instructions/`), sem duplicar o núcleo gerado pela CLI.

## Skill de revisão de código

Peça ao agente (frase exata):

> Faça uma revisão completa utilizando os padrões Koala

A skill em `.agents/skills/code-review.md` cobre: boas práticas, padrões Nest.js (via MCP do Nest quando disponível na IDE), Clean Code, abstração, DDD, cobertura de testes, segurança e uso padronizado da biblioteca/template.

## Comportamento de install

- **`new` (com confirmação)** e **`add agents`**: purge da estrutura anterior + cópia forçada dos assets.
- Remove legado de `ai-context`: `.cursor/rules/koala-*.mdc` e `.github/copilot-instructions.md`.
- Não gera mais regras `.mdc` nem `copilot-instructions.md` — o contexto é IDE-agnóstico via `AGENTS.md`.

## Próximos passos

- [Guia de instalação](./guia-de-instalacao.md) — `new`, `-y` e catálogo `add`
- [Visão geral](../intro/visao-geral.md) — features opcionais
- Índices LLM: [llms.txt](https://nest.koalarx.com/llms.txt) · [llms-en.txt](https://nest.koalarx.com/llms-en.txt)
