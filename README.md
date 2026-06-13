# Koala Nest

Facilitador para criar APIs NestJS com arquitetura DDD, focado em manutenção, escalabilidade e liberdade para evoluir o código no seu próprio repositório.

Em vez de depender de uma biblioteca opaca, a CLI **copia módulos prontos para dentro do projeto** — abordagem semelhante ao [shadcn/ui](https://ui.shadcn.com). Você recebe código que pode ler, adaptar e manter sem amarras futuras.

## O que está disponível hoje

| Recurso | Status |
| --- | --- |
| Comando `new` (projeto interativo) | Disponível |
| Módulo **core** (DDD, TypeORM, Swagger, validação) | Disponível |
| Template **Padrão** (estrutura limpa) | Disponível |
| Template **Exemplo de CRUD** (Person) | Disponível |
| Autenticação (JWT, OAuth2) | Disponível na CLI |
| API Key | Em breve |
| Cache, health check, jobs internos | Disponível no template (exemplos Person) |
| Comando `add` (módulos avulsos) | Em breve |

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
| `kl-nest version` | Exibe a versão da CLI |
| `kl-nest help` | Lista comandos disponíveis |

```bash
kl-nest new
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
- estratégia de autenticação (**JWT**, **OAuth2** ou nenhuma) e funcionalidades extras (opções futuras aparecem desabilitadas).

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
DATABASE_URL=postgres://user:password@localhost:5432/my_api
```

### Scripts úteis no projeto gerado

```bash
bun run start:dev          # servidor em modo watch
bun run migration:generate # gera migration a partir das entidades
bun run migration:run      # aplica migrations pendentes
bun run migration:revert   # reverte a última migration
```

## Documentação para agentes de IA

Índice de documentação otimizado para LLMs:

https://nest.koalarx.com/llm.txt

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
│   └── koala-nest/   # templates copiados para projetos gerados
├── scripts/          # build da CLI e dos templates
└── dist/             # saída do build (cli + koala-nest + package.json)
```

### Scripts de desenvolvimento

```bash
bun run build              # build completo (CLI + templates + dist/package.json)
bun run build:cli          # apenas a CLI
bun run build:koala-nest   # apenas os templates
bun test                   # testes em libs/koala-nest
```
