# 🤖 Koala Nest Documentation MCP

> Extensão VS Code que configura automaticamente o **Koala Nest MCP Server** para integrar toda a documentação do framework diretamente no **GitHub Copilot** e outros clientes MCP.

[![Version](https://img.shields.io/visual-studio-marketplace/v/koalarx.koala-nest-mcp-docs)](https://marketplace.visualstudio.com/items?itemName=koalarx.koala-nest-mcp-docs)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/koalarx.koala-nest-mcp-docs)](https://marketplace.visualstudio.com/items?itemName=koalarx.koala-nest-mcp-docs)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/koalarx.koala-nest-mcp-docs)](https://marketplace.visualstudio.com/items?itemName=koalarx.koala-nest-mcp-docs)

## ✨ O que faz?

Esta extensão **configura automaticamente** o arquivo `mcp.json` no seu workspace para usar o servidor MCP do Koala Nest via NPM. O servidor expõe toda a documentação oficial para assistentes de IA como GitHub Copilot, Claude Desktop, e outros.

### Documentação Disponível

- ✅ Guias de instalação e configuração
- ✅ Exemplos práticos de código
- ✅ Referências de APIs e decoradores
- ✅ Tutoriais de features avançadas
- ✅ Padrões de arquitetura DDD
- ✅ Integração com Prisma
- ✅ Tratamento de erros
- ✅ CLI Reference

## 🚀 Como Funciona

1. **Instala a extensão** - Configuração automática
2. **Abre um workspace** - A extensão detecta e configura
3. **Usa seu cliente MCP** - Copilot, Claude Desktop, etc.
4. **Acessa documentação** - Via comandos MCP

### O que a extensão faz

- 🔧 Cria/atualiza o arquivo `mcp.json` ou `.vscode/mcp.json`
- 📦 Configura para usar `bunx @koalarx/mcp-server` (sempre atualizado)
- ✅ Zero manutenção - o NPM gerencia atualizações automaticamente

### Configuração Criada

```json
{
  "mcpServers": {
    "koala-nest-docs": {
      "command": "bunx",
      "args": ["@koalarx/mcp-server"]
    }
  }
}
```

## 📦 Instalação

### Via VS Code Marketplace (Recomendado)

**[📦 Instalar Agora](https://marketplace.visualstudio.com/items?itemName=koalarx.koala-nest-mcp-docs)**

Ou busque no VS Code:

1. Pressione `Ctrl+Shift+X` (Windows/Linux) ou `Cmd+Shift+X` (Mac)
2. Busque por **"Koala Nest Documentation MCP"**
3. Clique em **Instalar**
4. Abra um workspace - configuração automática!

### Via Linha de Comando

```bash
code --install-extension koalarx.koala-nest-mcp-docs
```

## 🎯 Uso

### Primeira Instalação

1. **Instale a extensão**
2. **Abra um workspace** (qualquer projeto)
3. **A extensão configura automaticamente** o `mcp.json`
4. **Pronto!** O servidor será instalado via NPM quando necessário

### Comandos Disponíveis

Acesse via Command Palette (`Ctrl+Shift+P` ou `Cmd+Shift+P`):

- **`Koala Nest: Open Documentation`** - Informações sobre o MCP
- **`Koala Nest: Reconfigure MCP Server`** - Reconfigurar se necessário

### Usando com GitHub Copilot

Faça perguntas normalmente no Copilot Chat:

> "Como criar um controller CRUD no Koala Nest?"
> 
> "Mostre exemplo de tratamento de erros com Koala Nest"
> 
> "Como configurar Prisma no Koala Nest?"

O Copilot terá acesso à documentação oficial e responderá com informações precisas!

## 🆚 Alternativas

### Opção 1: Esta Extensão (Recomendado para VS Code)

✅ Configuração automática  
✅ Interface gráfica  
✅ Funciona em qualquer workspace

### Opção 2: Via Koala CLI

```bash
npx @koalarx/nest-cli mcp:install
```

✅ Configuração via linha de comando  
✅ Funciona sem extensão  
✅ Ideal para automação

### Opção 3: Configuração Manual

Crie `.vscode/mcp.json` manualmente (veja configuração acima)

✅ Controle total  
✅ Sem dependências

## 🔧 Como Atualizar

**Não precisa fazer nada!** O servidor é executado via `bunx @koalarx/mcp-server`, que sempre usa a versão mais recente publicada no NPM.

Se quiser fixar uma versão específica, edite o `mcp.json`:

```json
{
  "mcpServers": {
    "koala-nest-docs": {
      "command": "bunx",
      "args": ["@koalarx/mcp-server@1.0.10"]
    }
  }
}
```

## 🐛 Troubleshooting

### Extensão não configura automaticamente

1. Certifique-se de ter um **workspace aberto** (não apenas arquivos soltos)
2. Verifique as permissões de escrita no diretório do workspace
3. Execute manualmente: `Koala Nest: Reconfigure MCP Server`

### Servidor não inicia

1. Verifique se `bunx` está instalado:
   ```bash
   bunx --version
   ```

2. Teste manualmente:
   ```bash
   bunx @koalarx/mcp-server
   ```

3. Verifique os logs no Output panel (`Koala Nest Documentation`)

### Documentação não aparece no Copilot

1. **Reinicie o VS Code**
2. Verifique se o `mcp.json` foi criado
3. Confirme que o Copilot está ativo

## 📚 Mais Informações

- **Documentação Completa**: [docs/](https://github.com/igordrangel/koala-nest/tree/main/docs)
- **Guia MCP**: [09-mcp-vscode-extension.md](https://github.com/igordrangel/koala-nest/blob/main/docs/09-mcp-vscode-extension.md)
- **Repositório**: [github.com/igordrangel/koala-nest](https://github.com/igordrangel/koala-nest)
- **Issues**: [Reportar Problemas](https://github.com/igordrangel/koala-nest/issues)

## 🤝 Contribuindo

Contribuições são bem-vindas! Veja o [repositório principal](https://github.com/igordrangel/koala-nest) para detalhes.

## 📄 Licença

MIT License - veja [LICENSE](https://github.com/igordrangel/koala-nest/blob/main/LICENSE) para detalhes.

---

**Desenvolvido com ❤️ por [Igor D. Rangel](https://github.com/igordrangel)**
