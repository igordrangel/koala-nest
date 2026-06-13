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
- estratégia de autenticação e funcionalidades extras (opções futuras aparecem desabilitadas).

## Comandos disponíveis

| Comando | Descrição |
| --- | --- |
| `kl-nest new` | Cria um novo projeto (fluxo interativo) |
| `kl-nest version` | Exibe a versão da CLI |
| `kl-nest help` | Lista comandos disponíveis |

## Templates

**Padrão** — estrutura DDD pronta para começar do zero, sem código de exemplo de domínio.

**Exemplo de CRUD** — inclui um módulo completo de `Person` (entidades, repositório, handlers, controllers e mapeamentos) para servir de referência.

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
bun run test
bun run test:watch
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

> **Importante:** no template **Exemplo de CRUD**, execute `migration:run` antes de iniciar a API. No template **Padrão** não há migrations iniciais. Com npm ou pnpm, o `kl-nest new` adiciona `bun` em `devDependencies` para que `npm test` funcione após `npm install`.

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
