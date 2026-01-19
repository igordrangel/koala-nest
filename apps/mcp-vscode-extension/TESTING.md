# Guia de Teste Local da Extensão MCP

Este guia explica como testar a extensão MCP localmente antes de publicá-la.

## Pré-requisitos

- VS Code instalado
- Projeto Koala Nest clonado
- Bun instalado (`bun --version`)

## 1. Setup Inicial

Na raiz do projeto Koala Nest:

```bash
# Instalar dependências do monorepo
bun install

# Compilar a extensão
bun run build:mcp-extension
```

## 2. Executar a Extensão em Modo de Desenvolvimento

### Opção A: Via Launch Configuration (Recomendado)

Na raiz do projeto:

1. Pressione **F5** ou vá em **Run → Start Debugging**
2. Selecione **"Extension (MCP Docs)"** na dropdown
3. Uma nova janela do VS Code abrirá com a extensão carregada

A extensão irá:
- Mostrar uma mensagem de boas-vindas ao ativar
- Registrar um comando disponível via Command Palette: `Koala Nest: Open Documentation`
- Criar um output channel "Koala Nest Documentation" com logs da extensão

### Opção B: Teste Manual na Pasta da Extensão

```bash
cd apps/mcp-vscode-extension
code .
```

Dentro do VS Code:
- Pressione **F5** para iniciar o debug
- Uma nova janela abrirá com a extensão

## 3. Verificar se a Extensão Está Ativa

Na janela de teste do VS Code:

1. Abra a **Command Palette** (`Ctrl+Shift+P` ou `Cmd+Shift+P`)
2. Digite "Koala Nest" e procure por **"Koala Nest: Open Documentation"**
3. Se o comando aparecer, a extensão está ativa ✅

Ou verifique no painel de **Output** → selecione "Koala Nest Documentation" para ver os logs.

## 4. Testar Comandos

Execute qualquer um destes comandos pela Command Palette:

- **"Koala Nest: Open Documentation"** - Abre a documentação (mostra mensagem de informação)

## 5. Empacotar e Instalar a Extensão

Para criar um arquivo `.vsix` para distribuição:

```bash
cd apps/mcp-vscode-extension

# Instalar vsce globalmente (se necessário)
bun add -g @vscode/vsce

# Empacotar
vsce package

# Isso cria: koala-libs-mcp-docs-1.0.0.vsix
```

Para instalar localmente:

```bash
code --install-extension ./koala-libs-mcp-docs-1.0.0.vsix
```

## 6. Troubleshooting

### Extensão não aparece nas abas

- Verifique se há erros no **Output → Extension Host**
- Certifique-se de que o build foi executado: `bun run build:mcp-extension`
- Tente fechar todas as janelas do VS Code e reiniciar

### Comandos não funcionam

- Abra a **Command Palette** e execute "Developer: Show Running Extensions"
- Procure por "koala-libs-mcp-docs" na lista
- Se não estiver na lista, clique em **Watch** para ver logs em tempo real

### Servidor MCP não inicia

- Verifique se o arquivo `dist/server.js` existe
- Tente executar manualmente: `node apps/mcp-vscode-extension/dist/server.js`
- Verifique se há erros no Output channel "Koala Nest Documentation"


## 3. Verificar Instalação

Na janela de teste do VS Code:

1. Pressione `Ctrl+Shift+X` (Extensions)
2. Procure por "Koala Nest"
3. Deve aparecer como instalado

## 4. Testar com GitHub Copilot

Para testar o MCP Server com o GitHub Copilot:

### Verificar se o MCP está carregado

1. Abra o **Output** panel (`Ctrl+Shift+U`)
2. Selecione **"Koala Nest Documentation"** no dropdown
3. Você deve ver a mensagem: `🚀 Extension "Koala Nest Documentation MCP" is now active!`

### Verificar MCP Servers disponíveis

O VS Code com Copilot deve reconhecer o servidor MCP automaticamente. Para confirmar:

1. Abra o painel de Chat do Copilot
2. No canto superior direito, clique no ícone de configurações ou na lista de ferramentas disponíveis
3. Procure por **"Koala Nest Documentation"** na lista de MCP servers

### Fazer perguntas usando o MCP

1. Abra o painel de Chat do Copilot
2. Faça uma pergunta específica sobre a documentação:
   ```
   @koala-nest-docs Como usar decoradores no Koala Nest?
   ```
   
   Ou simplesmente:
   ```
   Como configurar o Prisma no Koala Nest?
   ```

3. O Copilot deve consultar a documentação do Koala Nest através do MCP server
4. Você verá logs no Output channel mostrando as ferramentas sendo chamadas

**Nota:** Se o Copilot não reconhecer automaticamente o MCP server, pode ser necessário:
- Reiniciar completamente o VS Code
- Verificar se a extensão do GitHub Copilot suporta MCP servers (versão recente)
- Verificar nas configurações do Copilot se MCP servers estão habilitados

## 5. Debug

Se algo não funcionar, verifique:

### Logs da Extensão

1. Pressione `Ctrl+Shift+U` para abrir Output panel
2. No dropdown, selecione "Koala Nest Documentation"
3. Veja se há mensagens de erro

### Teste Manual do Servidor

```bash
# Terminal na raiz do projeto
node apps/mcp-server/dist/server.js
```

Se o servidor iniciar, você verá:
```
Koala Libs MCP Server running on stdio
```

Pressione `Ctrl+C` para sair.

## 6. Testar Funcionalidades

### Teste 1: Listar Recursos

Na conversa com Claude, peça:
```
Quais são os arquivos de documentação disponíveis?
```

Deve listar:
- README.md
- Todos os arquivos em docs/

### Teste 2: Buscar na Documentação

Peça:
```
Busque por "Prisma" na documentação
```

Deve retornar resultados encontrados no arquivo 08-prisma-client.md

### Teste 3: Ler Documentação

Peça:
```
O que fala sobre decoradores no Koala Nest?
```

Deve extrair informações do arquivo 06-decoradores.md

## 7. Problemas Comuns

### "Extensão não inicia"
- Verifique se o build foi realizado: `bun run build:mcp-all`
- Verifique se os arquivos estão em `apps/mcp-vscode-extension/dist/`

### "Servidor não responde"
- Verifique se `server.js` foi copiado para `dist/`
- Teste manualmente: `node apps/mcp-server/dist/server.js`

### "Claude não consegue acessar documentação"
- Verifique se Claude está configurado para suportar MCP
- Tente desinstalar e reinstalar a extensão

## 8. Desinstalação

Para desinstalar a extensão de teste:

```bash
code --uninstall-extension koalarx.koala-libs-mcp-docs
```

## 9. Próximos Passos

Depois de testar com sucesso localmente:

1. Commit das mudanças
2. Seguir [PUBLISHING_GUIDE.md](../PUBLISHING_GUIDE.md) para publicar

## Referências

- [VS Code Extension Development](https://code.visualstudio.com/api)
- [vsce Documentation](https://github.com/microsoft/vscode-vsce)
- [MCP Protocol](https://modelcontextprotocol.io)
