# Koala Nest — Site de documentação

Aplicação Angular que publica a documentação em [nest.koalarx.com](https://nest.koalarx.com).

## Stack

- Angular 21 (standalone)
- Koala UI (componentes copiados via CLI)
- Tailwind CSS 4 + DaisyUI
- `ngx-markdown` + Prism.js
- Conteúdo em `libs/doc/markdown/{pt,en}/`

## Comandos (na raiz do monorepo)

```bash
# Gerar manifest, llms.txt e markdown estático em public/
bun run doc:manifest

# Desenvolvimento (http://localhost:4200)
bun run dev:docs

# Build de produção
bun run build:docs

# Preview do build
bun run preview:docs
```

## Comandos (neste diretório)

```bash
bun run test:unit    # Vitest — utils e helpers
bun run e2e          # Playwright — smoke da landing e docs
bun run test         # unit + e2e
```

## Estrutura

```
src/app/
├── core/           # header, footer, sidebar, serviços, i18n
├── features/       # landing e páginas de doc
└── shared/         # Button directive (Koala UI)

public/
├── CNAME           # nest.koalarx.com
├── llms.txt        # índice para LLMs (gerado)
└── markdown/       # .md estáticos para Copy for AI (gerado)
```

## Deploy

O workflow `.github/workflows/deploy-docs.yml` na raiz do repositório faz build e publica no GitHub Pages ao push na branch `main` (paths em `libs/doc/**`).

## Documentação para IA

| Recurso | URL |
|---------|-----|
| Índice geral | `/llms.txt` (PT), `/llms-en.txt` (EN) |
| Página específica | `/markdown/{locale}/{categoria}/{slug}.md` |

O botão **Copy AI** no header copia a URL do índice. O **Copy for AI** em cada página copia a URL do Markdown correspondente.
