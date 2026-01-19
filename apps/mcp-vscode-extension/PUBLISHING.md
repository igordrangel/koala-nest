# 🚀 Publicação da Extensão VS Code

Este documento descreve como publicar a extensão no VS Code Marketplace.

## Pré-requisitos

1. **Conta no Visual Studio Marketplace**
   - Acesse: https://marketplace.visualstudio.com/
   - Faça login com sua conta Microsoft

2. **Criar Personal Access Token (PAT)**
   - Acesse: https://dev.azure.com/
   - Clique no seu perfil → Security → Personal Access Tokens
   - Clique em "New Token"
   - Configure:
     - Name: `VSCE Publishing Token`
     - Organization: `All accessible organizations`
     - Scopes: Selecione `Marketplace` → `Manage`
   - Copie o token gerado (você só verá uma vez!)

3. **Configurar Secret no GitHub** (se ainda não tiver)
   - Vá para o repositório: https://github.com/igordrangel/koala-nest
   - Settings → Secrets and variables → Actions
   - Clique em "New repository secret"
   - Name: `VSCODE_MARKETPLACE_TOKEN` (exatamente este nome!)
   - Secret: Cole o token do Azure DevOps
   - Salve
   
   > 💡 Se você já tem este secret configurado, o workflow usará automaticamente.

## Publicação Automática (Recomendado)

O workflow `.github/workflows/publish-vscode-extension.yml` está configurado para publicar automaticamente quando:

1. Você cria um changeset mencionando `koala-nest-mcp-docs`:
   ```bash
   bun changeset add
   # Selecione: koala-nest-mcp-docs
   # Escolha o tipo: patch/minor/major
   # Descreva a mudança
   ```

2. Faz commit e push para `main`:
   ```bash
   git add .
   git commit -m "feat: nova funcionalidade na extensão"
   git push origin main
   ```

3. O workflow irá automaticamente:
   - ✅ Detectar mudanças na extensão via changesets
   - ✅ Versionar a extensão (atualizar package.json)
   - ✅ Buildar MCP server e extensão
   - ✅ Empacotar a extensão (.vsix)
   - ✅ Publicar no VS Code Marketplace
   - ✅ Fazer commit das mudanças de versão
   - ✅ Sincronizar com branch develop

## Publicação Manual

Se preferir publicar manualmente:

```bash
# 1. Buildar o MCP server e a extensão
bun run build:mcp-all

# 2. Entrar na pasta da extensão
cd apps/mcp-vscode-extension

# 3. Fazer login no marketplace (primeira vez)
bun x vsce login koalarx

# 4. Publicar
bun x vsce publish
```

## Verificar Publicação

Após a publicação, sua extensão estará disponível em:

- **Marketplace**: https://marketplace.visualstudio.com/items?itemName=koalarx.koala-nest-mcp-docs
- **VS Code**: Pesquise "Koala Nest" na aba Extensions

## Troubleshooting

### Erro: Publisher 'koalarx' not found

Você precisa criar o publisher no marketplace:
1. Acesse: https://marketplace.visualstudio.com/manage
2. Clique em "Create Publisher"
3. ID: `koalarx`
4. Display Name: `Koala RX`

### Erro: Authentication failed

- Verifique se o secret `VSCODE_MARKETPLACE_TOKEN` está configurado
- Verifique se o token não expirou (tokens do Azure DevOps expiram)
- Gere um novo token se necessário

### Erro: Extension validation failed

- Verifique se todos os campos obrigatórios estão no `package.json`
- Verifique se o `README.md` existe
- Execute `bun x vsce package` localmente para ver erros detalhados

## Atualizar Versão

As versões são gerenciadas automaticamente pelos changesets. Para atualizar:

```bash
# Criar changeset
bun changeset add

# Escolher o tipo de mudança:
# - patch: Bug fixes (3.0.0 → 3.0.1)
# - minor: Novas features (3.0.0 → 3.1.0)
# - major: Breaking changes (3.0.0 → 4.0.0)

# Commit e push
git add .
git commit -m "feat: descrição da mudança"
git push origin main
```

O workflow cuidará do resto!

## Monitorar Workflow

Acompanhe a execução do workflow em:
- https://github.com/igordrangel/koala-nest/actions

## Links Úteis

- [VSCE Documentation](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [VS Code Marketplace](https://marketplace.visualstudio.com/)
- [Azure DevOps PAT](https://dev.azure.com/)
- [Changesets Documentation](https://github.com/changesets/changesets)
