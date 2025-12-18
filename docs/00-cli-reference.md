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

**Exemplos:**

```bash
# Criar um projeto chamado "meu-app"
koala-nest new meu-app

# Entrar na pasta do projeto
cd meu-app

# Instalar dependências
npm install

# Iniciar em modo desenvolvimento
npm run start:dev
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
- ✅ **Guards (JWT + API Key)** - Autenticação e autorização prontas para usar
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
   # Edite o arquivo .env com seus valores
   nano .env
   ```

2. **Inicie o banco de dados** (se usar PostgreSQL)
   ```bash
   # Crie as tabelas
   npm run prisma:migrate:dev
   ```

3. **Inicie a aplicação**
   ```bash
   npm run start:dev
   ```

4. **Acesse a documentação**
   - Scalar UI: `http://localhost:3000/doc`
   - Swagger: `http://localhost:3000/api`

## Exemplos de Uso

### Criar um Projeto Simples

```bash
koala-nest new blog-api
cd blog-api
npm install
npm run start:dev
```

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
- [Exemplo Prático](./03-exemplo-pratico.md) - Aprender com exemplos
