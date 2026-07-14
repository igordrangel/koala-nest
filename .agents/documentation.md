# Documentação web e LLM

Guia para adicionar ou alterar tópicos da documentação do Koala Nest (site + índices para LLMs).

## Pipeline

```
libs/doc/markdown/{pt,en}/**/*.md   → fonte (frontmatter + corpo)
scripts/build-doc-manifest.mjs      → bun run doc:manifest
  ├── libs/doc/site/src/generated/docs-manifest.json
  ├── libs/doc/site/public/markdown/**  (cópia pública)
  ├── libs/doc/txt/llms.txt | llms-en.txt | llm*.txt
  ├── libs/doc/site/public/llms*.txt
  └── libs/doc/site/public/sitemap.xml
```

Após alterar markdown, rode `bun run doc:manifest` antes do build/dev de docs (`bun run dev:docs` / `bun run build:docs` já disparam o manifest).

**Não edite `llms*.txt` à mão** — eles são regenerados a partir do frontmatter dos markdowns.

## Frontmatter

Cada arquivo em `libs/doc/markdown/<locale>/` precisa de:

```yaml
---
title: Título do tópico
slug: meu-slug
category: core
docKey: core/meu-slug
order: 1
description: Uma linha para o índice LLM e a navegação.
---
```

| Campo | Notas |
|-------|--------|
| `category` | PT: `intro`, `inicio`, `core`, `domain`, `application`, `host`, `infra`, `guias`. EN: `intro`, `getting-started`, `core`, `domain`, `application`, `host`, `infra`, `guides`. |
| `slug` | Segmento da rota `/{locale}/docs/{category}/{slug}`. |
| `docKey` | Chave estável para pairing PT/EN (ex.: `core/koala-utils`). Use o **mesmo** `docKey` nos dois idiomas. |
| `order` | Ordem dentro da categoria na nav e no `llms.txt`. |

Rotas e labels de categoria vêm de `libs/doc/shared/nav.mjs`.

## Checklist — novo tópico

1. Criar `libs/doc/markdown/pt/<category>/<slug>.md` com frontmatter completo.
2. Criar o par EN em `libs/doc/markdown/en/<category-en>/<slug-en>.md` com o **mesmo** `docKey`.
3. Rodar `bun run doc:manifest`.
4. Conferir que o item aparece em `libs/doc/txt/llms.txt` e `llms-en.txt`.
5. Abrir no site: `/{locale}/docs/{category}/{slug}`.
6. Validar URL raw: `https://nest.koalarx.com/markdown/<locale>/.../<file>.md` (após deploy) ou localmente em `libs/doc/site/public/markdown/...`.
7. Se o change for só de conteúdo de um tópico existente, basta editar o markdown + `doc:manifest`.

## Checklist — mudança de template / CLI

Quando a feature alterar o código gerado (não só a doc):

1. Implementar em `libs/koala-nest/` e/ou `libs/cli/`.
2. Atualizar markdowns afetados (PT + EN).
3. Se a validação de projeto gerado mudar, ajustar `libs/cli/constants/cli-project-checklist.ts` e `cli-project-validation.ts` (+ testes unitários).
4. Lembrete atual: projetos gerados devem ter `import '@koalarx/utils/prototypes'` em `src/host/main.ts` (e nos setups de teste do template).
5. Rodar `bun run doc:manifest` e os testes relevantes (`test:cli`, `test:koala-nest`, `test:docs`).

## Cross-links

- Links entre tópicos da doc Nest: relativos no markdown (ex.: `../host/openapi-scalar.md`); o site reescreve para rotas `/{locale}/docs/...`.
- Docs externas (utils, UI): URLs absolutas `https://utils.koalarx.com/...`.

## Validação

- [ ] Par PT/EN com o mesmo `docKey`
- [ ] `bun run doc:manifest` sem erro
- [ ] Item listado em `llms.txt` / `llms-en.txt`
- [ ] Página abre no site (`dev:docs` ou ambiente local)
- [ ] "Copy for AI" / URL `/markdown/...` aponta para o arquivo certo
- [ ] `bun run test:docs` passa, se a mudança afetar o site
