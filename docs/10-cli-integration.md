# Koala Nest CLI - Integração ao Monorepo

A CLI foi integrada com sucesso ao monorepo `koala-nest`. Agora ela reutiliza a estrutura do `apps/example` como template base, evitando duplicação de código.

## 📁 Estrutura Implementada

```
koala-nest/
├── apps/
│   ├── koala-nest-cli/          # CLI integrada ✨
│   │   ├── src/
│   │   │   ├── commands/
│   │   │   │   └── new-project/
│   │   │   │       └── index.ts  # Comando para criar novo projeto
│   │   │   └── index.ts          # Entrada principal
│   │   ├── templates/            # Templates (env, gitignore, Dockerfile)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   │
│   ├── koala-nest/              # Lib (já existia)
│   ├── example/                 # Template base (usado como referência)
│   ├── mcp-server/
│   └── mcp-vscode-extension/
│
└── scripts/
    └── build-cli.mjs            # Script de build da CLI
```

## 🎯 Como Funciona

### Antes (Duplicação)
```
koala-nest-cli/
└── code-base/
    └── startup-project/         # Cópia completa do projeto
```

### Depois (Sem Duplicação)
```
apps/example/                     # Template base único (reutilizado)
apps/koala-nest-cli/
├── src/                          # Código da CLI
├── templates/                    # Extras (Dockerfile, env, gitignore)
└── build/ (gerado)
    ├── example/                  # Cópia do example incluída
    └── templates/                # Extras adicionados
```

## 🚀 Uso

### Criar Novo Projeto

```bash
# Via global
npm install -g @koalarx/nest-cli
koala-nest new meu-projeto

# Via npx
npx @koalarx/nest-cli new meu-projeto

# Via local (desenvolvimento)
bun run build:cli
node dist-cli/index.js new meu-projeto
```

## 🔨 Build

```bash
# Build da CLI
bun run build:cli

# Output em dist-cli/
# ├── index.js
# ├── commands/
# ├── example/           (template base)
# ├── templates/         (extras)
# ├── package.json
# ├── README.md
# └── LICENSE
```

## 📦 Dependências Compartilhadas

As seguintes dependências agora são compartilhadas:

- `chalk` - Cores no terminal
- `commander` - Parsing de CLI
- `inquirer` - Prompts interativas
- `shelljs` - Utilitários shell

Todas instaladas via `bun install` no root, reduzindo duplicação.

## 🔄 Workflow de Publicação

Quando publicar a CLI:

1. Versão é incrementada via `bun deploy:*`
2. Build é executado: `bun run build:cli`
3. Arquivos são publicados do `dist-cli/`
4. Template base é incluído automaticamente

## 📚 Melhorias Implementadas

✅ **Sem Duplicação de Código**
- Usa `apps/example` como template base
- Evita manutenção em dois lugares

✅ **Estrutura Modular**
- Templates separados em `templates/`
- Fácil adicionar novos templates

✅ **Build Otimizado**
- Script `build-cli.mjs` integrado
- Gera dist limpo e pronto para publicar

✅ **Dependências Centralizadas**
- Todas no `package.json` raiz
- Reduz tamanho final

✅ **Exemplo Incluído**
- Template base vem no pacote
- Funciona offline

## 🔮 Próximas Melhorias Possíveis

- [ ] Adicionar mais templates (starter, minimal, etc)
- [ ] Integrar com git (git init, git add, git commit)
- [ ] Gerar automaticamente variáveis de ambiente
- [ ] Suporte para diferentes bancos de dados
- [ ] CLI wizard para configuração inicial

## 📖 Documentação

- [README da CLI](../../apps/koala-nest-cli/README.md)
- [Repositório GitHub](https://github.com/igordrangel/koala-nest)
- [NPM Package](https://www.npmjs.com/package/@koalarx/nest-cli)
