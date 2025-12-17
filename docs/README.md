# Documentação - @koalarx/nest

Bem-vindo à documentação completa da biblioteca `@koalarx/nest`! Aqui você encontrará guias detalhados e exemplos práticos para aproveitar ao máximo a biblioteca.

## Comece Agora com a CLI

A forma mais rápida de começar é usar a **@koalarx/nest-cli**:

```bash
npm install -g @koalarx/nest-cli
koala-nest new meu-projeto
cd meu-projeto
npm run start:dev
```

Seu projeto estará pronto com toda a estrutura configurada!

---

## Documentação

### 0. **[CLI Reference](./00-cli-reference.md)**
Guia da CLI oficial para criar projetos rapidamente.

**Tópicos:**
- Instalação da CLI
- Criando novo projeto
- O que é configurado automaticamente
- Estrutura de pastas gerada
- Próximos passos

---

### 1. **[Guia de Instalação](./01-guia-instalacao.md)**
Aprenda como instalar a biblioteca e configurar seu ambiente de desenvolvimento.

**Tópicos:**
- Usar a CLI (recomendado) para criar novo projeto
- Instalação manual via NPM
- Configuração de variáveis de ambiente
- Estrutura recomendada do projeto

---

### 2. **[Configuração Inicial](./02-configuracao-inicial.md)**
Configure sua primeira aplicação com Koala Nest.

**Tópicos:**
- Usando a CLI (projetos já configurados)
- Setup do módulo principal (KoalaNestModule)
- Configuração de variáveis de ambiente com Zod
- Inicialização da aplicação (KoalaApp)
- Integração com Prisma (PostgreSQL, MySQL, SQLite, MariaDB, SQL Server, MongoDB)

**Exemplo:**
```typescript
const app = await NestFactory.create(AppModule)

await new KoalaApp(app)
  .useDoc({ ui: 'scalar', endpoint: '/doc', title: 'My API', version: '1.0' })
  .enableCors()
  .buildAndServe()
```

---

### 3. **[Exemplo Prático](./03-exemplo-pratico.md)**
Desenvolva uma API completa de gerenciamento de usuários do zero.

**Tópicos:**
- Criar entidades e DTOs
- Implementar repositórios (padrão repository)
- Desenvolver serviços de domínio
- Criar controladores REST
- Estruturar módulos NestJS

**O que você aprenderá:**
- CRUD completo (Create, Read, Update, Delete)
- Validação com Zod
- Documentação automática com Swagger/Scalar
- Tratamento de erros

---

### 4. **[Tratamento de Erros](./04-tratamento-erros.md)**
Sistema robusto de tratamento e transformação de exceções.

**Erros Disponíveis:**
- `ResourceNotFoundError` → 404 Not Found
- `ConflictError` → 409 Conflict
- `BadRequestError` → 400 Bad Request
- `NotAllowedError` → 400 Bad Request
- `WrongCredentialsError` → 401 Unauthorized
- `NoContentError` → 204 No Content
- `UserAlreadyExist` → 400 Bad Request

**Filtros de Exceção:**
- Domain Errors Filter
- Prisma Validation Exception Filter
- Zod Errors Filter
- Global Exception Filter

**Exemplo:**
```typescript
throw new ConflictError('Email já registrado') // Automático: 409 Conflict
```

---

### 5. **[Features Avançadas](./05-features-avancadas.md)**
Aproveite recursos poderosos da biblioteca.

**Tópicos:**
1. **Cron Jobs** - Tarefas agendadas
2. **Event Jobs** - Processamento assincronado de eventos
3. **Guards Globais** - Autenticação e autorização (JWT, API Key)
4. **Documentação Swagger/Scalar** - Personalização
5. **CORS** - Requisições cross-origin
6. **Validação com Zod** - Validação de dados
7. **Redis** - Sincronização de background services (Cron Jobs e Event Handlers)
8. **Transações Prisma** - Garantir consistência
9. **Variáveis Globais** - Acesso a informações da app
10. **Ngrok** - Exposição em produção

**Exemplos:**
```typescript
// Cron Job
.addCronJob(SendDailyReportJob)

// Event Handler
.addEventJob(UserCreatedHandler)

// Guard Global
.addGlobalGuard(JwtGuard)

// Ngrok
.useNgrok(process.env.NGROK_AUTH_TOKEN!)
```

---

### 6. **[Decoradores](./06-decoradores.md)**
Decoradores customizados para facilitar o desenvolvimento.

**Decoradores Disponíveis:**
- `@IsPublic()` - Marca endpoint como público
- `@ApiPropertyEnum()` - Documenta enums no Swagger
- `@ApiPropertyOnlyDevelop()` - Propriedade apenas em dev
- `@ApiExcludeEndpointDiffDevelop()` - Endpoint apenas em dev
- `@Upload()` - Documentação de upload de arquivo
- `@Cookies()` - Extrai cookies da requisição

**Exemplo:**
```typescript
@Post('login')
@IsPublic()
async login(@Body() credentials: LoginDto) {
  // Endpoint público
}
```

---

## Guia por Caso de Uso

### Quero criar uma API simples
1. Leia [Guia de Instalação](./01-guia-instalacao.md)
2. Leia [Configuração Inicial](./02-configuracao-inicial.md)
3. Siga [Exemplo Prático](./03-exemplo-pratico.md)

### Quero adicionar autenticação
1. Veja [Features Avançadas - Guards Globais](./05-features-avancadas.md#3-guards-globais-autenticaçãoautorização)
2. Use `@IsPublic()` em [Decoradores](./06-decoradores.md#ispublic)

### Quero processar erros adequadamente
1. Estude [Tratamento de Erros](./04-tratamento-erros.md)
2. Use os erros predefinidos na sua lógica

### Quero executar tarefas em background
1. Veja [Features Avançadas - Cron Jobs](./05-features-avancadas.md#1-cron-jobs-tarefas-agendadas)
2. Veja [Features Avançadas - Event Jobs](./05-features-avancadas.md#2-event-jobs-handlers-de-eventos)
3. Leia sobre sincronização com [Redis (RedLock)](./05-features-avancadas.md#7-redis-controle-de-background-services)

### Quero usar Redis
1. Leia [Features Avançadas - Redis e Background Services](./05-features-avancadas.md#7-redis-controle-de-background-services)
2. Redis é usado automaticamente para sincronizar Cron Jobs e Event Handlers
3. Você também pode usá-lo para cache opcional

### Quero transações no banco de dados
1. Leia [Features Avançadas - Transações](./05-features-avancadas.md#8-transações-com-prisma)

---

## Arquitetura Recomendada

```
src/
├── application/              # Use Cases, Mappers
│   ├── jobs/                # Cron Jobs
│   └── events/              # Event Handlers
├── core/                    # Configurações
│   ├── env.ts              # Variáveis de ambiente
│   └── constants/          # Constantes
├── domain/                  # Lógica de Negócio
│   ├── entities/           # Modelos de domínio
│   ├── dtos/              # Data Transfer Objects
│   ├── repositories/      # Interfaces
│   └── services/          # Lógica de negócio
├── host/                   # Web Layer
│   ├── controllers/        # REST Controllers
│   ├── security/          # Guards, Strategies
│   └── app.module.ts
├── infra/                  # Implementações
│   ├── database/
│   ├── repositories/      # Implementações
│   └── services/
└── main.ts                # Bootstrap
```

---

## Dicas Rápidas

### Adicione um novo endpoint
```typescript
// 1. Criar DTO
export const CreateItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
})

// 2. Criar serviço
@Injectable()
export class ItemService {
  async create(data: CreateItemDto): Promise<ItemEntity> {
    return this.repository.create(data)
  }
}

// 3. Criar controller
@Controller('items')
export class ItemController {
  @Post()
  async create(@Body() body: unknown) {
    const data = CreateItemSchema.parse(body)
    return this.service.create(data)
  }
}
```

### Valide dados automaticamente
```typescript
// Zod erro é capturado automaticamente pelo ZodErrorsFilter
CreateItemSchema.parse(data) // Lança ZodError se inválido
```

### Trate erros com segurança
```typescript
throw new ConflictError('Item já existe')
// Retorna automaticamente: 409 Conflict
// Loga automaticamente
```

### Processe eventos assincronamente
```typescript
this.eventEmitter.emit('item:created', itemData)
// Um handler assincrono processa sem bloquear
```

---

## Recursos Externos

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Zod Documentation](https://zod.dev)
- [Swagger/OpenAPI](https://swagger.io)

---

## Changelog

**v1.16.2**
- Suporte completo para NestJS 11
- Novo decorador @Upload
- Melhorias em CORS
- Documentação expandida

---

## Precisa de Ajuda?

1. Consulte a documentação específica do tópico
2. Verifique os exemplos práticos
3. Abra uma issue no repositório

---

<p align="center">
  Documentação criada para desenvolvedores
</p>
