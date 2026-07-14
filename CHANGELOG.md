# Changelog

Todas as mudanças notáveis deste projeto são documentadas neste arquivo e na documentação web:

- PT: [Patch notes](https://nest.koalarx.com/pt/docs/intro/patch-notes)
- EN: [Patch notes](https://nest.koalarx.com/en/docs/intro/patch-notes)

O conteúdo principal vive em `libs/doc/markdown/{pt,en}/intro/patch-notes.md` (fonte da verdade para o site). Mantenha este arquivo alinhado ao publicar versões.

Formato inspirado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).

## [Unreleased]

### Added

- Documentação de patch notes (site + este CHANGELOG) e regra de contexto para manter as notas atualizadas.

### Changed

- Descoberta de entidades para migrations via `load-all-entities` + `DbContext` (CLI e runtime alinhados).
- Migrations aplicadas automaticamente no boot da API (`runMigrations` no `dataSourceFactory`).
- Scripts de migration npm/pnpm com `tsconfig-paths`.
- Removido patch legado de `entities: [...]` / alteração de `data-source-factory` na instalação de auth.

## [4.1.1] — versão atual do pacote

Ver seção **4.1.x** em [Patch notes](https://nest.koalarx.com/pt/docs/intro/patch-notes) e o histórico Git para detalhes anteriores.
