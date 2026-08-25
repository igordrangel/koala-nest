---
title: Contexto AI
slug: contexto-ai
category: inicio
docKey: inicio/contexto-ai
order: 3
description: Vibecoding com Cursor e GitHub Copilot — o que a CLI gera e estrutura recomendada de contexto.
---

# Contexto AI

> **Opt-in:** no `kl-nest new` (prompt) ou `kl-nest add ai-context cursor` / `github` / ambos. Com `-y` o contexto **não** é gerado — use `add` depois. A CLI **não sobrescreve** arquivos já existentes.

## Para que serve

Reduzir alucinação em vibecoding: o agente lê o repositório gerado (camadas DDD, bases do template, docs-first via [`llms.txt`](https://nest.koalarx.com/llms.txt)) em vez de inventar imports de `@koalarx/nest` ou APIs que não existem no projeto.

O núcleo (`AGENTS.md` e regras do editor) aponta para a documentação pública e lista constraints (camadas, Bun, Zod, tipo API vs Worker, etc.). Conteúdo de **domínio/negócio** do seu produto deve viver à parte — veja [estrutura recomendada](./contexto-ai.md#estrutura-recomendada-para-contextos-futuros).

## IDEs e ferramentas suportadas

| Alvo CLI | Ferramenta | O que a CLI gera |
| --- | --- | --- |
| `cursor` | [Cursor](https://cursor.com) | `AGENTS.md` + `.cursor/rules/*.mdc` |
| `github` | GitHub Copilot (VS Code / GitHub) | `AGENTS.md` + `.github/copilot-instructions.md` |

Aliases de `github`: `copilot`, `github-copilot`. Dá para instalar os dois no mesmo comando:

```bash
kl-nest add ai-context cursor
kl-nest add ai-context github
kl-nest add ai-context cursor github
```

## O que a CLI instala hoje

Arquivos copiados de `libs/cli/assets/ai-context/` (no pacote publicado):

| Arquivo | Papel |
| --- | --- |
| `AGENTS.md` | Entry curta — docs-first + hard constraints (Cursor e Copilot leem) |
| `.cursor/rules/koala-*.mdc` | Regras path-scoped por camada (host, application, domain, …) |
| `.github/copilot-instructions.md` | Entry do Copilot (espelha o espírito do `AGENTS.md`) |

Isso cobre o **framework** Koala Nest. Não inclui requisitos, regras de negócio nem políticas operacionais do seu domínio.

## Estrutura recomendada para contextos futuros

Para evoluir o contexto sem duplicar fonte de verdade, use pastas sob `.github/` (padrão usado em projetos Koala Nest em produção):

```text
AGENTS.md                         # entry Cursor / agents (CLI)
.cursor/rules/                    # regras path-scoped Cursor (CLI)
.github/
  copilot-instructions.md         # entry Copilot (CLI) — aponta para instructions/
  instructions/                   # fonte canônica de domínio / negócio / operação
    README.md                     # índice + ordem de leitura
    ...                           # requisitos, regras de negócio, políticas, etc.
  agents/                         # (opcional) agentes especializados
    README.md
  prompts/                        # (opcional) prompts reutilizáveis
    README.md
  skills/                         # (opcional) skills / guias de domínio
    README.md
```

### Convenções

- **Uma fonte de verdade:** domínio e negócio em `.github/instructions/`; não copie o mesmo texto longo em `AGENTS.md`, Copilot e Cursor.
- **Entries curtas:** `AGENTS.md` e `copilot-instructions.md` ficam enxutos e **linkam** para `instructions/`.
- **`agents` / `prompts` / `skills`:** pastas opcionais para evolução (a CLI **não** as cria hoje).
- **Cursor path-scoped:** continue usando `.cursor/rules` para regras por pasta; conteúdo longo de domínio fica em `instructions/`.

Exemplo de índice em `instructions/README.md`: ordem de leitura (política → uso técnico → requisitos → regras de negócio) e um guia rápido “onde consultar o quê”.

## Próximos passos

- [Guia de instalação](./guia-de-instalacao.md) — `new`, `-y` e catálogo `add`
- [Visão geral](../intro/visao-geral.md) — features opcionais
- Índices LLM: [llms.txt](https://nest.koalarx.com/llms.txt) · [llms-en.txt](https://nest.koalarx.com/llms-en.txt)
