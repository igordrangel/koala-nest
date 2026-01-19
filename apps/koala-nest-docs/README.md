# Índice da Documentação

Esta pasta contém toda a documentação detalhada da biblioteca **@koalarx/nest**.

## 📚 Documentos Principais

### 🚀 Começando

- **[00-cli-reference.md](./00-cli-reference.md)** - Referência completa da CLI
- **[01-guia-instalacao.md](./01-guia-instalacao.md)** - Instalação e setup inicial
- **[02-configuracao-inicial.md](./02-configuracao-inicial.md)** - Configuração do projeto

### 💡 Aprendizado Prático

- **[EXAMPLE.md](./EXAMPLE.md)** ⭐ **[COMECE AQUI!]** 
  - Exemplo prático completo com implementação de CRUD
  - Todas as 4 camadas DDD (Domain, Application, Host, Infra)
  - Testes unitários e E2E
  - Jobs e Eventos

### 🔧 Recursos Principais

- **[04-tratamento-erros.md](./04-tratamento-erros.md)** - Error handling e exceções
- **[05-features-avancadas.md](./05-features-avancadas.md)** - Features avançadas
- **[06-decoradores.md](./06-decoradores.md)** - Decoradores customizados
- **[07-guia-bun.md](./07-guia-bun.md)** - Como usar Bun
- **[08-prisma-client.md](./08-prisma-client.md)** - Integração com Prisma
- **[09-mcp-vscode-extension.md](./09-mcp-vscode-extension.md)** - 🤖 Extensão MCP para VS Code
- **[10-cli-integration.md](./10-cli-integration.md)** - 🚀 CLI integrada ao monorepo

---

## 🏗️ Arquitetura DDD

A biblioteca organiza sua aplicação em 4 camadas:

```
HOST (Controllers)
    ↓
APPLICATION (Handlers, Validators)
    ↓
DOMAIN (Entities, Interfaces)
    ↓
INFRA (Repositories, Database)
```

Veja [EXAMPLE.md](./EXAMPLE.md) para implementação prática.

---

## 🎯 Próximas Etapas

1. **Leia** [EXAMPLE.md](./EXAMPLE.md) para entender a arquitetura
2. **Siga** [01-guia-instalacao.md](./01-guia-instalacao.md) para configurar seu projeto
3. **Configure** [02-configuracao-inicial.md](./02-configuracao-inicial.md) o ambiente
4. **Explore** [05-features-avancadas.md](./05-features-avancadas.md) para recursos avançados

---

**Voltar ao README principal:** [../README.md](../README.md)
