# Koala Nest

Template NestJS com arquitetura em camadas (application, domain, host, infra) usado pela CLI `kl-nest`.

## Documentação

A documentação completa está em [`libs/doc`](../../doc). Para subir o site localmente, na raiz do monorepo:

```bash
bun run dev:docs
```

## Desenvolvimento local

```bash
bun install
cp .env.example .env
bun run build
bun run start:dev
```

Documentação OpenAPI/Scalar: `http://localhost:3000/doc`

## Testes

```bash
bun run test              # unitários da lib (Bun)
bun run test:e2e          # E2E da lib (requer DATABASE_URL)
```

Testes da CLI e da documentação ficam em `libs/cli` e `libs/doc/site` — na raiz do monorepo use `bun run test:cli` e `bun run test:docs`.

## Autenticação

O template **Exemplo de CRUD** já inclui `SecurityModule`, `AuthModule`, `PersonModule` (via `JobsModule`) e guards globais. No template **Padrão**, ao adicionar auth com `kl-nest add auth`, a CLI aplica patches em `app.module.ts`, `main.ts`, `repository.module.ts`, env e OpenAPI — **sem** alterar `data-source-factory.ts` (`User` entra via `@Entity` + `DbContext`).

## Dependências Koala

| Pacote | Uso |
|--------|-----|
| [`@koalarx/utils`](https://utils.koalarx.com/) | `import '@koalarx/utils/prototypes'` em `main.ts` e setups de teste; `delay`, validação/máscara CPF-CNPJ, utilitários de string/data |

Veja a [documentação Koala Utils](../../doc/markdown/pt/core/koala-utils.md).

## Scripts úteis

| Script | Descrição |
|--------|-----------|
| `start:debug` | Nest em watch com inspector |
| `migration:run` | Aplica migrations TypeORM (fallback / CI) |
| `migration:generate` | Gera migration a partir das entidades |

Migrations pendentes também são aplicadas automaticamente ao subir a API (`runMigrations` no `dataSourceFactory`).
