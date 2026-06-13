# Koala Nest

Facilitador para criar APIs NestJS com arquitetura DDD, focado em manutenção, escalabilidade e liberdade para evoluir o código no seu próprio repositório.

Em vez de depender de uma biblioteca opaca, a CLI **copia módulos prontos para dentro do projeto** — abordagem semelhante ao [shadcn/ui](https://ui.shadcn.com). Você recebe código que pode ler, adaptar e manter sem amarras futuras.

**Documentação:** [nest.koalarx.com](https://nest.koalarx.com/) (PT e EN)

## O que está disponível hoje

| Recurso | Status |
| --- | --- |
| Comando `new` (projeto interativo) | Disponível |
| Módulo **core** (DDD, TypeORM, Swagger, validação) | Disponível |
| Template **Padrão** (estrutura limpa) | Disponível |
| Template **Exemplo de CRUD** (Person) | Disponível |
| Autenticação (JWT, OAuth2) | Disponível na CLI |
| API Key | Em breve |
| Cache, health check, jobs internos | Disponível via `new` e `add` |
| Comando `add` (funcionalidades avulsas) | Disponível |

## Instalação e uso

O pacote `@koalarx/nest` expõe o comando **`kl-nest`**. Você pode usá-lo de três formas:

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

Execute a versão publicada diretamente, sem instalação global:

```bash
bunx @koalarx/nest new
npx @koalarx/nest new
```

Útil para testar uma versão específica ou usar a CLI pontualmente:

```bash
bunx @koalarx/nest@latest new
npx @koalarx/nest@latest new
```

## CLI

### Comandos

| Comando | Descrição |
| --- | --- |
| `kl-nest new` | Cria um novo projeto (fluxo interativo) |
| `kl-nest add` | Adiciona funcionalidades a um projeto existente |
| `kl-nest version` | Exibe a versão da CLI |
| `kl-nest help` | Lista comandos disponíveis |

```bash
kl-nest new
kl-nest add cache
kl-nest add auth jwt health
kl-nest version
kl-nest --help

# equivalente sem instalação global:
bunx @koalarx/nest new
npx @koalarx/nest new
```

O comando `new` pergunta:

- nome do projeto;
- gerenciador de pacotes (`bun`, `npm` ou `pnpm` — Bun recomendado);
- template (**Padrão** ou **Exemplo de CRUD**);
- estratégia de autenticação (**JWT**, **OAuth2** ou nenhuma) e funcionalidades extras (cache, health, cron, eventos); **API Key** ainda aparece desabilitada no prompt;

O comando `add` instala funcionalidades em um projeto Koala Nest já existente (detecta o que já está presente e pula duplicatas):

- `auth jwt` / `auth oauth2` — autenticação
- `cache` — cache Redis (com exemplos no template CRUD)
- `health` — endpoint `GET /health`
- `cron` — jobs com expressão cron
- `events` — jobs reativos a eventos

```bash
cd meu-projeto
kl-nest add cache
kl-nest add auth jwt health --verbose
kl-nest add cron events
```

### Templates

**Padrão** — estrutura DDD pronta para começar do zero, sem código de exemplo de domínio.

**Exemplo de CRUD** — inclui um módulo completo de `Person` (entidades, repositório, handlers, controllers e mapeamentos) para servir de referência.

## Estrutura gerada

Projetos criados seguem esta organização:

```
src/
├── application/   # casos de uso, validadores, mapeamentos
├── core/          # utilitários, env, ferramentas compartilhadas
├── domain/        # entidades, DTOs, contratos de repositório
├── host/          # controllers, módulos Nest, filtros, OpenAPI
├── infra/         # banco de dados, repositórios, serviços externos
└── test/          # testes unitários
```

## Módulo core

Ao criar um projeto, o módulo core instala e configura:

- validação de variáveis de ambiente com **Zod** (`PORT`, `NODE_ENV`, `DATABASE_URL`);
- **TypeORM** com PostgreSQL e scripts de migration;
- documentação OpenAPI em `/doc` via **Scalar**;
- filtro global de erros;
- bases reutilizáveis para controllers, handlers, validators e repositórios;
- sistema de mapeamento entre entidades, requests e responses.

### Variáveis de ambiente

Crie um `.env` na raiz do projeto gerado:

```env
PORT=3000
NODE_ENV=develop
DATABASE_URL=postgresql://user:password@localhost:5432/my_api
```

### Scripts úteis no projeto gerado

```bash
bun run start:dev          # servidor em modo watch
bun run migration:generate # gera migration a partir das entidades
bun run migration:run      # aplica migrations pendentes
bun run migration:revert   # reverte a última migration
```

## Documentação

Site completo: **[nest.koalarx.com](https://nest.koalarx.com/)** — guias de instalação, arquitetura DDD, autenticação, cache, jobs e fluxo CRUD (português e inglês).

### Índices para agentes de IA

- PT: https://nest.koalarx.com/llms.txt (alias: `/llm.txt`)
- EN: https://nest.koalarx.com/llms-en.txt (alias: `/llm-en.txt`)

## Repositório (desenvolvimento)

Para contribuir ou testar alterações locais da CLI:

```bash
git clone <url-do-repositorio>
cd koala-nest
bun install
bun run build
bun kl-nest new
```

O script `bun kl-nest` no `package.json` compila o projeto e executa a CLI a partir de `dist/cli/index.js`.

```
koala-nest/
├── libs/
│   ├── cli/          # código-fonte da CLI (kl-nest)
│   ├── doc/          # markdown da documentação + site Angular
│   └── koala-nest/   # templates copiados para projetos gerados
├── scripts/          # build da CLI, docs e templates
└── dist/             # saída do build (cli + koala-nest + package.json)
```

### Scripts de desenvolvimento

```bash
bun run build              # build completo (CLI + templates + dist/package.json)
bun run build:cli          # apenas a CLI
bun run build:koala-nest   # apenas os templates
bun run build:docs         # site de documentação
bun test                   # testes do monorepo (CLI, lib, docs)
```
