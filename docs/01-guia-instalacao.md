# Guia de Instalação

## Introdução

`@koalarx/nest` é uma abstração robusta baseada em NestJS que facilita a criação de aplicações escaláveis seguindo os princípios do Domain-Driven Design (DDD).

## Forma Rápida: Usando a CLI

A forma mais rápida de começar é usar a CLI oficial `@koalarx/nest-cli`:

```bash
# Instalar a CLI globalmente
npm install -g @koalarx/nest-cli

# Criar novo projeto
koala-nest new meu-projeto

# Entrar na pasta
cd meu-projeto

# Iniciar a aplicação
npm run start:dev
```

**Pronto!** Seu projeto está estruturado com todas as best practices incluídas.

## Instalação Manual

Se preferir configurar manualmente, siga os passos abaixo.

## Pré-requisitos

- Node.js 20.18.0+ e npm 9+
- Conhecimento básico de NestJS
- PostgreSQL 12+ (para integração com banco de dados)

## Instalação

### 1. Instalar via NPM

```bash
npm install @koalarx/nest
```

### 2. Instalar Dependências Necessárias

```bash
npm install @nestjs/common @nestjs/core @nestjs/config @nestjs/platform-express
npm install @nestjs/swagger reflect-metadata zod dotenv
npm install @prisma/client @prisma/adapter-pg
npm install ioredis
```

### 3. Configurar Ambiente

Crie um arquivo `.env` na raiz do seu projeto:

```env
NODE_ENV=develop
DATABASE_URL=postgresql://user:password@localhost:5432/database_name
REDIS_URL=redis://localhost:6379
SWAGGER_USERNAME=admin
SWAGGER_PASSWORD=password123
```

### 4. Configurar TypeScript

Atualize seu `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "typeRoots": ["./node_modules/@types"],
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

## Estrutura Básica do Projeto

Recomenda-se seguir a estrutura DDD:

```
src/
├── application/        # Lógica de aplicação (casos de uso, mapeadores)
├── core/              # Configurações globais
├── domain/            # Entidades, DTOs, repositórios, serviços
├── host/              # Controladores, ponto de entrada
├── infra/             # Implementações de infraestrutura
└── main.ts            # Inicialização da aplicação
```

## Próximos Passos

Consulte o [Guia de Configuração Inicial](./02-configuracao-inicial.md) para aprender como configurar sua primeira aplicação com Koala Nest.
