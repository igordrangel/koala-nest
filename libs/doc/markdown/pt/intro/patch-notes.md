---
title: Patch notes
slug: patch-notes
category: intro
docKey: intro/patch-notes
order: 3
description: Histórico de mudanças relevantes da CLI, templates e fluxos do Koala Nest.
---

# Patch notes

Changelog voltado a quem usa ou atualiza projetos gerados pela CLI. Detalhes técnicos de cada tópico ficam nas páginas da documentação referenciadas.

A versão publicada do pacote `@koalarx/nest` aparece no site e no `package.json` do repositório. O arquivo [`CHANGELOG.md`](https://github.com/igordrangel/koala-nest/blob/main/CHANGELOG.md) na raiz espelha estas notas.

## Unreleased

_(vazio — registre aqui mudanças ainda não publicadas)_

## 4.1.x — Migrations e descoberta de entidades

### O que mudou

- **Entidades no CLI:** `migration-datasource.ts` deixa de usar glob de arquivos e passa a ler `DbContext.entities`, preenchido por `load-all-entities.ts` ao gerar/aplicar migrations fora do Nest.
- **Boot da API:** `dataSourceFactory` configura o array `migrations` e chama `runMigrations()` após `initialize()` — pendentes sobem com a aplicação.
- **Scripts npm/pnpm:** migrations usam `ts-node` + `tsconfig-paths` para resolver aliases `@/`.
- **Auth:** instalação de auth **não** altera mais `data-source-factory.ts`. Entidades (ex.: `User`) entram no `DbContext` pelos imports dos repositórios.

### Como funciona (guia rápido)

1. Entidades em `src/domain/entities/` usam `@Entity` de `@/core/database/entity` (registra no `DbContext`).
2. Em runtime, o Nest importa repositórios → carrega entidades → `dataSourceFactory` usa `DbContext`.
3. No CLI (`migration:generate` / `migration:run`), `load-all-entities` faz `require` dos arquivos de entidade (ignora enums) para popular o mesmo `DbContext`.
4. Ao iniciar a API, migrations pendentes são aplicadas automaticamente. `migration:run` continua disponível para CI/ops.

Guia completo: [Migrations](../infra/migrations.md) · [Banco de dados](../infra/banco-de-dados.md)

### Projetos já gerados (upgrade)

Se o projeto foi criado com template antigo:

1. Copie/adapte `src/infra/database/migrations/load-all-entities.ts` do template atual.
2. Em `migration-datasource.ts`, importe `./load-all-entities` e use `entities: Array.from(DbContext.entities.values())`.
3. Em `data-source-factory.ts`, adicione o glob de `migrations` + `await dataSource.runMigrations()`.
4. Remova listas manuais `entities: [Person, ...]` (ou qualquer patch que as mantenha).
5. Em npm/pnpm, garanta `ts-node` e `tsconfig-paths` e scripts com `--require tsconfig-paths/register`.

Não há camada de compatibilidade na CLI: o template novo é a fonte da verdade.
