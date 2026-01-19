# 🤖 Koala Nest Documentation MCP

> Extensão VS Code que integra toda a documentação do **Koala Nest** diretamente no **GitHub Copilot** através do Model Context Protocol (MCP).

[![Version](https://img.shields.io/visual-studio-marketplace/v/koalarx.koala-libs-mcp-docs)](https://marketplace.visualstudio.com/items?itemName=koalarx.koala-libs-mcp-docs)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/koalarx.koala-libs-mcp-docs)](https://marketplace.visualstudio.com/items?itemName=koalarx.koala-libs-mcp-docs)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/koalarx.koala-libs-mcp-docs)](https://marketplace.visualstudio.com/items?itemName=koalarx.koala-libs-mcp-docs)

## ✨ O que é isso?

Esta extensão conecta o **GitHub Copilot** à documentação oficial do Koala Nest usando o **Model Context Protocol (MCP)**. Isso significa que o Copilot terá acesso instantâneo a:

- ✅ Guias de instalação e configuração
- ✅ Exemplos práticos de código
- ✅ Referências de APIs e decoradores
- ✅ Tutoriais de features avançadas
- ✅ Padrões de arquitetura DDD

> **💡 Alternativa:** Você também pode usar o MCP server sem instalar esta extensão, criando um arquivo `.vscode/mcp.json` no seu projeto. [Saiba mais](https://github.com/igordrangel/koala-nest/blob/main/docs/09-mcp-vscode-extension.md#-instala%C3%A7%C3%A3o---m%C3%A9todo-2-arquivo-de-configura%C3%A7%C3%A3o).

## 🚀 Como Funciona

1. **Instale a extensão** - Uma única vez
2. **Use o Copilot normalmente** - Faça perguntas sobre Koala Nest
3. **Receba respostas precisas** - Baseadas na documentação oficial

### Exemplo

**Você pergunta:**
> "Como criar um controller CRUD no Koala Nest?"

**O Copilot responde com:**
- Código de exemplo atualizado
- Explicação baseada na documentação oficial
- Melhores práticas do framework

## 📦 Instalação

### Via VS Code Marketplace (Recomendado)

**[📦 Instalar Agora](https://marketplace.visualstudio.com/items?itemName=koalarx.koala-libs-mcp-docs)**

Ou busque no VS Code:

1. Abra o VS Code
2. Pressione `Ctrl+Shift+X` (Windows/Linux) ou `Cmd+Shift+X` (Mac)
3. Busque por **"Koala Nest Documentation MCP"**
4. Clique em **Instalar**

### Via Linha de Comando

```bash
code --install-extension koalarx.koala-libs-mcp-docs
```

## 🎯 Como Usar

### Com GitHub Copilot

Após instalar, basta usar o Copilot normalmente. Faça perguntas sobre o Koala Nest:

```
💬 "Como instalar o Koala Nest?"
💬 "Exemplo de controller com validação"
💬 "Como criar um repository no Koala Nest?"
💬 "Como usar Redis no Koala Nest?"
💬 "Exemplo completo de CRUD"
```

O Copilot automaticamente consultará a documentação oficial para fornecer respostas precisas!

### Comando Manual

Você também pode abrir a documentação manualmente:

1. Pressione `Ctrl+Shift+P` (Windows/Linux) ou `Cmd+Shift+P` (Mac)
2. Digite: **"Koala Nest: Open Documentation"**
3. Pressione Enter

## 📚 Documentação Disponível

A extensão dá acesso a toda documentação oficial:

- **CLI Reference** - Comandos e referências da CLI
- **Guia de Instalação** - Como começar com Koala Nest
- **Configuração Inicial** - Setup do projeto
- **Tratamento de Erros** - Sistema de exceções
- **Features Avançadas** - Redis, Jobs, Eventos, Paginação
- **Decoradores** - @IsPublic, @Upload, @Cookies
- **Guia Bun** - Runtime JavaScript ultra-rápido
- **Prisma Client** - ORM integrado
- **Exemplo Completo** - CRUD com todas as camadas DDD

## 🔍 Verificação

### Confirmar que está Ativa

1. Abra o **Output Panel**: `Ctrl+Shift+U` (ou `View > Output`)
2. Selecione **"Koala Nest Documentation"** no dropdown
3. Você verá:
   ```
   🚀 Extension "Koala Nest Documentation MCP" is now active!
   ```

### Testar com Copilot

Abra qualquer arquivo TypeScript e pergunte ao Copilot:
```
Como criar um handler no Koala Nest?
```

Se a extensão estiver funcionando, o Copilot usará a documentação oficial na resposta.

## ⚙️ Configuração

A extensão funciona automaticamente após a instalação. Não requer configuração adicional!

### Requisitos

- ✅ VS Code 1.90.0 ou superior
- ✅ GitHub Copilot (assinatura ativa)
- ✅ Node.js (instalado automaticamente com o VS Code)

## 🛠️ Para Desenvolvedores

### Build Local

Se você quiser contribuir ou testar localmente:

```bash
# Clone o repositório
git clone https://github.com/igordrangel/koala-nest
cd koala-nest

# Instale dependências
bun install

# Build do MCP Server
bun run build:mcp

# Build da extensão
bun run build:mcp-extension

# Empacote a extensão
bun run package:vscode-extension

# Instale localmente
code --install-extension apps/mcp-vscode-extension/*.vsix
```

### Debug no VS Code

1. Abra o projeto no VS Code
2. Vá até a aba **Run and Debug** (`Ctrl+Shift+D`)
3. Selecione **"Extension (MCP Docs)"**
4. Pressione `F5`

Uma nova janela do VS Code será aberta com a extensão em modo de desenvolvimento.

## 🏗️ Arquitetura

```
apps/
├── mcp-server/              # MCP Server (Node.js)
│   ├── server.ts           # Implementação do protocolo MCP
│   └── dist/server.js      # Compilado
│
└── mcp-vscode-extension/   # Extensão VS Code
    ├── src/extension.ts    # Ativação da extensão
    ├── dist/
    │   ├── extension.js    # Extensão compilada
    │   └── server.js       # MCP Server (copiado)
    └── package.json        # Manifest da extensão
```

### Fluxo

1. **Usuário instala a extensão** → VS Code carrega `extension.js`
2. **Extension.ts ativa** → Registra o MCP Server no VS Code
3. **Copilot consulta MCP** → Server retorna documentação relevante
4. **Copilot responde** → Com base na documentação oficial

## 📖 Recursos do MCP Server

### Tools (Ferramentas)

- **`get_documentation`** - Recupera documentação específica
- **`search_documentation`** - Busca por termos na documentação
- **`list_topics`** - Lista todos os tópicos disponíveis

### Resources (Recursos)

Todos os arquivos markdown da pasta `/docs`:

- `docs://00-cli-reference`
- `docs://01-guia-instalacao`
- `docs://02-configuracao-inicial`
- `docs://04-tratamento-erros`
- `docs://05-features-avancadas`
- `docs://06-decoradores`
- `docs://07-guia-bun`
- `docs://08-prisma-client`
- `docs://EXAMPLE`
- `docs://README`

## 🐛 Troubleshooting

### Extensão não está ativa

**Solução:**
```bash
# Verificar se está instalada
code --list-extensions | grep koala

# Reinstalar
code --install-extension koalarx.koala-libs-mcp-docs --force

# Recarregar VS Code
Ctrl+Shift+P → "Developer: Reload Window"
```

### Copilot não usa a documentação

**Possíveis causas:**
1. Certifique-se de ter o **GitHub Copilot instalado e ativo**
2. Verifique se tem uma **assinatura válida do Copilot**
3. Reinicie o VS Code
4. A integração MCP requer **VS Code 1.90.0+**

### Ver logs de erro

1. `Ctrl+Shift+U` → Abrir Output Panel
2. Selecionar **"Koala Nest Documentation"**
3. Verificar mensagens de erro

## 🤝 Contribuindo

Contribuições são bem-vindas!

1. Fork o [repositório](https://github.com/igordrangel/koala-nest)
2. Crie uma branch: `git checkout -b feature/minha-feature`
3. Faça suas alterações
4. Teste localmente com `F5`
5. Commit: `git commit -m 'feat: minha nova feature'`
6. Push: `git push origin feature/minha-feature`
7. Abra um Pull Request

## 📄 Licença

Esta extensão faz parte do projeto **Koala Nest** e usa a mesma licença.

## 🔗 Links

- [📦 VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=koalarx.koala-libs-mcp-docs)
- [📖 Documentação Completa](https://github.com/igordrangel/koala-nest/blob/main/docs/09-mcp-vscode-extension.md)
- [🐙 Repositório GitHub](https://github.com/igordrangel/koala-nest)
- [📚 Koala Nest no NPM](https://www.npmjs.com/package/@koalarx/nest)
- [🤖 Model Context Protocol](https://modelcontextprotocol.io/)

---

**💡 Dica:** Quanto mais você usa, mais o Copilot aprende sobre seus padrões de desenvolvimento com Koala Nest!

**⭐ Se esta extensão te ajudou, deixe uma avaliação no Marketplace!**
   ```bash
   cd apps/mcp-vscode-extension
   vsce publish
   ```

## Requisitos

- VS Code 1.90.0+
- Node.js 20.0.0+

## Licença

UNLICENSED
