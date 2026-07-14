# Patch notes e changelog

Ao introduzir mudanças **visíveis** na CLI, nos templates (`libs/koala-nest`), no fluxo de migrations/database ou em APIs documentadas do projeto gerado:

1. Atualize **`libs/doc/markdown/pt/intro/patch-notes.md`** e o espelho EN **`libs/doc/markdown/en/intro/patch-notes.md`** (mesma `docKey: intro/patch-notes`).
2. Atualize **`CHANGELOG.md`** na raiz na seção da versão que está subindo (sem seção `[Unreleased]` — só o que já foi ou será publicado).
3. Se a mudança afetar onboarding ou scripts destacados, ajuste o **`README.md`** (links ou bullets em “Novidades” / scripts).
4. Não mantenha camadas legadas “só por compatibilidade” na CLI — documente o upgrade nos patch notes.

## O que registrar

- Breaking changes e passos de upgrade em projetos já gerados
- Novos comportamentos (ex.: `runMigrations` no boot)
- Remoção de APIs/patches/scripts
- Novas docs ou mudanças de fluxo recomendado

## O que não precisa

- Refactors internos sem impacto no usuário
- Correções de typo/testes sem mudança de comportamento

## Após editar markdown

Rode `bun run doc:manifest` (ou o fluxo de build de docs do repo) para regenerar o índice do site e `llms.txt`.
