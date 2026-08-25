---
title: Guia de instalação
slug: guia-de-instalacao
category: inicio
docKey: inicio/guia-de-instalacao
order: 0
description: CLI kl-nest — new (API/Worker), modo silencioso -y, flags e add.
---

# Guia de instalação

O pacote `@koalarx/nest` expõe o comando **`kl-nest`**. Você pode usá-lo de três formas.

## Forma rápida: usando a CLI

### Instalação global (recomendado)

Instale uma vez e use `kl-nest` em qualquer pasta:

```bash
npm install -g @koalarx/nest
# ou: bun install -g @koalarx/nest
# ou: pnpm add -g @koalarx/nest

kl-nest new
kl-nest --help
```

### Sem instalar (bunx / npx)

Execute a versão publicada diretamente:

```bash
bunx @koalarx/nest new
npx @koalarx/nest new
```

Útil para testar uma versão específica:

```bash
bunx @koalarx/nest@latest new
npx @koalarx/nest@latest new
```

O comando `new` **interativo** pergunta, nesta ordem:

1. nome do projeto;
2. gerenciador de pacotes (`bun`, `npm` ou `pnpm` — Bun recomendado);
3. **tipo de aplicação:** **API** ou **Worker** (ver [API vs Worker](#api-vs-worker));
4. template (**Padrão** ou **Exemplo de CRUD** — só na API);
5. autenticação (**JWT**, **OAuth2** e/ou **API Key** — só na API; no CRUD, auth é obrigatória; API Key é aditiva);
6. funcionalidades extras (conforme o tipo — ver tabela abaixo);
7. **contexto AI** para vibecoding: **Cursor**, **GitHub Copilot**, ambos ou nenhum.

## API vs Worker

No `kl-nest new`, a CLI pergunta o **tipo de aplicação** (ou use `--type` / `--app-type` no modo silencioso).

| | **API** | **Worker** |
| --- | --- | --- |
| Uso | HTTP público / BFF / OpenAPI | Broker, fila, integração, background |
| Boot | `NestFactory.create` + `listen` | `NestFactory.createApplicationContext` |
| HTTP | Helmet, CORS, cookies, rate limit, Scalar `/doc` | **Sem** superfície HTTP |
| Env HTTP | `PORT`, `HOST`, `API_HOST`, `CORS_ORIGINS`, `RATE_LIMIT_*` | Sem essas vars |
| Docker | `EXPOSE 3000` | Sem `EXPOSE` |
| Template | `default` ou `crud` | Só `default` |
| Auth / health | JWT, OAuth2, API Key, health | **Não** disponíveis |
| Features típicas | cache, health, cron, events, queue | cache, **queue**, cron, events |
| Controllers | `host/controllers` | Sem controllers/decorators/filters HTTP; filas via `QueueBase`; cron/events via `host/jobs` se instalados |

Aliases de tipo: `api` / `http` → API; `worker` / `broker` / `background` / `background-service` → Worker.

Visão de segurança HTTP: [Segurança](../host/seguranca.md). Bootstrap: [Estrutura do projeto](./estrutura-do-projeto.md).

O módulo **core** instala o essencial. Na **API**: `@koalarx/utils`, `@nestjs/config`, `@nestjs/swagger`, `typeorm`, `pg`, `zod`, `@scalar/nestjs-api-reference`, `helmet`. No **Worker**: sem swagger/Scalar/helmet/cookie-parser. Dependências extras:

| Opção | Pacotes adicionais |
| --- | --- |
| **JWT / OAuth2** (só API) | `@nestjs/jwt`, `passport`, `cookie-parser`, … |
| **Cache (Redis)** | `ioredis` + `ICacheService` |
| **Jobs (Cron)** | `cron-parser` + bases em `background-services` |
| **Health check** (só API) | `@nestjs/terminus` + `GET /health` |
| **Queue** | `QueueBase` + stub `QueueService` (infra a implementar) |

OAuth2 e cron jobs instalam **cache em memória** automaticamente (sem `ioredis`) quando Redis não foi selecionado. Veja [Koala Utils](../core/koala-utils.md) e [Cache (Redis)](../core/cache.md).

## Modo silencioso (`-y` / `--yes`)

`-y` **pula todos os prompts** e exige o **nome do projeto** na linha de comando. Valores omitidos usam defaults:

| Flag | Default com `-y` | Valores / aliases |
| --- | --- | --- |
| (nome) | **obrigatório** | `kl-nest new my-app -y …` |
| `--pm` | `bun` | `bun`, `npm`, `pnpm` |
| `--type` / `--app-type` | `api` | `api`/`http` · `worker`/`broker`/`background` |
| `--template` / `-t` | `default` | `default` · `crud` (só API) |
| `--auth` | `none` (lista vazia) | `none`, `jwt`, `oauth2`, `api-key` (vírgula; só API) |
| `--features` | nenhuma | `cache,health,cron,events,queue` (vírgula; `health` só API) |
| `--api-key-internal-subnet` | off | flag boolean (com API Key) |
| contexto AI | **não gera** | use `kl-nest add ai-context cursor\|github` depois |

Regras com Worker + `-y`:

- `--template crud` → erro
- `--auth jwt` (qualquer auth) → erro
- `--features` com `health` → erro

Exemplos (úteis para agentes / CI):

```bash
# API mínima
kl-nest new my-api -y --pm bun --auth none

# API CRUD + JWT
kl-nest new my-api -y --template crud --pm bun --auth jwt

# Worker / broker com fila e cron
kl-nest new my-worker -y --type worker --pm bun --features queue,cron
kl-nest new my-broker -y --app-type broker --features queue

# API + features + verbose
kl-nest new my-api -y --features cache,health,queue --verbose
```

`kl-nest add` **não** tem `-y`: passar os itens na linha de comando já é o modo direto (sem prompt). `kl-nest add` sem argumentos abre o multiselect interativo.

## Comandos disponíveis

| Comando | Descrição |
| --- | --- |
| `kl-nest new [nome] [flags]` | Cria projeto (interativo ou `-y`) |
| `kl-nest add [itens]` | Adiciona features (direto se informar itens) |
| `kl-nest version` | Versão da CLI |
| `kl-nest help` | Ajuda (flags de `new`, exemplos) |

Opção global: `--verbose` — ecoa saída de npm/bun/nest.

## Adicionar funcionalidades depois (`add`)

Na raiz de um projeto já criado:

```bash
cd my-api

# interativo — lista só o que ainda não está instalado
kl-nest add

# direto (silencioso quanto a prompts)
kl-nest add cache
kl-nest add auth jwt
kl-nest add auth api-key --api-key-internal-subnet
kl-nest add health cron events
kl-nest add queue
kl-nest add ai-context cursor
kl-nest add ai-context github
kl-nest add ai-context cursor github
```

| Item | Comando | Observação |
| --- | --- | --- |
| Autenticação JWT | `kl-nest add auth jwt` | Só faz sentido em API |
| Autenticação OAuth2 | `kl-nest add auth oauth2` | Inclui cache em memória para o `state` |
| Autenticação API Key | `kl-nest add auth api-key` | Aditiva — exige JWT e/ou OAuth2 já instalados (ou no mesmo comando). Opcional: `--api-key-internal-subnet` |
| Cache Redis | `kl-nest add cache` | Adiciona `ioredis`; no CRUD, restaura cache de listagem |
| Health check | `kl-nest add health` | Terminus HTTP — só API |
| Cron jobs | `kl-nest add cron` | Requer cache em memória; registra `JobsModule` / `host/jobs` |
| Event jobs | `kl-nest add events` | Registra `JobsModule` / `host/jobs`; no CRUD, restaura handlers de exemplo |
| Queue jobs | `kl-nest add queue` | Ideal em Worker; usa `QueueBase` + `IQueueService` — **não** instala `JobsModule` |
| Contexto AI (Cursor) | `kl-nest add ai-context cursor` | `AGENTS.md` + `.cursor/rules` (não sobrescreve). Detalhes: [Contexto AI](./contexto-ai.md) |
| Contexto AI (Copilot) | `kl-nest add ai-context github` | `AGENTS.md` + `.github/copilot-instructions.md`. Detalhes: [Contexto AI](./contexto-ai.md) |

## Templates

**Padrão** — estrutura DDD pronta para começar do zero, sem código de exemplo de domínio. Único template do **Worker**.

**Exemplo de CRUD** — só **API**. Inclui o módulo `Person` completo com **auth, cache Redis, cron jobs e event jobs** já instalados. Apenas **health check** é opcional na criação.

## Variáveis de ambiente

Após criar o projeto, a CLI já gera um `.env` a partir do `.env.example` (com `DATABASE_URL` ajustada ao nome do projeto). Com autenticação JWT / OAuth2 / API Key, as chaves `JWT_PRIVATE_KEY` e `JWT_PUBLIC_KEY` também são geradas automaticamente no `.env`. Em **Worker**, não há `PORT`/`HOST`/`CORS_*`/`RATE_LIMIT_*`.

```env
PORT=3000
NODE_ENV=develop
DATABASE_URL=postgresql://postgres:root@localhost:5432/koala_nest
```

## Scripts úteis no projeto gerado

O `kl-nest new` configura os scripts conforme o gerenciador escolhido. Exemplos equivalentes:

**Bun (recomendado)**

```bash
bun run start:dev
bun run start:prod
bun test
bun test --watch
bun run test:e2e
bun run migration:generate
bun run migration:run
bun run migration:revert
```

**npm**

```bash
npm run start:dev
npm run start:prod
npm run test
npm run test:watch
npm run test:e2e
npm run migration:generate
npm run migration:run
npm run migration:revert
```

**pnpm**

```bash
pnpm run start:dev
pnpm run start:prod
pnpm run test
pnpm run test:watch
pnpm run test:e2e
pnpm run migration:generate
pnpm run migration:run
pnpm run migration:revert
```

> **Importante:** em qualquer projeto, ao iniciar a API as migrations pendentes são aplicadas automaticamente (`runMigrations` no `dataSourceFactory`). O script `migration:run` permanece disponível para CI/ops. O template **Exemplo de CRUD** traz a migration inicial (`1781281330533-Init.ts`); o **Padrão** não inclui migrations iniciais. Testes unitários: **Bun** usa `bun test`; **npm/pnpm** usam **Vitest** (`npm run test`). **E2E:** todo projeto inclui `test:e2e` e a infraestrutura em `src/test/`. Na **API**, o template **Padrão** traz `app.e2e.spec.ts` mínimo; o **CRUD** inclui Person/auth. No **Worker**, o E2E usa `Test.createTestingModule(...).compile()` (sem HTTP). Requer `DATABASE_URL` apontando para Postgres local.

## Desenvolvimento local da CLI

Para contribuir ou testar alterações locais:

```bash
git clone https://github.com/igordrangel/koala-nest.git
cd koala-nest
bun install
bun run build
bun kl-nest new
```

## Próximos passos

- [Variáveis de ambiente](./variaveis-de-ambiente.md) — schema Zod e validação no boot
- [Estrutura do projeto](./estrutura-do-projeto.md) — bootstrap API e Worker
- [Segurança](../host/seguranca.md) — camadas HTTP (só API)
- [Visão geral](../intro/visao-geral.md) — o que o template inclui
