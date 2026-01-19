# Guia de Teste Local da Extensão MCP

Este guia explica como testar a extensão MCP localmente antes de publicá-la.

## Pré-requisitos

- VS Code instalado
- Projeto Koala Nest clonado
- Node.js/Bun instalado

## 1. Build da Extensão

Na raiz do projeto:

```bash
bun run build:mcp-all
```

Isso irá:
- Compilar o servidor MCP
- Compilar a extensão VS Code
- Copiar o servidor para a pasta dist da extensão

## 2. Abrir VS Code em Modo de Teste

Existem duas formas de testar:

### Opção A: Teste na Pasta da Extensão

```bash
cd apps/mcp-vscode-extension
code .
```

Dentro do VS Code:
- Pressione **F5** ou vá em **Run → Start Debugging**
- Uma nova janela do VS Code abrirá com a extensão instalada

### Opção B: Instalar Extensão Localmente

```bash
cd apps/mcp-vscode-extension

# Empacotar extensão
npx vsce package

# Isso cria um arquivo: koala-libs-mcp-docs-1.0.0.vsix

# Instalar no VS Code
code --install-extension ./koala-libs-mcp-docs-1.0.0.vsix
```

## 3. Verificar Instalação

Na janela de teste do VS Code:

1. Pressione `Ctrl+Shift+X` (Extensions)
2. Procure por "Koala Nest"
3. Deve aparecer como instalado

## 4. Testar com Claude

Se tiver Claude instalado no VS Code:

1. Abra o painel de Chat
2. A documentação do Koala Nest estará disponível automaticamente
3. Faça uma pergunta sobre o Koala Nest:
   ```
   Como usar decoradores no Koala Libs?
   ```

4. Claude deve responder com a documentação correta

## 5. Debug

Se algo não funcionar, verifique:

### Logs da Extensão

1. Pressione `Ctrl+Shift+U` para abrir Output panel
2. No dropdown, selecione "Koala Libs Documentation MCP"
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
O que fala sobre decoradores no Koala Libs?
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
