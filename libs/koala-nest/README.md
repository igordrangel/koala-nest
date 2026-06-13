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
bun run test        # unitários (Bun)
bun run test:e2e    # E2E (requer DATABASE_URL)
```

## Autenticação

O template **Exemplo de CRUD** sobe apenas `PersonModule`. Ao criar um projeto com `kl-nest new`, a CLI instala JWT ou OAuth2 e aplica patches em `app.module.ts` e `main.ts` (`SecurityModule`, `AuthModule`, guards globais).

## Dependências Koala

| Pacote | Uso |
|--------|-----|
| [`@koalarx/utils`](https://www.npmjs.com/package/@koalarx/utils) | `delay`, validação/máscara CPF-CNPJ, utilitários de string/data |

Veja a [documentação Koala Utils](../../doc/markdown/pt/core/koala-utils.md).

## Scripts úteis

| Script | Descrição |
|--------|-----------|
| `start:debug` | Nest em watch com inspector |
| `migration:run` | Aplica migrations TypeORM |
| `migration:generate` | Gera migration a partir das entidades |
