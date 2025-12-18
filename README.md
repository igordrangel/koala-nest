<p align="center">
  <a href="https://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<h1 align="center">@koalarx/nest</h1>

<p align="center">Uma abstração <a href="https://nestjs.com" target="_blank">NestJS</a> robusta para criar APIs escaláveis seguindo os princípios do Domain-Driven Design (DDD).</p>

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Bun-1.3%2B-black)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.1%2B-blue)](https://www.typescriptlang.org/)
[![CLI](https://img.shields.io/badge/CLI-@koalarx/nest--cli-brightgreen)](https://www.npmjs.com/package/@koalarx/nest-cli)

</div>

## Documentação Completa

Toda a documentação está organizada em arquivos separados para facilitar a navegação:

| Documento | Descrição |
|-----------|-----------|
| [**CLI Reference**](./docs/00-cli-reference.md) | Guia da CLI oficial - Forma rápida de criar projetos |
| [**Guia de Instalação**](./docs/01-guia-instalacao.md) | Como instalar e configurar a biblioteca |
| [**Configuração Inicial**](./docs/02-configuracao-inicial.md) | Setup do projeto com KoalaNestModule e KoalaApp |
| [**Exemplo Prático**](./docs/03-exemplo-pratico.md) | Criar uma API completa de usuários passo a passo |
| [**Tratamento de Erros**](./docs/04-tratamento-erros.md) | Sistema robusto de tratamento e filtros de exceção |
| [**Features Avançadas**](./docs/05-features-avancadas.md) | Cron Jobs, Event Handlers, Guards, Redis, Transações |
| [**Decoradores**](./docs/06-decoradores.md) | @IsPublic, @Upload, @Cookies e mais |

## Quick Start

### Usando Bun (Recomendado - Mais Rápido)

O projeto agora usa **Bun** como runtime JavaScript. Para instalar o Bun:

```bash
# Instalar Bun (Windows, macOS, Linux)
curl -fsSL https://bun.sh/install | bash

# Ou em Windows com PowerShell:
powershell -Command "irm https://bun.sh/install.ps1 | iex"

# Instalar dependências
bun install

# Iniciar em modo desenvolvimento
bun run start:dev

# Executar testes
bun run test

# Fazer build
bun run build
```

**Vantagens do Bun:**
- ⚡ Runtime ~3x mais rápido que Node.js
- 📦 Package manager integrado (mais rápido que npm)
- 🧪 Test runner nativo (compatível com Vitest)
- 🔄 Hot reload automático
- 💾 Menor consumo de memória

### Forma Rápida com CLI (Recomendado)

```bash
# Instalar a CLI globalmente
npm install -g @koalarx/nest-cli

# Criar novo projeto estruturado
koala-nest new meu-projeto

# Entrar na pasta
cd meu-projeto

# Iniciar em modo desenvolvimento (com Bun)
bun run start:dev
```

**Pronto!** Seu projeto está estruturado com:
- [x] Módulo DDD configurado
- [x] Documentação da API (Scalar UI)
- [x] Tratamento de erros robusto
- [x] Guards de autenticação (JWT + API Key)
- [x] Banco de dados Prisma
- [x] Redis para background services

### Forma Manual

> ⚠️ **Requisito Obrigatório**: A abstração de banco de dados da biblioteca requer **Prisma como ORM**. 

```bash
# Com Bun (Recomendado - Mais rápido)
bun install @koalarx/nest

# Ou com npm (Alternativa)
npm install @koalarx/nest
```

### 2. Criar Módulo Principal

```typescript
// src/host/app.module.ts
import { KoalaNestModule } from '@koalarx/nest/core/koala-nest.module'
import { Module } from '@nestjs/common'
import { env } from '../core/env'
import { UserModule } from './controllers/user/user.module'

@Module({
  imports: [
    KoalaNestModule.register({
      env,
      controllers: [UserModule],
    }),
  ],
})
export class AppModule {}
```

### 3. Inicializar Aplicação

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
      ui: 'scalar',
      endpoint: '/doc',
      title: 'Minha API',
      version: '1.0.0',
    })
    .enableCors()
    .buildAndServe()
}

bootstrap()
```

### 4. Executar

```bash
npm run start:dev
```

Acesse `http://localhost:3000/doc` para a documentação interativa!

## Principais Features

### Segurança

- **Guards**: Autenticação e autorização (JWT + API Key)
- **Estratégias Customizadas**: JwtStrategy e ApiKeyStrategy
- **@IsPublic()**: Marca endpoints como públicos
- **@RestrictByProfile()**: Restringe acesso por perfil de usuário

### Tratamento de Erros

Filtros automáticos para:
- **Domain Errors** (ConflictError, ResourceNotFoundError, etc)
- **Prisma Validation** (validação de banco de dados)
- **Zod Validation** (validação de dados de entrada)
- **Global Exceptions** (erros não capturados)

```typescript
throw new ConflictError('Email já registrado') // 409
throw new ResourceNotFoundError('Usuário não encontrado') // 404
throw new BadRequestError('Dados inválidos') // 400
```

### Processamento em Background

**Cron Jobs** - Execute tarefas agendadas:
```typescript
@Injectable()
export class SendReportJob extends CronJobHandlerBase {
  protected async settings() {
    return { isActive: true, timeInMinutes: 1440 }
  }
  protected async run(): Promise<CronJobResponse> {
    await emailService.sendReport()
    return ok(null)
  }
}

.addCronJob(SendReportJob)
```

**Event Jobs** - Processe eventos assincronamente:
```typescript
@Injectable()
export class UserCreatedHandler extends EventHandlerBase {
  async handleEvent(): Promise<void> {
    // Processar evento de criação de usuário
    console.log('Usuário criado!')
  }
}

// Registrar em EventJob
export class UserEventJob extends EventJob<User> {
  defineHandlers(): Type<EventHandlerBase>[] {
    return [UserCreatedHandler]
  }
}

.addEventJob(UserEventJob)
```

### Banco de Dados

- **Prisma ORM** com suporte a todos os drivers (PostgreSQL, MySQL, SQLite, MariaDB, SQL Server, MongoDB)
- **Transações Automáticas** com context gerenciado
- **Query Logging** em desenvolvimento

### Documentação

Dois UIs disponíveis:
- **Scalar** - Interface moderna e interativa
- **Swagger UI** - Documentação clássica

```typescript
.useDoc({
  ui: 'scalar', // ou 'swagger'
  endpoint: '/doc',
  title: 'API Documentation',
  version: '1.0.0',
})
```

### Funcionalidades Adicionais

- **Redis Integration** - Sincronização de Cron Jobs e Event Handlers (RedLock)
- **CORS** - Requisições cross-origin
- **Zod Validation** - Validação de dados com tipos
- **Ngrok** - Exposição segura em desenvolvimento
- **Decoradores Customizados** - @Upload, @Cookies, @ApiPropertyEnum

## Exemplo Completo

Veja como criar um CRUD de usuários:

```typescript
// src/domain/entities/user.entity.ts
export interface UserEntity {
  id: string
  name: string
  email: string
  createdAt: Date
}
```

```typescript
// src/domain/dtos/create-user.dto.ts
import { z } from 'zod'

export const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
})

export type CreateUserDto = z.infer<typeof CreateUserSchema>
```

```typescript
// src/domain/services/user.service.ts
import { Injectable } from '@nestjs/common'
import { ConflictError } from '@koalarx/nest/core/errors/conflict.error'
import { ResourceNotFoundError } from '@koalarx/nest/core/errors/resource-not-found.error'

@Injectable()
export class UserService {
  constructor(private readonly repository: IUserRepository) {}

  async create(data: CreateUserDto): Promise<UserEntity> {
    const exists = await this.repository.findByEmail(data.email)
    if (exists) throw new ConflictError('Email já registrado')
    
    return this.repository.create(data)
  }

  async findById(id: string): Promise<UserEntity> {
    const user = await this.repository.findById(id)
    if (!user) throw new ResourceNotFoundError('Usuário não encontrado')
    return user
  }

  async delete(id: string): Promise<void> {
    await this.findById(id) // Valida existência
    await this.repository.delete(id)
  }
}
```

```typescript
// src/host/controllers/user/user.controller.ts
import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common'
import { ApiTags, ApiCreatedResponse } from '@nestjs/swagger'
import { IsPublic } from '@koalarx/nest/decorators/is-public.decorator'

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Post()
  @IsPublic()
  @ApiCreatedResponse({ type: UserResponseDto })
  async create(@Body() data: CreateUserRequestDto) {
    const validated = CreateUserSchema.parse(data)
    return this.service.create(validated)
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findById(id)
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.service.delete(id)
  }
}
```

Erros são automaticamente transformados em respostas HTTP apropriadas!

## Estrutura de Projeto Recomendada

Seguindo DDD:

```
src/
├── application/          # Lógica de aplicação e mapeadores
├── core/                # Configurações globais
├── domain/              # Lógica de negócio
│   ├── entities/
│   ├── dtos/
│   ├── repositories/    # Interfaces
│   └── services/
├── host/                # Controladores e entrada
│   ├── controllers/
│   ├── security/        # Guards e estratégias
│   └── app.module.ts
├── infra/               # Implementações de infraestrutura
│   ├── database/
│   ├── repositories/    # Implementações
│   └── services/
└── main.ts
```

## Configuração de Ambiente

A lib já valida automaticamente as variáveis padrão. Crie seu `.env` com:

```env
# Variáveis obrigatórias
NODE_ENV=develop
DATABASE_URL=postgresql://user:password@localhost:5432/db

# Variáveis opcionais (padrão da lib)
REDIS_CONNECTION_STRING=redis://localhost:6379
SWAGGER_USERNAME=admin
SWAGGER_PASSWORD=password123
PRISMA_QUERY_LOG=false

# Suas variáveis customizadas
# CUSTOM_VAR=value
```

Ver [Configuração Inicial - Variáveis de Ambiente](./docs/02-configuracao-inicial.md#2-configurar-variáveis-de-ambiente) para detalhes.

## Índice da Documentação Original

A documentação abaixo foi mantida para referência de recursos específicos:

### API Key Strategy

Uma estratégia de autenticação via chave de API integrada ao Passport.js:

[Ver documentação completa →](./docs/01-guia-instalacao.md#api-key-strategy)

### Ngrok

Exponha sua aplicação local na internet com segurança:

```typescript
.useNgrok(process.env.NGROK_AUTH_TOKEN!)
```

[Ver documentação completa →](./docs/05-features-avancadas.md#10-ngrok-exposição-em-produção)

### Decoradores

- **@ApiPropertyEnum()** - Documento enums no Swagger
- **@ApiPropertyOnlyDevelop()** - Propriedades apenas em dev
- **@ApiExcludeEndpointDiffDevelop()** - Endpoints apenas em dev
- **@Upload()** - Documentação de upload de arquivos
- **@Cookies()** - Extrai cookies da requisição
- **@IsPublic()** - Marca endpoint como público

[Ver todos os decoradores →](./docs/06-decoradores.md)

## Arquitetura

A biblioteca utiliza duas classes principais:

1. **KoalaNestModule** - Módulo NestJS com configuração
2. **KoalaApp** - Classe fluent para setup da aplicação

Ambas seguem o padrão de **Fluent Interface** para configuração clara e intuitiva.

## Dependências Principais

- `@nestjs/*` - Framework NestJS
- `@prisma/client` - ORM Prisma
- `zod` - Validação de dados
- `ioredis` - Cliente Redis
- `@nestjs/swagger` - Documentação automática

## Links Importantes

- **[CLI (@koalarx/nest-cli)](https://www.npmjs.com/package/@koalarx/nest-cli)** - Ferramenta oficial para criar projetos rapidamente
- **[GitHub da Library](https://github.com/igordrangel/koala-nest)** - Repositório principal
- **[GitHub da CLI](https://github.com/igordrangel/koala-nest-cli)** - Repositório da CLI

## Licença

MIT License © 2023-2025 Igor D. Rangel

## Contribuindo

Contribuições são bem-vindas! Abra uma issue ou pull request no repositório.

## Suporte

Para dúvidas, abra uma issue no repositório ou consulte a [documentação completa](./docs).

---

<p align="center">
  Feito para desenvolvedores NestJS
</p>
