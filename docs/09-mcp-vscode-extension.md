# 🤖 MCP Server - Model Context Protocol

O **Koala Nest MCP Server** expõe toda a documentação do framework para assistentes de IA através do Model Context Protocol (MCP), permitindo que ferramentas como GitHub Copilot, Claude Desktop e outros clientes MCP acessem a documentação em tempo real.

## 📦 Formas de Uso

Existem **duas formas principais** de usar o MCP Server:

### 1️⃣ Via NPM (Recomendado - Mais Simples)

✅ Sempre atualizado  
✅ Sem instalação local  
✅ Gerenciado automaticamente pelo NPM  
✅ Zero manutenção

**Instalação via CLI:**
```bash
npx @koalarx/nest-cli mcp:install
```

Ou configure manualmente criando/editando `mcp.json` ou `.vscode/mcp.json`:

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

### 2️⃣ Via Extensão VS Code (Alternativa)

✅ Interface gráfica  
✅ Funciona em qualquer workspace  
✅ Gerenciamento visual

**[📦 Instalar Extensão](https://marketplace.visualstudio.com/items?itemName=koalarx.koala-nest-mcp-docs)**

---

## 🚀 Instalação Rápida

### Usando Koala CLI

```bash
# Instalar Koala CLI globalmente
npm install -g @koalarx/nest-cli

# Configurar MCP no projeto atual
koala-nest mcp:install
```

O comando irá:
1. Procurar por um arquivo `mcp.json` existente no projeto
2. Se encontrar, adicionar a configuração do Koala Nest
3. Se não encontrar, perguntar se deseja criar um novo
4. Configurar com `bunx @koalarx/mcp-server` (sempre atualizado via NPM)

### Configuração Manual

Crie ou edite o arquivo `mcp.json` na raiz do projeto ou em `.vscode/mcp.json`:

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

---

## 📚 Documentação Disponível

O MCP Server expõe todos os guias oficiais do Koala Nest:

- **00-cli-reference.md** - Referência completa da CLI
- **01-guia-instalacao.md** - Guia de instalação
- **02-configuracao-inicial.md** - Configuração inicial
- **04-tratamento-erros.md** - Sistema de tratamento de erros
- **05-features-avancadas.md** - Features avançadas
- **06-decoradores.md** - Decoradores disponíveis
- **07-guia-bun.md** - Uso com Bun
- **08-prisma-client.md** - Integração com Prisma
- **09-mcp-vscode-extension.md** - Este guia
- **10-cli-integration.md** - Integração CLI
- **EXAMPLE.md** - Exemplo completo
- **README.md** - Visão geral do projeto

---

## 🔧 Como Funciona

1. **Seu cliente MCP** (VS Code, Claude Desktop, etc.) lê o arquivo `mcp.json`
2. **Quando necessário**, executa o comando configurado (`bunx @koalarx/mcp-server`)
3. **NPM/Bun baixa** e instala o servidor automaticamente (se não estiver em cache)
4. **O servidor inicia** e expõe a documentação via protocolo MCP
5. **Assistentes de IA** podem consultar a documentação em tempo real

### Vantagens do Modelo NPM

- ✅ **Sempre atualizado**: Cada execução usa a versão mais recente publicada
- ✅ **Zero manutenção**: Não precisa atualizar manualmente
- ✅ **Sem instalação local**: Não ocupa espaço permanente no disco
- ✅ **Cache automático**: NPM/Bun fazem cache para execuções rápidas
- ✅ **Versionamento**: Pode fixar versões específicas se necessário

---

## 🎯 Uso com Diferentes Clientes

### GitHub Copilot (VS Code)

1. Configure o `mcp.json` como mostrado acima
2. Reinicie o VS Code
3. O Copilot terá acesso automático à documentação do Koala Nest

### Claude Desktop

Adicione ao arquivo de configuração do Claude (`~/Library/Application Support/Claude/claude_desktop_config.json` no macOS):

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

### Outros Clientes MCP

Qualquer cliente que suporte o Model Context Protocol pode usar o servidor. Consulte a documentação específica do seu cliente para configurar servidores MCP customizados.

---

## 🔍 Verificando se Está Funcionando

### Via VS Code

1. Abra o Output panel (`Ctrl+Shift+U` ou `Cmd+Shift+U`)
2. Selecione "MCP Servers" no dropdown
3. Você deverá ver logs do servidor Koala Nest

### Via Terminal

Teste manualmente:

```bash
# Executar o servidor diretamente
bunx @koalarx/mcp-server

# Você deverá ver:
# Koala Nest MCP Server running on stdio
# 📚 README carregado de: ...
# 📂 Encontrados 12 arquivos em: ...
# ✅ 12 recursos de documentação carregados
```

---

## 🆚 Comparação: NPM vs Extensão VS Code

| Característica | Via NPM (`bunx`) | Via Extensão VS Code |
|---------------|------------------|----------------------|
| Instalação | Configurar mcp.json | 1 clique no marketplace |
| Atualizações | Automáticas (sempre latest) | Manuais ou via extensão |
| Compatibilidade | Qualquer cliente MCP | Apenas VS Code |
| Configuração | Arquivo JSON | Interface gráfica |
| Manutenção | Zero | Baixa |
| Versionamento | Pode fixar versões | Versão da extensão |
| **Recomendação** | ✅ **Recomendado** | Alternativa válida |

---

## 🛠️ Opções Avançadas

### Fixar Versão Específica

Se precisar de uma versão específica do servidor:

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

### Usar Node em Vez de Bunx

Se preferir usar Node diretamente:

```json
{
  "mcpServers": {
    "koala-nest-docs": {
      "command": "npx",
      "args": ["@koalarx/mcp-server"]
    }
  }
}
```

---

## 🐛 Troubleshooting

### Servidor não inicia

1. **Verifique se bunx está instalado**:
   ```bash
   bunx --version
   ```

2. **Teste o servidor manualmente**:
   ```bash
   bunx @koalarx/mcp-server
   ```

3. **Verifique os logs** no Output panel do VS Code (MCP Servers)

### Documentação não aparece

1. **Reinicie o cliente MCP** (VS Code, Claude Desktop, etc.)
2. **Verifique a sintaxe** do arquivo `mcp.json`
3. **Confirme o caminho** do arquivo mcp.json (raiz do projeto ou `.vscode/`)

### Erros de permissão

```bash
# Dar permissões ao bunx
chmod +x $(which bunx)
```

---

## 📖 Recursos Adicionais

- **Documentação Completa**: [docs/](https://github.com/igordrangel/koala-nest/tree/main/docs)
- **Exemplos**: [docs/EXAMPLE.md](https://github.com/igordrangel/koala-nest/blob/main/docs/EXAMPLE.md)
- **CLI Reference**: [docs/00-cli-reference.md](https://github.com/igordrangel/koala-nest/blob/main/docs/00-cli-reference.md)
- **Repositório**: [github.com/igordrangel/koala-nest](https://github.com/igordrangel/koala-nest)

---

## 🤝 Contribuindo

Encontrou um problema ou tem uma sugestão? Abra uma issue no [repositório do GitHub](https://github.com/igordrangel/koala-nest/issues).

---

## 📄 Licença

MIT License - veja [LICENSE](https://github.com/igordrangel/koala-nest/blob/main/LICENSE) para detalhes.
