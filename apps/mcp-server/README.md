# Koala Nest MCP Server

Este é o servidor Model Context Protocol (MCP) que expõe a documentação do Koala Nest para assistentes de IA.

## Uso via Arquivo de Configuração

Se você instalou `@koalarx/nest` no seu projeto, pode usar o MCP server sem instalar a extensão VS Code.

### 1. Criar arquivo `.vscode/mcp.json`

Copie o arquivo `mcp.json.example` ou crie manualmente:

```json
{
  "mcpServers": {
    "koala-nest-docs": {
      "command": "node",
      "args": [
        "${workspaceFolder}/node_modules/@koalarx/nest/mcp-server/server.js"
      ],
      "env": {}
    }
  }
}
```

### 2. Reiniciar VS Code

O VS Code detectará automaticamente o arquivo e iniciará o MCP server.

### 3. Usar com Copilot

Agora o GitHub Copilot terá acesso à documentação oficial do Koala Nest!

## Uso via Extensão VS Code

Para uma experiência mais simples, instale a extensão oficial:

**[📦 Instalar Extensão](https://marketplace.visualstudio.com/items?itemName=koalarx.koala-libs-mcp-docs)**

## Documentação Completa

Veja a documentação completa em:
- [Guia MCP](../../docs/09-mcp-vscode-extension.md)
- [Repositório GitHub](https://github.com/igordrangel/koala-nest)
