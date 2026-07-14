# Changelog

Todas as mudanças notáveis deste projeto são documentadas neste arquivo e na documentação web:

- PT: [Patch notes](https://nest.koalarx.com/pt/docs/intro/patch-notes)
- EN: [Patch notes](https://nest.koalarx.com/en/docs/intro/patch-notes)

O conteúdo principal vive em `libs/doc/markdown/{pt,en}/intro/patch-notes.md` (fonte da verdade para o site). Mantenha este arquivo alinhado ao publicar versões.

Formato inspirado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).

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
