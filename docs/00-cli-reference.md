# CLI Reference - @koalarx/nest-cli

A CLI oficial da biblioteca `@koalarx/nest` facilita a criação de novos projetos estruturados automaticamente.

## Instalação da CLI

```bash
npm install -g @koalarx/nest-cli
```

**Requisitos:**
- Node.js 20.18.0 ou superior

## Comandos Disponíveis

### Criar Novo Projeto

```bash
koala-nest new <nome-do-projeto>
```

Durante a criação, a CLI perguntará se você deseja instalar o MCP Server localmente.

**Exemplos:**

```bash
# Criar um projeto chamado "meu-app"
koala-nest new meu-app

# Entrar na pasta do projeto
cd meu-app

# Executar as migrations no banco de dados
bun run prisma:deploy

# Iniciar em modo desenvolvimento
bun run start:dev
```

### Gerenciar MCP Server

#### Instalar MCP Server

```bash
koala-nest mcp install
```

Baixa e instala a última versão do Koala Nest MCP Server localmente em `~/.koala-nest/mcp-server/` e configura automaticamente o arquivo `~/mcp.json`.

#### Atualizar MCP Server

```bash
koala-nest mcp update
```

Verifica se há uma nova versão disponível e atualiza o MCP Server instalado localmente.

### Verificar Atualizações

```bash
koala-nest check-updates
```

Verifica se há atualizações disponíveis para os pacotes Koala (`@koalarx/nest` e `@koalarx/nest-cli`) comparando com as versões no npm registry.

**Opções:**
- `-p, --path <path>` - Caminho do projeto para verificar (padrão: diretório atual)

**Exemplo:**

```bash
# Verificar atualizações no projeto atual
koala-nest check-updates

# Verificar atualizações em um projeto específico
koala-nest check-updates -p /caminho/para/projeto
```

## O que a CLI Configura Automaticamente

Quando você cria um novo projeto com a CLI, ele inclui:

### 📁 Estrutura de Pastas

```
src/
├── host/                          # Camada de entrada
│   ├── app.module.ts              # Módulo principal
│   ├── main.ts                    # Ponto de entrada
│   └── controllers/               # Controladores
├── core/                          # Configuração central
│   ├── env.ts                     # Variáveis de ambiente
│   └── database/                  # Configuração do banco
├── application/                   # Lógica de aplicação
│   ├── handlers/                  # Command handlers
│   └── mapping/                   # AutoMapper profiles
├── domain/                        # Lógica de negócio
│   ├── entities/                  # Entidades
│   ├── repositories/              # Interfaces de repositório
│   ├── dtos/                      # Data Transfer Objects
│   └── services/                  # Serviços de domínio
├── infra/                         # Implementação técnica
│   ├── database/                  # Repositories concretos
│   ├── services/                  # Serviços técnicos
│   └── mappers/                   # Mapeadores
└── test/                          # Utilitários de teste
```

### 🛠️ Configuração Incluída

- ✅ **Módulo KoalaNest** - Configurado e pronto para uso
- ✅ **Prisma ORM** - Integrado com PostgreSQL
- ✅ **Redis** - Configurado para sincronização de background services
- ✅ **Padrões de Autenticação** - Templates para implementar Guards com JWT ou API Key
- ✅ **Documentação Swagger/Scalar** - API documentada automaticamente
- ✅ **Tratamento de Erros** - Filtros de exceção configurados
- ✅ **Validação com Zod** - Schema validation pronto
- ✅ **Exemplo Prático** - Entidade de exemplo (Pessoa) para referência

### 📦 Dependências Instaladas

```bash
# Core
@koalarx/nest
@nestjs/common
@nestjs/core
@nestjs/config
@nestjs/platform-express

# Banco de Dados
@prisma/client
prisma

# Autenticação
@nestjs/jwt
@nestjs/passport
passport-jwt

# Validação
zod

# Documentação
@nestjs/swagger
@scalar/nestjs-api-reference

# Utilitários
ioredis
dotenv
reflect-metadata

# Desenvolvimento
typescript
@types/node
ts-node
tsx
```

## Próximos Passos Após Criar o Projeto

1. **Configure as variáveis de ambiente** (.env)
   ```bash
   # O arquivo .env já foi criado com valores padrão
   # Edite-o conforme necessário
   nano .env
   ```

2. **Inicie o banco de dados** (se usar PostgreSQL via Docker)
   ```bash
   # O projeto já vem com migrations de exemplo
   # Execute-as no banco de dados:
   bun run prisma:deploy
   ```
   
   > ⚠️ **Importante:** O CLI não executa `prisma:deploy` automaticamente. Você precisa rodá-lo manualmente após configurar o banco de dados para aplicar as migrations e poder executar o projeto de demonstração.

3. **Inicie a aplicação**
   ```bash
   bun run start:dev
   ```

4. **Acesse a documentação**
   - Scalar UI: `http://localhost:3000/doc`
   - Swagger: `http://localhost:3000/api`

## Exemplos de Uso

### Criar um Projeto Simples
bun run prisma:deploy  # Aplicar migrations de exemplo
bun run start:dev
```

Seu blog API estará rodando em `http://localhost:3000` com:
- Exemplo de entidade (Pessoa)
- Endpoints CRUD funcionais
- Autenticação
Seu blog API estará rodando em `http://localhost:3000` com:
- Exemplo de entidade (Pessoa)
- Endpoints CRUD funcionais
- Autenticação JWT configurada
- Documentação interativa

### Estrutura Gerada Exemplo

O projeto criado inclui:
- **PersonController** - Exemplo de controlador REST
- **PersonService** - Exemplo de serviço de domínio
- **PersonRepository** - Exemplo de repositório
- **Migrations Prisma** - Schema de exemplo para rodar

## Troubleshooting

### Node.js Versão Incompatível

```bash
# Verifique sua versão
node --version

# Você precisa da versão 20.18.0 ou superior
# Atualize node se necessário
```

### Problemas com Permissões no Linux/Mac

```bash
# Se receber erro de permissão, use sudo
sudo npm install -g @koalarx/nest-cli
```

### Limpar Cache de Instalação

```bash
npm cache clean --force
npm install -g @koalarx/nest-cli
```

## Repositório da CLI

Para mais informações, contribuições ou reportar bugs:
- **GitHub:** [koala-nest-cli](https://github.com/igordrangel/koala-nest-cli)
- **NPM:** [@koalarx/nest-cli](https://www.npmjs.com/package/@koalarx/nest-cli)

## Links Úteis

- [Guia de Instalação](./01-guia-instalacao.md) - Mais detalhes sobre setup manual
- [Configuração Inicial](./02-configuracao-inicial.md) - Entender a estrutura criada
- [Exemplo Prático](./EXAMPLE.md) - Aprender com exemplos completos e funcionando
