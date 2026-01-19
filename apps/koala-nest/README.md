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
[![VS Code Extension](https://img.shields.io/badge/VS%20Code-MCP%20Extension-blue)](https://marketplace.visualstudio.com/items?itemName=koalarx.koala-nest-mcp-docs)
[![Documentation](https://img.shields.io/badge/📖-Docs-blue)](https://nest.koalarx.com/)

</div>

## 📖 Documentação

Acesse a documentação completa e interativa em: **[nest.koalarx.com](https://nest.koalarx.com/)**

## 🤖 Extensão VS Code com MCP

Acelere seu desenvolvimento com a **extensão oficial para VS Code**! Toda a documentação do Koala Nest integrada diretamente no GitHub Copilot através do Model Context Protocol.

**[📦 Instalar Extensão](https://marketplace.visualstudio.com/items?itemName=koalarx.koala-nest-mcp-docs)**

Basta instalar e perguntar ao Copilot sobre o Koala Nest - ele terá acesso instantâneo à documentação oficial!

> 💡 **Exemplo:** "Como criar um controller CRUD no Koala Nest?" - O Copilot responderá com base na documentação atualizada.

**[📖 Documentação da Extensão MCP](./docs/09-mcp-vscode-extension.md)**

## 🎯 O que você consegue fazer com @koalarx/nest

- ✅ **Implementar APIs REST completas** com CRUD automático
- ✅ **AutoMapping** transparente entre Request, Entity e Response
- ✅ **Validação automática** com Zod integrado
- ✅ **Testes unitários e E2E** simplificados
- ✅ **CronJobs** com suporte a múltiplos pods via Redis
- ✅ **EventJobs** para processamento assíncrono de eventos
- ✅ **Paginação** automaticamente documentada
- ✅ **Documentação OpenAPI (Swagger ou Scalar)** automática

## 📚 Documentação Completa

Toda a documentação está organizada em arquivos separados para facilitar a navegação:

| Documento | Descrição |
|-----------|-----------|
| [**EXAMPLE.md**](./docs/EXAMPLE.md) | **Exemplo prático completo** - API CRUD com todas as camadas DDD |
| [**CLI Reference**](./docs/00-cli-reference.md) | Guia da CLI oficial - Forma rápida de criar projetos |
| [**Guia de Instalação**](./docs/01-guia-instalacao.md) | Como instalar e configurar a biblioteca |
| [**Configuração Inicial**](./docs/02-configuracao-inicial.md) | Setup do projeto com KoalaNestModule e KoalaApp |
| [**Tratamento de Erros**](./docs/04-tratamento-erros.md) | Sistema robusto de tratamento e filtros de exceção |
| [**Features Avançadas**](./docs/05-features-avancadas.md) | Cron Jobs, Event Handlers, Redis, Transações e Padrões de Autenticação |
| [**Decoradores**](./docs/06-decoradores.md) | @IsPublic, @Upload, @Cookies e mais |
| [**Guia Bun**](./docs/07-guia-bun.md) | Por que Bun e como usá-lo |
| [**Prisma Client**](./docs/08-prisma-client.md) | Integração com Prisma |
| [**🤖 Extensão MCP**](./docs/09-mcp-vscode-extension.md) | **Extensão VS Code com integração ao Copilot** |

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
- [x] Banco de dados Prisma
- [x] Redis para background services

### Forma Manual

> ⚠️ **Requisito Obrigatório**: A abstração de banco de dados da biblioteca requer **Prisma como ORM**. 
>
> **💡 Dica**: Para um exemplo completo e funcionando, veja [docs/EXAMPLE.md](./docs/EXAMPLE.md)

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
// Importar seus módulos de controllers
// import { PersonModule } from './controllers/person/person.module'

@Module({
  imports: [
    KoalaNestModule.register({
      env,
      // controllers: [PersonModule], // Adicione seus módulos aqui
    }),
  ],
})
export class AppModule {}
```

### 3. Inicializar Aplicação

```typescript
// src/host/main.ts
import { NestFactory } from '@nestjs/core'
import { KoalaApp } from '@koalarx/nest/core/koala-app'
import { AppModule } from './app.module'
import { DbTransactionContext } from '@/infra/database/db-transaction-context'
import { setPrismaClientOptions } from '@koalarx/nest/core/database/prisma.service'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import 'dotenv/config'

async function bootstrap() {
  // Configurar Prisma com adapter PostgreSQL
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })
  const adapter = new PrismaPg(pool)
  setPrismaClientOptions({ adapter })

  // Criar aplicação NestJS
  const app = await NestFactory.create(AppModule)
  
  // Configurar e iniciar KoalaApp
  await new KoalaApp(app)
    .useDoc({
      ui: 'scalar',
      endpoint: '/doc',
      title: 'API de Demonstração',
      version: '1.0',
    })
    .setAppName('example')
    .setInternalUserName('integration.bot')
    .setDbTransactionContext(DbTransactionContext)
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

### Camadas DDD (Domain-Driven Design)

A biblioteca implementa um padrão com 4 camadas bem definidas:

1. **Domain** - Entidades, DTOs e interfaces de repositório
2. **Application** - Handlers com lógica de negócio, Validators, AutoMapping
3. **Host** - Controllers REST que expõem os endpoints
4. **Infra** - Repositórios concretos e acesso ao banco de dados

Veja [docs/EXAMPLE.md](./docs/EXAMPLE.md) para implementação completa.

### AutoMapping Automático

Converte Request → Entity → Response transparentemente:

```typescript
// Define os mapeamentos
createMap(CreatePersonRequest, Person)
createMap(Person, ReadPersonResponse)

// Usa automaticamente
const person = mapper.map(request, CreatePersonRequest, Person)
const response = mapper.map(entity, Person, ReadPersonResponse)
```

### Validação com Zod

Validação tipada integrada com transformação de dados:

```typescript
export class CreatePersonValidator extends RequestValidatorBase<CreatePersonRequest> {
  protected get schema(): ZodType<any, ZodTypeDef, any> {
    return z.object({
      name: z.string(),
      phones: z.array(z.object({ phone: z.string() })),
      address: z.object({ address: z.string() }),
    })
  }
}
```

### Handlers e RequestResult

Padrão funcional para tratamento de sucesso/erro:

```typescript
@Injectable()
export class CreatePersonHandler extends RequestHandlerBase<...> {
  async handle(req: CreatePersonRequest): Promise<RequestResult<Error, CreatePersonResponse>> {
    const person = this.mapper.map(
      new CreatePersonValidator(req).validate(),
      CreatePersonRequest,
      Person,
    )
    const result = await this.repository.save(person)
    return ok({ id: result.id })
  }
}

// Controller
const response = await handler.handle(request)
if (response.isFailure()) {
  throw response.value
}
return response.value
```

### Paginação Automática

Queries com paginação documentada automaticamente:

```typescript
// Requisição
GET /person?name=John&active=true&page=1&pageSize=10

// Response com count
{
  "items": [...],
  "count": 5
}
```

### CronJobs com Redis (Sincronização)

Tarefas agendadas com lock automático via RedLock em ambientes multi-pod:

```typescript
@Injectable()
export class DeleteInactiveJob extends CronJobHandlerBase {
  protected async settings(): Promise<CronJobSettings> {
    return {
      isActive: true,
      timeInMinutes: 1,
    }
  }

  protected async run(): Promise<CronJobResponse> {
    // Executa apenas em um pod por vez
    const result = await this.readManyPerson.handle(
      new ReadManyPersonDto({ active: false })
    )
    
    if (result.isOk()) {
      for (const person of result.value.items) {
        await this.deletePerson.handle(person.id)
      }
    }
    
    return ok(null)
  }
}
```

### EventJobs - Processamento Assíncrono

Processamento de eventos assincronamente:

```typescript
export class PersonEventJob extends EventJob<Person> {
  defineHandlers(): Type<EventHandlerBase>[] {
    return [InactivePersonHandler]
  }
}

@Injectable()
export class InactivePersonHandler extends EventHandlerBase {
  async handleEvent(): Promise<void> {
    const result = await this.repository.readMany(
      new ReadManyPersonDto({ active: true })
    )
    
    for (const person of result.items) {
      person.active = false
      await this.repository.save(person)
    }
  }
}

// Registrar na aplicação
.addEventJob(InactivePersonHandler)
```

### Testes Unitários

Setup simplificado com dependências injetadas:

```typescript
describe('CreatePersonHandler', () => {
  const app = createUnitTestApp()

  it('should create a person', async () => {
    const handler = app.get(CreatePersonHandler)
    const result = await handler.handle(createPersonRequestMockup)

    expect(result.isOk()).toBeTruthy()
    if (result.isOk()) {
      expect(result.value).toEqual({
        id: expect.any(Number),
      })
    }
  })
})
```

### Testes E2E

Testes de integração completos:

```typescript
const app = await createE2ETestApp()

it('should create a person', async () => {
  const response = await request(app.getHttpServer())
    .post('/person')
    .send({
      name: 'John Doe',
      phones: [],
      address: { address: 'Street 1' },
    })

  expect(response.statusCode).toBe(201)
  expect(response.body.id).toBeDefined()
})
```

## Exemplo Prático Completo

Veja em [docs/EXAMPLE.md](./docs/EXAMPLE.md) um CRUD completo de **Pessoa** implementado com:

- ✅ Entidades (Person, PersonAddress, PersonPhone)
- ✅ DTOs com paginação (ReadManyPersonDto)
- ✅ 5 Handlers (Create, Read, ReadMany, Update, Delete)
- ✅ 5 Controllers REST
- ✅ Repository com Prisma
- ✅ Testes unitários e E2E
- ✅ CronJobs e EventJobs
- ✅ AutoMapping automático
- ✅ Validação com Zod

## Estrutura de Projeto Recomendada

Seguindo DDD conforme implementado no exemplo:

```
apps/
├── example/              # Projeto exemplo
│   └── src/
│       ├── domain/       # Entidades, DTOs, Interfaces
│       ├── application/  # Handlers, Validators, Mapping
│       ├── host/         # Controllers, Roteamento
│       ├── infra/        # Repositories, Database
│       ├── core/         # Configuração
│       └── test/         # Setup de testes
└── koala-nest/           # Biblioteca principal

prisma/
├── schema.prisma         # Modelo de dados
├── migrations/           # Histórico de migrações
└── generated/            # Cliente Prisma gerado
```

## Configuração de Ambiente

Crie seu `.env`:

```env
# Banco de dados
DATABASE_URL=postgresql://user:password@localhost:5432/koala_db

# Aplicação
NODE_ENV=develop

# Prisma (opcional - habilita logs das queries)
PRISMA_QUERY_LOG=true

# Swagger/Scalar (opcional)
SWAGGER_USERNAME=admin
SWAGGER_PASSWORD=password123

# Redis (opcional - necessário para CronJobs em múltiplas instâncias)
REDIS_CONNECTION_STRING=redis://localhost:6379
```

Consulte [docs/02-configuracao-inicial.md](./docs/02-configuracao-inicial.md) para mais detalhes.

## Recursos Adicionais

A biblioteca inclui vários decoradores e utilitários para facilitar o desenvolvimento:

- **@ApiPropertyEnum()** - Documente enums corretamente no Swagger
- **@ApiPropertyOnlyDevelop()** - Propriedades apenas em ambiente de desenvolvimento
- **@ApiExcludeEndpointDiffDevelop()** - Endpoints apenas em dev (excluídos em produção)
- **@Upload()** - Documentação automática de uploads de arquivos
- **@Cookies()** - Extrai cookies da requisição HTTP
- **@IsPublic()** - Marca endpoint como público (sem validação de token)

Veja [docs/06-decoradores.md](./docs/06-decoradores.md) para documentação completa.

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
