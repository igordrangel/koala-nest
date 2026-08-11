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

## 4.3.1 — Scaffold OpenAPI e tsconfig

### O que mudou

- **`hiddenClients` do Scalar:** removidos IDs inválidos (`request`, `http1`, `http2`, `httr`) que geravam erro TypeScript no `define-documentation.ts` gerado.
- **OpenAPI sync nas variantes slim:** templates sem auth e JWT-only deixam de usar `async` sem `await` (evita `@typescript-eslint/require-await`).
- **`tsconfig.spec.json` no scaffold:** copiado/gerado junto do core (Bun: template com `bun-types` + `@types/bun`; npm/pnpm: variante mínima) para o ESLint encontrar o arquivo referenciado em `parserOptions.project`.

### Upgrade

Em projetos já gerados: alinhe a lista `hiddenClients` e remova `async` desnecessário no OpenAPI como no template atual; se o ESLint apontar `tsconfig.spec.json` ausente, copie o arquivo do template (ou a variante npm/pnpm) e, em Bun, adicione `@types/bun` como devDependency.

## 4.3.0 — API Key (autenticação M2M)

### O que mudou

- **Nova estratégia aditiva `api-key`:** use com JWT e/ou OAuth2 (`--auth jwt,api-key`). Não pode ser escolhida sozinha.
- **CRUD `/api-key`:** cria JWT RS256 long-lived (`typ: api-key`) e valida origem (`domain` / `host` / `uri`).
- **Subnet interna opcional:** `--api-key-internal-subnet` (ou prompt na CLI) libera IPs privados entre pods no tipo `domain`.
- **Scalar:** esquema `ApiKey` (header) além de JWT/OAuth2.
- Doc de autenticação cobre o papel M2M sem substituir broker/storage.
- **Contexto AI (vibecoding):** no `kl-nest new` (prompt) e no `kl-nest add ai-context cursor|github` — gera `AGENTS.md` e regras Cursor / instruções Copilot voltadas ao projeto gerado (docs-first + constraints DDD). Com `-y` não gera; use `add` depois. Não sobrescreve arquivos já existentes.
- **Chaves JWT no `.env`:** ao escolher JWT, OAuth2 e/ou API Key no `new` ou no `add auth`, a CLI gera o par RS256 (`JWT_PRIVATE_KEY` / `JWT_PUBLIC_KEY` em base64) e preenche o `.env`. Placeholders no `.env.example` ficam vazios; valores já preenchidos não são sobrescritos.

### Upgrade

Em projetos já gerados: `kl-nest add auth api-key` (com JWT/OAuth2 já instalado) e opcionalmente `--api-key-internal-subnet`. Gere/aplique a migration `CreateApiKey` e adicione `passport-custom` se necessário.

Para contexto AI em projetos existentes: `kl-nest add ai-context cursor`, `github` ou ambos.

## 4.2.0 — Migrations e descoberta de entidades

### O que mudou

- **Entidades no CLI:** `migration-datasource.ts` deixa de usar glob de arquivos e passa a ler `DbContext.entities`, preenchido por `load-all-entities.ts` ao gerar/aplicar migrations fora do Nest. Falhas ao carregar entidades propagam (só `ENOENT` do diretório ausente é ignorado).
- **Boot da API:** `dataSourceFactory` configura o array `migrations` e chama `runMigrations()` após `initialize()` — pendentes sobem com a aplicação.
- **Scripts npm/pnpm:** migrations usam `ts-node` + `tsconfig-paths` para resolver aliases `@/`. `dotenv`, `ts-node` e `tsconfig-paths` entram nos pacotes core da CLI.
- **Auth:** instalação de auth **não** altera mais `data-source-factory.ts`. Entidades (ex.: `User`) entram no `DbContext` pelos imports dos repositórios.
- **`@koalarx/utils` prototypes:** o template ativa `import '@koalarx/utils/prototypes'` em `src/host/main.ts` e nos setups de teste. No backend Nest, o padrão passa a ser métodos nativos (ex.: `.maskCpf()`, `.orderBy()`); `delay`, `randomString` e feriados continuam por import explícito. Ver [Koala Utils](../core/koala-utils.md).
- **Checklist / boot:** `load-all-entities.ts` e demais arquivos de migration passam a ser obrigatórios na validação do projeto; `main.ts` deve importar `@koalarx/utils/prototypes`.

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
5. Em npm/pnpm, garanta `dotenv`, `ts-node` e `tsconfig-paths` e scripts com `--require tsconfig-paths/register`.
6. Em `src/host/main.ts` (e setups de teste), importe `@koalarx/utils/prototypes`.

Não há camada de compatibilidade na CLI: o template novo é a fonte da verdade.
