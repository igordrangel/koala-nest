# Changelog

Todas as mudanças notáveis deste projeto são documentadas neste arquivo e na documentação web:

- PT: [Patch notes](https://nest.koalarx.com/pt/docs/intro/patch-notes)
- EN: [Patch notes](https://nest.koalarx.com/en/docs/intro/patch-notes)

O conteúdo principal vive em `libs/doc/markdown/{pt,en}/intro/patch-notes.md` (fonte da verdade para o site). Mantenha este arquivo alinhado ao publicar versões.

Formato inspirado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).

## [4.4.0] — Build, Docker e QueueBase

### Added

- Feature opt-in `queue` / `queue-jobs`: `QueueBase`, `IQueueService`, stub `QueueService`, `QueueFakeService` e vars abstratas de env.
- `Dockerfile` + `entrypoint.sh` gerados no `kl-nest new` conforme `bun` / `npm` / `pnpm`.
- Documentação PT/EN de queue jobs.

### Changed

- Script `build` dos projetos gerados: `nest build && tsc-alias -p tsconfig.build.json` (`tsc-alias` em `CORE_DEV_PACKAGES`).

Detalhes: [Patch notes — 4.4.0](https://nest.koalarx.com/pt/docs/intro/patch-notes).

## [4.3.1]

### Fixed

- Scalar `hiddenClients` alinhados aos IDs tipados atuais (remove `request`, `http1`, `http2`, `httr` inválidos).
- Variantes OpenAPI sem auth e JWT-only geradas sem `async` desnecessário (`require-await`).
- Scaffold passa a incluir `tsconfig.spec.json` (template Bun com `bun-types`; variante mínima para npm/pnpm) e instala `@types/bun` em projetos Bun — corrige ESLint/`parserOptions.project` apontando para arquivo inexistente.

Detalhes: [Patch notes — 4.3.1](https://nest.koalarx.com/pt/docs/intro/patch-notes).

## [4.3.0] — API Key (autenticação M2M)

### Added

- Estratégia aditiva `api-key` na CLI (`jwt,api-key` / `oauth2,api-key` / `jwt,oauth2,api-key`).
- CRUD `/api-key`, Passport strategy, validação de origem (`domain`/`host`/`uri`) e opção `--api-key-internal-subnet`.
- Esquema Scalar `ApiKey` (header).
- Documentação de autenticação e patch notes para API Key.
- Contexto AI no `new` (prompt) e `add ai-context cursor|github`: `AGENTS.md`, `.cursor/rules` e/ou `.github/copilot-instructions.md` para vibecoding.
- Geração automática de `JWT_PRIVATE_KEY` / `JWT_PUBLIC_KEY` (RS256 em base64) no `.env` ao instalar JWT, OAuth2 e/ou API Key (`new` / `add auth`).

### Changed

- `AuthGuard` aceita JWT Bearer e/ou header `ApiKey` quando a estratégia está instalada.

Detalhes: [Patch notes — 4.3.0](https://nest.koalarx.com/pt/docs/intro/patch-notes).

## [4.2.0] — Migrations e descoberta de entidades

### Added

- Documentação de patch notes (site + este CHANGELOG) e regra de contexto para manter as notas atualizadas.
- `load-all-entities.ts` para popular `DbContext` fora do Nest (CLI de migrations).
- Pacotes core `dotenv`, `ts-node` e `tsconfig-paths` na CLI.

### Changed

- Descoberta de entidades para migrations via `load-all-entities` + `DbContext` (CLI e runtime alinhados); erros de carregamento propagam (exceto diretório ausente).
- Migrations aplicadas automaticamente no boot da API (`runMigrations` no `dataSourceFactory`).
- Scripts de migration npm/pnpm com `tsconfig-paths`.
- Removido patch legado de `entities: [...]` / alteração de `data-source-factory` na instalação de auth.
- Template e checklist passam a exigir `import '@koalarx/utils/prototypes'` no `main.ts` (e setups de teste); padrão Nest é usar métodos de prototype do `@koalarx/utils`.
- Checklist exige arquivos de migration (`load-all-entities` e demais).

Detalhes e guia de upgrade: [Patch notes — 4.2.0](https://nest.koalarx.com/pt/docs/intro/patch-notes).

## [4.1.1]

- Atualização para `@koalarx/utils` 5.0 e documentação apontando ao site oficial do Utils.
