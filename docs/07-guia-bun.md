# Guia de Uso do Bun

Este projeto foi migrado para usar **Bun** como runtime JavaScript/TypeScript padrão.

## O que é Bun?

Bun é um runtime JavaScript moderno, rápido e completo que oferece:

- ⚡ **Performance**: ~3x mais rápido que Node.js
- 📦 **Package Manager**: Gerenciador de pacotes integrado e otimizado
- 🧪 **Test Runner**: Executor de testes nativo compatível com Vitest
- 🔄 **Hot Reload**: Recompilação automática em desenvolvimento
- 💾 **Eficiente**: Menor consumo de memória e disco

## Instalação do Bun

### Windows (PowerShell)

```powershell
powershell -Command "irm https://bun.sh/install.ps1 | iex"
```

### macOS/Linux

```bash
curl -fsSL https://bun.sh/install | bash
```

## Comandos Principais

### Instalar Dependências

```bash
# Instalar todas as dependências
bun install

# Adicionar novo pacote
bun add nome-do-pacote

# Adicionar como dev dependency
bun add -D nome-do-pacote

# Remover pacote
bun remove nome-do-pacote
```

### Executar Scripts

```bash
# Iniciar em modo desenvolvimento
bun run start:dev

# Iniciar em modo debug
bun run start:debug

# Fazer build da aplicação
bun run build

# Executar testes unitários
bun run test

# Executar testes com watch
bun run test:watch

# Executar testes com cobertura
bun run test:cov

# Executar testes em modo debug
bun run test:debug
```

### Prisma com Bun

```bash
# Gerar cliente Prisma
bunx prisma generate

# Executar migrações
bunx prisma migrate dev --name nome_migracao

# Abrir Prisma Studio
bunx prisma studio

# Reset do banco de dados
bunx prisma migrate reset
```

## Diferenças com npm/Node.js

| Operação | npm | Bun |
|----------|-----|-----|
| Instalar deps | `npm install` | `bun install` |
| Adicionar pacote | `npm install pkg` | `bun add pkg` |
| Executar script | `npm run script` | `bun run script` |
| Executar pacote | `npx pkg` | `bunx pkg` |
| Testes | Configuração extra | Nativo com Vitest |

## Variáveis de Ambiente

O arquivo `.env` é carregado automaticamente pelo Bun:

```bash
# .env será carregado automaticamente
DATABASE_URL="postgres://..."
NODE_ENV="development"
```

## Troubleshooting

### Comando bun não encontrado

Se o bun não for encontrado após instalação, atualize a variável `PATH`:

**PowerShell:**
```powershell
$env:Path += ";$env:USERPROFILE\.bun\bin"
```

**cmd.exe:**
```cmd
set PATH=%PATH%;%USERPROFILE%\.bun\bin
```

### Limpar cache

```bash
# Remover node_modules e reinstalar
bun install --force
```

### Usar npm como fallback

Se encontrar problemas com Bun, você pode voltar ao npm:

```bash
# Remover dependências instaladas com Bun
rm -r node_modules

# Instalar com npm
npm install
```

## Configuração do Bun

A configuração principal está em `bunfig.toml`:

```toml
[build]
minify = true

[test]
root = "apps"
timeoutMs = 60000
preload = ["apps/example/src/test/setup-e2e.ts"]

[bun]
autoinstall = true
```

A configuração `preload` carrega o arquivo `setup-e2e.ts` antes de rodar todos os testes, o que permite compartilhar o banco de dados E2E entre os testes.

## Recursos Adicionais

- **Documentação Oficial**: https://bun.sh
- **API Documentation**: https://bun.sh/docs
- **GitHub**: https://github.com/oven-sh/bun

## Performance Tips

1. **Use Bun para tudo**: O melhor desempenho vem de usar Bun para desenvolvimento e teste
2. **Disable node_modules symlinks**: Bun otimiza isso automaticamente
3. **Lazy install**: Use `bun add --save-peer` para dependências opcionais
4. **Watch mode**: Use `bun --watch` para desenvolvimento com hot reload

## Vantagens para Desenvolvimento

- Instalação de dependências 5-10x mais rápida
- Testes rodando 2-3x mais rápido
- Build mais eficiente com menos consumo de RAM
- Desenvolvimento mais responsivo com hot reload integrado
