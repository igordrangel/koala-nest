# Koala Nest Documentation MCP

Este é um servidor Model Context Protocol (MCP) que expõe a documentação do Koala Nest para assistentes de IA como Claude no VS Code.

## Recursos

- **Acesso à Documentação**: Todos os arquivos `.md` da pasta `docs/` e o `README.md` raiz
- **Busca em Documentação**: Ferramenta para buscar por termos específicos
- **Listagem de Recursos**: Visualizar todos os arquivos de documentação disponíveis

## Instalação

### Via VS Code Marketplace

1. Abra o VS Code
2. Vá para Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Busque por "Koala Nest Documentation MCP"
4. Clique em "Install"

### Local (Desenvolvimento)

1. Clone o repositório
2. Navegue até a pasta da extensão: `apps/mcp-vscode-extension`
3. Instale as dependências: `bun install`
4. Compile: `bun run build`
5. Pressione F5 para abrir uma janela de VS Code com a extensão em teste

## Uso

Após instalar a extensão, a documentação estará automaticamente disponível para o Claude e outros assistentes de IA no VS Code que suportam MCP.

### Funcionalidades Disponíveis

**Recursos (Recursos)**:
- Acesso direto a todos os arquivos de documentação
- Cada arquivo pode ser lido integralmente

**Ferramentas**:
- `search_documentation`: Busca por termos em toda a documentação
- `list_documentation_files`: Lista todos os arquivos disponíveis

## Arquitetura

- **Servidor MCP** (`apps/mcp-server/server.ts`): Implementação do protocolo MCP usando TypeScript puro
- **Extensão VSCode** (`apps/mcp-vscode-extension`): Interface que entrega o servidor MCP ao VS Code

## Desenvolvimento

### Build

```bash
# Build do servidor MCP
bun run build:mcp

# Build da extensão
bun run build:extension

# Build de ambos
bun run build:mcp-all
```

### Teste Local

```bash
# Executar servidor em modo desenvolvimento
cd apps/mcp-server
bun run dev
```

## Publicação na Marketplace

1. Configure suas credenciais no VS Code:
   ```bash
   npm install -g @vscode/vsce
   vsce login
   ```

2. Incremente a versão em `apps/mcp-vscode-extension/package.json`

3. Publique:
   ```bash
   cd apps/mcp-vscode-extension
   vsce publish
   ```

## Requisitos

- VS Code 1.90.0+
- Node.js 20.0.0+

## Licença

UNLICENSED
