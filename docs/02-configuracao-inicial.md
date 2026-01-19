# Configuração Inicial

## Usando a CLI (Recomendado)

Se você usou a CLI para criar seu projeto (`koala-nest new`), toda a estrutura base já está configurada automaticamente. Você pode pular direto para a próxima seção de desenvolvimento.

Se você fez instalação manual, siga os passos abaixo.

## Estrutura de Módulos

A biblioteca utiliza uma arquitetura modular centrada em dois módulos principais: `KoalaNestModule` para configuração do módulo e `KoalaApp` para inicialização da aplicação.

## Setup do Módulo Principal

### 1. Criar o Módulo da Aplicação

```typescript
// src/host/app.module.ts
import { KoalaNestModule } from '@koalarx/nest/core/koala-nest.module'
import { Module } from '@nestjs/common'
import { env } from '../core/env'
import { PersonModule } from './controllers/person/person.module'

@Module({
  imports: [
    KoalaNestModule.register({
      env,                              // Validação de variáveis de ambiente
      controllers: [PersonModule],      // Módulos de controladores
      cronJobs: [],                     // Jobs agendados
      eventJobs: [],                    // Handlers de eventos
    }),
  ],
})
export class AppModule {}
```

> **Nota sobre Autenticação**: Para implementar Guards de autenticação (JWT, API Key, etc.), veja padrões e exemplos em [Features Avançadas - Autenticação](./05-features-avancadas.md#3-autenticação-e-autorização).

### 2. Configurar Variáveis de Ambiente

A lib `@koalarx/nest` já possui um schema padrão com as variáveis essenciais. Estenda-o para adicionar as suas:

```typescript
// src/core/env.ts
import { envSchema } from '@koalarx/nest/env/env'
import { z } from 'zod'

// Schema padrão da lib já inclui: PORT, NODE_ENV, DATABASE_URL, PRISMA_QUERY_LOG, etc
// Faça merge para adicionar suas próprias variáveis
export const env = envSchema.merge(z.object({
  // Suas variáveis customizadas aqui
  CUSTOM_VAR: z.string().optional(),
}))

export type Env = z.infer<typeof env>
```

**Variáveis padrão da lib (já validadas):**
- `PORT` - Porta da aplicação (padrão: 3000)
- `NODE_ENV` - Ambiente (test|develop|staging|production)
- `DATABASE_URL` - String de conexão PostgreSQL (obrigatória)
- `PRISMA_QUERY_LOG` - Log de queries SQL (opcional)
- `SWAGGER_USERNAME` - Usuário para Swagger (opcional)
- `SWAGGER_PASSWORD` - Senha para Swagger (opcional)
- `REDIS_CONNECTION_STRING` - Conexão Redis (opcional)

### 3. Inicializar a Aplicação

```typescript
// src/main.ts
import 'dotenv/config'
import { NestFactory } from '@nestjs/core'
import { KoalaApp } from '@koalarx/nest/core/koala-app'
import { AppModule } from './host/app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  
  await new KoalaApp(app)
    .useDoc({
      ui: 'scalar',           // ou 'swagger'
      endpoint: '/doc',
      title: 'My API',
      version: '1.0.0',
    })
    .enableCors()
    .setAppName('my-app')
    .setInternalUserName('system.bot')
    .buildAndServe()
}

bootstrap()
```

## Configurar Prisma (Obrigatório)

> ⚠️ **Importante**: A abstração de banco de dados da biblioteca **requer obrigatoriamente o Prisma como ORM**. O `RepositoryBase` e toda a camada de acesso a dados são construídos sobre o Prisma.

Prisma suporta múltiplos drivers de banco de dados. Exemplo com PostgreSQL:

### 1. Instalar Prisma

```bash
npm install prisma @prisma/client
npm install -D prisma
# Para PostgreSQL, adicione:
npm install @prisma/adapter-pg pg
```

**Outros drivers:**
- MySQL/MariaDB: `npm install mysql2`
- SQLite: Sem dependências adicionais
- SQL Server: `npm install tedious`
- MongoDB: `npm install mongodb`

### 2. Inicializar Schema

```bash
npx prisma init
```

### 3. Configurar Database Adapter (Exemplo: PostgreSQL)

```typescript
// src/main.ts
import 'dotenv/config'
import { NestFactory } from '@nestjs/core'
import { KoalaApp } from '@koalarx/nest/core/koala-app'
import { setPrismaClientOptions } from '@koalarx/nest'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { AppModule } from './host/app.module'

async function bootstrap() {
  // Configurar o adapter PostgreSQL antes de criar a aplicação
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })
  const adapter = new PrismaPg(pool)
  setPrismaClientOptions({ adapter })

  const app = await NestFactory.create(AppModule)
  
  await new KoalaApp(app)
    .useDoc({
      ui: 'scalar',
      endpoint: '/doc',
      title: 'My API',
      version: '1.0.0',
    })
    .buildAndServe()
}

bootstrap()
```

## Executar a Aplicação

```bash
# Desenvolvimento
npm run start:dev

# Debug
npm run start:debug

# Produção
npm run build
npm start
```

A aplicação estará disponível em `http://localhost:3000` e a documentação em `http://localhost:3000/doc`.

## Próximos Passos

- Veja [Criando Controladores e Serviços](./03-exemplo-pratico.md) para aprender a estruturar seus endpoints
- Consulte [Tratamento de Erros](./04-tratamento-erros.md) para implementar tratamento robusto de exceções
