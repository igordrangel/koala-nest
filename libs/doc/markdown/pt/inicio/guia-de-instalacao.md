---
title: Guia de instalação
slug: guia-de-instalacao
category: inicio
docKey: inicio/guia-de-instalacao
order: 0
description: Instale a CLI e crie seu primeiro projeto NestJS com DDD.
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

O comando `new` pergunta:

- nome do projeto;
- gerenciador de pacotes (`bun`, `npm` ou `pnpm` — Bun recomendado);
- template (**Padrão** ou **Exemplo de CRUD**);
- estratégia de autenticação (**JWT** ou **OAuth2** — no CRUD, auth é obrigatória);
- funcionalidades extras (no **Padrão**: cache, health, cron, eventos; no **CRUD**: apenas health check — auth, cache Redis e jobs já vêm incluídos).

O módulo **core** instala apenas o essencial (`@koalarx/utils`, `@nestjs/config`, `@nestjs/swagger`, `typeorm`, `pg`, `zod`, `@scalar/nestjs-api-reference`). Dependências extras entram conforme as opções marcadas:

| Opção | Pacotes adicionais |
| --- | --- |
| **JWT / OAuth2** | `@nestjs/jwt`, `passport`, `cookie-parser`, … |
| **Cache (Redis)** | `ioredis` + `ICacheService` |
| **Jobs (Cron)** | `cron-parser` + bases em `background-services` |
| **Health check** | `@nestjs/terminus` + `GET /health` (DB e Redis opcional) |

OAuth2 e cron jobs instalam **cache em memória** automaticamente (sem `ioredis`) quando Redis não foi selecionado. Veja [Koala Utils](../core/koala-utils.md) e [Cache (Redis)](../core/cache.md).

## Comandos disponíveis

| Comando | Descrição |
| --- | --- |
| `kl-nest new` | Cria um novo projeto (fluxo interativo) |
| `kl-nest add [itens]` | Adiciona funcionalidades a um projeto existente |
| `kl-nest version` | Exibe a versão da CLI |
| `kl-nest help` | Lista comandos disponíveis |

## Adicionar funcionalidades depois (`add`)

Na raiz de um projeto já criado:

```bash
cd my-api

# interativo — lista só o que ainda não está instalado
kl-nest add

# direto
kl-nest add cache
kl-nest add auth jwt
kl-nest add health cron events
```

| Item | Comando | Observação |
| --- | --- | --- |
| Autenticação JWT | `kl-nest add auth jwt` | Instala `cookie-parser` e guards |
| Autenticação OAuth2 | `kl-nest add auth oauth2` | Inclui cache em memória para o `state` |
| Cache Redis | `kl-nest add cache` | Adiciona `ioredis`; no CRUD, restaura cache de listagem |
| Health check | `kl-nest add health` | Terminus: ping PostgreSQL + Redis (se configurado) |
| Cron jobs | `kl-nest add cron` | Requer cache em memória (instalado automaticamente) |
| Event jobs | `kl-nest add events` | No CRUD, restaura handlers de exemplo |

## Templates

**Padrão** — estrutura DDD pronta para começar do zero, sem código de exemplo de domínio.

**Exemplo de CRUD** — inclui o módulo `Person` completo com **auth, cache Redis, cron jobs e event jobs** já instalados. Apenas **health check** é opcional na criação.

## Variáveis de ambiente

Após criar o projeto, configure um `.env` na raiz:

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
pnpm run migration:generate
pnpm run migration:run
pnpm run migration:revert
```

> **Importante:** no template **Exemplo de CRUD**, execute `migration:run` antes de iniciar a API. No template **Padrão** não há migrations iniciais. Testes: **Bun** usa `bun test`; **npm/pnpm** usam **Vitest** (`npm run test`). Projetos gerados não incluem script `test:e2e` por padrão.

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
- [Estrutura do projeto](./estrutura-do-projeto.md) — bootstrap e módulos Nest
- [Visão geral](../intro/visao-geral.md) — o que o template inclui
