# Koala Nest MCP Server

Servidor Model Context Protocol (MCP) que expõe a documentação completa do Koala Nest para assistentes de IA como GitHub Copilot, Claude Desktop, e outros clientes MCP compatíveis.

## 🚀 Instalação

### Via Koala CLI (Recomendado)

```bash
npx @koalarx/nest-cli mcp:install
```

Este comando irá configurar automaticamente o arquivo `mcp.json` no seu projeto com a configuração correta.

### Configuração Manual

Se preferir configurar manualmente, crie ou edite o arquivo `mcp.json` (ou `.vscode/mcp.json`) no seu projeto:

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

> **Nota:** O servidor será instalado automaticamente via NPM quando você iniciar seu cliente MCP.

## 📚 O que está incluído

O MCP Server expõe toda a documentação oficial do Koala Nest:

- ✅ Guia de Instalação
- ✅ Configuração Inicial
- ✅ Tratamento de Erros
- ✅ Features Avançadas
- ✅ Decoradores
- ✅ Guia do Bun
- ✅ Prisma Client
- ✅ Exemplos práticos
- ✅ CLI Integration

## 🔧 Como funciona

1. Seu cliente MCP (VS Code, Claude Desktop, etc.) lê o arquivo `mcp.json`
2. Quando necessário, executa `bunx @koalarx/mcp-server`
3. O NPM baixa e instala o servidor automaticamente
4. O servidor inicia e expõe a documentação via protocolo MCP
5. Assistentes de IA podem consultar a documentação em tempo real

## 🆚 Opções de Uso

### Opção 1: Via NPM (Atual)
```json
{
  "command": "bunx",
  "args": ["@koalarx/mcp-server"]
}
```
**Vantagens:** Sempre atualizado, sem instalação local, gerenciado pelo NPM

### Opção 2: Via Extensão VS Code
Instale a extensão oficial que gerencia tudo automaticamente:

**[📦 Koala Nest MCP Docs](https://marketplace.visualstudio.com/items?itemName=koalarx.koala-nest-mcp-docs)**

## 📖 Documentação

Para mais detalhes sobre MCP e integração, consulte:
- [Documentação Completa](https://github.com/igordrangel/koala-nest/tree/main/docs)
- [Guia de Integração CLI](https://github.com/igordrangel/koala-nest/blob/main/docs/10-cli-integration.md)

## 🤝 Contribuindo

Contribuições são bem-vindas! Veja nosso [repositório no GitHub](https://github.com/igordrangel/koala-nest).

## 📄 Licença

MIT License - veja LICENSE para detalhes.
