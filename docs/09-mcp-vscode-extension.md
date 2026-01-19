# 🤖 Extensão MCP para VS Code

A extensão **Koala Nest Documentation MCP** integra toda a documentação do Koala Nest diretamente no GitHub Copilot através do Model Context Protocol (MCP).

## 📦 Duas Formas de Usar

Você pode usar o MCP server de **duas formas diferentes**:

### 1️⃣ Via Extensão VS Code (Recomendado - Mais Fácil)

✅ Instalação com 1 clique  
✅ Funciona em qualquer workspace  
✅ Atualização automática via Marketplace  
✅ Zero configuração necessária

**[📦 Instalar Extensão](https://marketplace.visualstudio.com/items?itemName=koalarx.koala-nest-mcp-docs)**

### 2️⃣ Via Arquivo de Configuração (Avançado)

✅ Controle total sobre a configuração  
✅ Sem dependência de extensão  
✅ Ideal para projetos específicos  
✅ Pode usar versão customizada do server

Crie um arquivo `.vscode/mcp.json` no seu projeto (veja detalhes abaixo).

---

## 📦 Instalação - Método 1: Extensão VS Code

### Via VS Code Marketplace

1. Abra o VS Code
2. Vá até a aba de extensões (`Ctrl+Shift+X` ou `Cmd+Shift+X`)
3. Busque por **"Koala Nest Documentation MCP"**
4. Clique em **Instalar**

### Via Arquivo VSIX (Desenvolvimento)

Se você estiver testando uma versão em desenvolvimento:

```bash
# Clone o repositório
git clone https://github.com/igordrangel/koala-nest
cd koala-nest

# Instale as dependências
bun install

# Build e empacote a extensão
bun run build:mcp-all
bun run package:vscode-extension

# Instale manualmente
code --install-extension apps/mcp-vscode-extension/koala-nest-mcp-docs-*.vsix
```

---

## 📦 Instalação - Método 2: Arquivo de Configuração

Esta abordagem permite usar o MCP server sem instalar a extensão, através de um arquivo `.vscode/mcp.json`.

### Passo 1: Instalar o Koala Nest

```bash
npm install @koalarx/nest
# ou
bun add @koalarx/nest
```

### Passo 2: Criar arquivo `.vscode/mcp.json`

Crie o arquivo `.vscode/mcp.json` na raiz do seu projeto:

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

### Passo 3: Reiniciar o VS Code

```bash
# Ou use o Command Palette
Ctrl+Shift+P → "Developer: Reload Window"
```

### Alternativa: Configuração Global

Se você quer o MCP server disponível em **todos os seus projetos**, adicione ao settings do VS Code:

1. Abra Settings (`Ctrl+,`)
2. Busque por "MCP Servers"
3. Ou edite diretamente `settings.json`:

```json
{
  "mcp.servers": {
    "koala-nest-docs": {
      "command": "node",
      "args": [
        "/caminho/absoluto/para/node_modules/@koalarx/nest/mcp-server/server.js"
      ]
    }
  }
}
```

### Arquivo de Exemplo

O pacote `@koalarx/nest` inclui um arquivo de exemplo em:
```
node_modules/@koalarx/nest/mcp-server/mcp.json.example
```

Você pode copiá-lo e ajustar conforme necessário.

---

## ⚙️ Configuração

### Ativação Automática

A extensão é ativada automaticamente ao iniciar o VS Code. Você verá uma notificação confirmando que está ativa:

> 🚀 Koala Nest Documentation MCP extension is ready!

### Verificação

Para verificar se a extensão está funcionando:

1. Abra o **Output Panel** (`Ctrl+Shift+U` ou `View > Output`)
2. Selecione **"Koala Nest Documentation"** no dropdown
3. Você verá logs como:
   ```
   🚀 Extension "Koala Nest Documentation MCP" is now active!
   MCP Server path: /path/to/extension/dist/server.js
   ```

### Comando Manual

Você também pode ativar manualmente via Command Palette:

1. Abra o Command Palette (`Ctrl+Shift+P` ou `Cmd+Shift+P`)
2. Digite: **"Koala Nest: Open Documentation"**
3. Pressione Enter

## 🎯 Como Utilizar

### Com GitHub Copilot

A extensão funciona integrada ao GitHub Copilot. Basta fazer perguntas relacionadas ao Koala Nest:

#### Exemplos de Prompts

**Instalação e Configuração:**
```
Como instalar o Koala Nest?
Como configurar o Prisma no Koala Nest?
Mostre a configuração inicial do Koala Nest
```

**Criando Controllers:**
```
Como criar um controller no Koala Nest?
Exemplo de controller CRUD com Koala Nest
Como usar decoradores customizados no Koala Nest?
```

**Handlers e Validação:**
```
Como criar um request handler no Koala Nest?
Exemplo de validação com Zod no Koala Nest
Como fazer validação customizada?
```

**Repository e Database:**
```
Como criar um repository com Koala Nest?
Exemplo de repository com Prisma
Como fazer transações no Koala Nest?
Como usar o KoalaEntityBase?
```

**Jobs e Eventos:**
```
Como criar cron jobs no Koala Nest?
Exemplo de event handler
Como disparar eventos no Koala Nest?
```

**Tratamento de Erros:**
```
Quais são os erros disponíveis no Koala Nest?
Como criar erros customizados?
Como tratar exceções no Koala Nest?
```

**Features Avançadas:**
```
Como usar Redis no Koala Nest?
Como implementar RedLock?
Como fazer auto-mapping?
Como usar paginação?
```

### Documentação Disponível

O MCP Server expõe toda a documentação do Koala Nest:

- **00-cli-reference.md** - Referência da CLI
- **01-guia-instalacao.md** - Guia de instalação
- **02-configuracao-inicial.md** - Configuração inicial
- **04-tratamento-erros.md** - Tratamento de erros
- **05-features-avancadas.md** - Features avançadas (Redis, RedLock, Mapping, etc.)
- **06-decoradores.md** - Decoradores customizados
- **07-guia-bun.md** - Guia do Bun
- **08-prisma-client.md** - Prisma Client customizado
- **EXAMPLE.md** - Exemplo prático completo com CRUD

## 🔍 Verificando a Integração

### Output Channel

Para ver os logs do MCP Server:

1. Abra o Output Panel (`Ctrl+Shift+U`)
2. Selecione **"Koala Nest Documentation"**
3. Verifique se há mensagens de ativação

### GitHub Copilot

Quando você faz uma pergunta ao Copilot sobre Koala Nest:

1. O MCP Server é consultado automaticamente
2. A resposta incluirá informações da documentação oficial
3. Você receberá exemplos de código atualizados

## 🛠️ Desenvolvimento Local

### Estrutura do Projeto

```
koala-nest/
├── apps/
│   ├── mcp-server/           # MCP Server (Node.js)
│   │   ├── server.ts         # Servidor MCP principal
│   │   └── tsconfig.json
│   └── mcp-vscode-extension/ # Extensão VS Code
│       ├── src/
│       │   └── extension.ts  # Código da extensão
│       ├── package.json
│       └── tsconfig.json
└── docs/                     # Documentação servida pelo MCP
```

### Build e Teste Local

```bash
# Build do MCP Server
bun run build:mcp

# Build da extensão
bun run build:mcp-extension

# Build completo (server + extension)
bun run build:mcp-all

# Empacotar extensão
bun run package:vscode-extension
```

### Debug no VS Code

1. Abra o projeto no VS Code
2. Vá até o painel de Debug (`Ctrl+Shift+D`)
3. Selecione **"Extension (MCP Docs)"**
4. Pressione `F5`

Isso abrirá uma nova janela do VS Code com a extensão em modo de desenvolvimento.

### Testar o MCP Server Diretamente

```bash
# Executar o servidor MCP standalone
bun run start:mcp
```

## 📊 Recursos do MCP Server

O servidor MCP expõe os seguintes recursos:

### Tools (Ferramentas)

- **`get_documentation`** - Recupera documentação específica
  - Parâmetros: `topic` (string)
  - Retorna: Conteúdo markdown do documento

- **`search_documentation`** - Busca na documentação
  - Parâmetros: `query` (string)
  - Retorna: Resultados relevantes

- **`list_topics`** - Lista todos os tópicos disponíveis
  - Retorna: Array de tópicos da documentação

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

### Método 1: Problemas com Extensão

**Extensão não está ativa:**
1. Verifique se está instalada: `code --list-extensions | grep koala`
2. Reinstale: `code --install-extension koalarx.koala-nest-mcp-docs --force`
3. Recarregue: `Ctrl+Shift+P` → "Developer: Reload Window"
4. Verifique o Output Channel: `Ctrl+Shift+U` → "Koala Nest Documentation"

**MCP Server não responde:**
1. Verifique erros no Output Channel
2. Reinstale a extensão
3. Verifique se `dist/server.js` existe na pasta da extensão

### Método 2: Problemas com mcp.json

**Arquivo não é detectado:**
1. Verifique se o arquivo está em `.vscode/mcp.json` (não `vscode/mcp.json`)
2. Confirme que o caminho para `server.js` está correto
3. Verifique se `@koalarx/nest` está instalado: `ls node_modules/@koalarx/nest/mcp-server/`
4. Tente usar caminho absoluto ao invés de `${workspaceFolder}`
5. Verifique erros no Output Panel: `Ctrl+Shift+U` → selecione "MCP"
6. Reinicie completamente o VS Code (feche e abra)

**Exemplo de debug:**
```bash
# Verificar se o arquivo existe
ls -la .vscode/mcp.json

# Verificar se o server existe
ls -la node_modules/@koalarx/nest/mcp-server/server.js

# Testar o server manualmente
node node_modules/@koalarx/nest/mcp-server/server.js
```

### Qual método usar?

| Critério | Extensão | mcp.json |
|----------|----------|----------|
| **Facilidade** | ⭐⭐⭐⭐⭐ (1 clique) | ⭐⭐⭐ (requer configuração) |
| **Atualizações** | ⭐⭐⭐⭐⭐ (automáticas) | ⭐⭐ (manual) |
| **Controle** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ (controle total) |
| **Multi-projeto** | ⭐⭐⭐⭐⭐ (funciona em todos) | ⭐⭐⭐ (por projeto) |
| **Customização** | ⭐⭐ | ⭐⭐⭐⭐⭐ (totalmente customizável) |

**Recomendação:**
- 👉 **Use Extensão** para uso geral e simplicidade
- 👉 **Use mcp.json** para controle fino ou testes de desenvolvimento

### Erro ao instalar VSIX

**Problema:** `Error: ENOENT: no such file or directory`

**Solução:**
```bash
# Rebuild completo
bun run build:mcp-all
bun run package:vscode-extension

# Instale novamente
code --install-extension apps/mcp-vscode-extension/*.vsix --force
```

### GitHub Copilot não está integrado

**Problema:** O Copilot não consulta o MCP

**Solução:**
1. Certifique-se de ter o GitHub Copilot instalado e ativo
2. Verifique se você tem uma assinatura válida do Copilot
3. Reinicie o VS Code
4. A integração MCP requer VS Code versão 1.90.0 ou superior

## 📝 Contribuindo

Para contribuir com a extensão:

1. Fork o repositório
2. Crie uma branch para sua feature
3. Faça suas alterações
4. Teste localmente com `F5`
5. Crie um Pull Request

### Adicionando Nova Documentação

Para adicionar novos documentos ao MCP:

1. Crie o arquivo markdown em `/docs`
2. O MCP Server automaticamente o detectará
3. Rebuild o projeto: `bun run build:mcp-all`
4. Teste com o Copilot

## 🔗 Links Úteis

- [Repositório GitHub](https://github.com/igordrangel/koala-nest)
- [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=koalarx.koala-nest-mcp-docs)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [GitHub Copilot](https://github.com/features/copilot)

## 📄 Licença

Esta extensão é parte do projeto Koala Nest e usa a mesma licença do projeto principal.

---

**💡 Dica:** Use o MCP para acelerar seu desenvolvimento! O Copilot terá acesso a toda a documentação oficial do Koala Nest, fornecendo respostas mais precisas e exemplos atualizados.
