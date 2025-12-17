# Features Avançadas

## 1. Cron Jobs (Tarefas Agendadas)

Execute tarefas em intervalos regulares com sincronização via Redis/RedLock.

### Criar um Cron Job

```typescript
// src/application/person/create-person-job/create-person-job.ts
import { Injectable } from '@nestjs/common'
import {
  CronJobHandlerBase,
  CronJobResponse,
  CronJobSettings,
} from '@koalarx/nest/core/backgroud-services/cron-service/cron-job.handler.base'
import { EventQueue } from '@koalarx/nest/core/backgroud-services/event-service/event-queue'
import { ok } from '@koalarx/nest/core/request-overflow/request-result'
import { ILoggingService } from '@koalarx/nest/services/logging/ilogging.service'
import { IRedLockService } from '@koalarx/nest/services/redlock/ired-lock.service'
import { Injectable } from '@nestjs/common'
import { CreatePersonHandler } from '../create/create-person.handler'
import { InactivePersonEvent } from '../events/inactive-person/inactive-person-event'
import { IPersonRepository } from '@/domain/repositories/iperson.repository'

@Injectable()
export class CreatePersonJob extends CronJobHandlerBase {
  constructor(
    redlockService: IRedLockService,
    loggingService: ILoggingService,
    private readonly createPerson: CreatePersonHandler,
    private readonly repository: IPersonRepository,
  ) {
    super(redlockService, loggingService)
  }

  // Configurações do job (intervalo de execução)
  protected async settings(): Promise<CronJobSettings> {
    return {
      isActive: true,
      timeInMinutes: 1, // Executa a cada 1 minuto (use 1440 para 24 horas)
    }
  }

  // Lógica principal do job
  protected async run(): Promise<CronJobResponse> {
    const result = await this.createPerson.handle({
      name: 'John Doe',
      phones: [{ phone: '22999999999' }],
      address: { address: 'Street 1' },
    })

    if (result.isOk()) {
      const person = await this.repository.read(result.value.id)

      if (person) {
        // Emitir eventos para handlers processar
        const jobs = new PersonEventJob()
        jobs.addEvent(new InactivePersonEvent())
        EventQueue.dispatchEventsForAggregate(jobs._id)
      }

      console.log('Person created with id:', result.value.id)
    } else {
      console.error('Error creating person:', result.value)
    }

    // Sempre retorna ok(null) - erros são logados, não falham o job
    return ok(null)
  }
}
```

### Registrar Cron Job

**1. No `AppModule`, passe os jobs via `cronJobs`:**

```typescript
// src/host/app.module.ts
import { CreatePersonJob } from '@/application/person/create-person-job/create-person-job'
import { DeleteInactiveJob } from '@/application/person/delete-inative-job/delete-inactive-job'
import { env } from '@/core/env'
import { KoalaNestModule } from '@koalarx/nest/core/koala-nest.module'
import { Module } from '@nestjs/common'
import { PersonModule } from './controllers/person/person.module'

@Module({
  imports: [
    KoalaNestModule.register({
      env,
      controllers: [PersonModule],
      cronJobs: [DeleteInactiveJob, CreatePersonJob],  // Registrar jobs
    }),
  ],
})
export class AppModule {}
```

**2. No arquivo `main.ts`, adicione o job usando `.addCronJob()`:**

```typescript
// src/main.ts
import { CreatePersonJob } from '@/application/person/create-person-job/create-person-job'
import { DeleteInactiveJob } from '@/application/person/delete-inative-job/delete-inactive-job'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  
  await new KoalaApp(app)
    .useDoc({
      ui: 'scalar',
      endpoint: '/doc',
      title: 'API de Demonstração',
      version: '1.0',
    })
    .addCronJob(CreatePersonJob)      // Registrar primeiro job
    .addCronJob(DeleteInactiveJob)    // Registrar segundo job
    .enableCors()
    .buildAndServe()
}

bootstrap()
```

**Nota sobre RedLock:** Os Cron Jobs utilizam `IRedLockService` (que depende de Redis) para garantir que apenas uma instância execute o job simultaneamente em ambientes distribuídos. Certifique-se de configurar a `REDIS_URL` no arquivo `.env` para ambientes com múltiplas instâncias.

## 2. Event Jobs (Handlers de Eventos)

Processe eventos de forma assincronizada usando o padrão EventJob com handlers especializados.

### Criar uma Classe de Evento

Eventos devem estender `EventClass`:

```typescript
// src/application/person/events/inactive-person/inactive-person-event.ts
import { EventClass } from '@koalarx/nest/core/backgroud-services/event-service/event-class'

export class InactivePersonEvent extends EventClass {}
```

### Criar um Event Handler

Handler estende `EventHandlerBase` e processa eventos:

```typescript
// src/application/person/events/inactive-person/inactive-person-handler.ts
import { ReadManyPersonDto } from '@/domain/dtos/read-many-person.dto'
import { IPersonRepository } from '@/domain/repositories/iperson.repository'
import { EventHandlerBase } from '@koalarx/nest/core/backgroud-services/event-service/event-handler.base'
import { Injectable } from '@nestjs/common'
import { InactivePersonEvent } from './inactive-person-event'

@Injectable()
export class InactivePersonHandler extends EventHandlerBase {
  constructor(private readonly repository: IPersonRepository) {
    super(InactivePersonEvent) // Especifica qual evento processa
  }

  async handleEvent(): Promise<void> {
    // handleEvent() é chamado quando eventos estão na fila
    const result = await this.repository.readMany(
      new ReadManyPersonDto({ active: true }),
    )

    for (const person of result.items) {
      person.active = false
      await this.repository.save(person)
    }

    console.log(
      'InactivePersonHandler: Registros ativos inativados com sucesso!',
    )
  }
}
```

### Criar EventJob para Agrupar Handlers

A classe `EventJob` agrupa handlers relacionados a uma entidade:

```typescript
// src/application/person/events/person-event-job.ts
import { Person } from '@/domain/entities/person/person'
import { EventHandlerBase } from '@koalarx/nest/core/backgroud-services/event-service/event-handler.base'
import { EventJob } from '@koalarx/nest/core/backgroud-services/event-service/event-job'
import { Type } from '@nestjs/common'
import { InactivePersonHandler } from './inactive-person/inactive-person-handler'

export class PersonEventJob extends EventJob<Person> {
  defineHandlers(): Type<EventHandlerBase>[] {
    return [InactivePersonHandler]
  }
}
```

### Registrar Event Handler

**1. No `AppModule`, passe os handlers via `eventJobs`:**

```typescript
// src/host/app.module.ts
import { InactivePersonHandler } from '@/application/person/events/inactive-person/inactive-person-handler'
import { env } from '@/core/env'
import { KoalaNestModule } from '@koalarx/nest/core/koala-nest.module'
import { Module } from '@nestjs/common'
import { PersonModule } from './controllers/person/person.module'

@Module({
  imports: [
    KoalaNestModule.register({
      env,
      controllers: [PersonModule],
      eventJobs: [InactivePersonHandler],  // Registrar handlers
    }),
  ],
})
export class AppModule {}
```

**2. No arquivo `main.ts`, adicione o handler usando `.addEventJob()`:**

```typescript
// src/main.ts
import { InactivePersonHandler } from '@/application/person/events/inactive-person/inactive-person-handler'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  
  await new KoalaApp(app)
    .useDoc({
      ui: 'scalar',
      endpoint: '/doc',
      title: 'API de Demonstração',
      version: '1.0',
    })
    .addEventJob(InactivePersonHandler)  // Registrar event handler
    .setAppName('example')
    .setInternalUserName('integration.bot')
    .setDbTransactionContext(DbTransactionContext)
    .enableCors()
    .buildAndServe()
}

bootstrap()
```

**Resumo de Registro:**
- Event Handlers são registrados em **duas** etapas:
  1. **AppModule**: Via `eventJobs: [InactivePersonHandler]` em `KoalaNestModule.register()`
  2. **main.ts**: Via `.addEventJob(InactivePersonHandler)` em `KoalaApp`
- A EventJob agrupa handlers por entidade (PersonEventJob agrupa InactivePersonHandler)
- Múltiplos handlers podem ser registrados na mesma aplicação

## Fluxo de Eventos

```
Cron Job executa
  └─ Processa lógica
     └─ Emite evento via EventQueue.dispatchEventsForAggregate()
        └─ EventJob localiza handlers
           └─ Event Handler processa evento
              └─ handleEvent() é chamado
                 └─ Lógica de negócio executada
```

## Quando Usar Events

- **Background Sync**: Use Event Handlers para processar eventos de forma assincronizada
- **Async Escalável**: EventQueue é sincronizado via Redis (RedLock) em ambientes distribuídos
- **Agregados**: Agrupe múltiplos handlers em uma EventJob para organizar processamento por entidade

## 3. Guards (Proteção de Rotas)

Proteja seus endpoints com Guards do NestJS usando Passport Strategies. O `@koalarx/nest` fornece o decorador `@IsPublic()` para rotas públicas.

### Criar Estratégia JWT

Crie uma estratégia customizada para validar tokens JWT:

```typescript
// src/host/security/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-custom'
import { jwtDecode } from 'jwt-decode'
import { IUserRepository } from '@/domain/repositories/iuser.repository'

export type DoneFn = (err: Error | null, user?: any) => void

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly userRepository: IUserRepository) {
    super()
  }

  async validate(request: any, done: DoneFn) {
    const token = request.headers?.authorization?.replace('Bearer ', '')

    if (token) {
      try {
        const decodedToken = jwtDecode(token) as any

        // Validar expiração
        if (decodedToken.exp * 1000 < Date.now()) {
          done(new UnauthorizedException('Token expirado'))
          return
        }

        // Buscar usuário no banco
        const user = await this.userRepository.findByEmail(decodedToken.email)

        if (user) {
          done(null, user)
        } else {
          done(new UnauthorizedException('Usuário não encontrado'))
        }
      } catch {
        done(new UnauthorizedException('Token inválido'))
      }
    } else {
      done(new UnauthorizedException('Token não fornecido'))
    }
  }
}
```

### Criar Guard de Autenticação com JWT e API Key

```typescript
// src/host/security/guards/auth.guard.ts
import { Injectable } from '@nestjs/common'
import { ExecutionContext } from '@nestjs/common'
import { AuthGuard as NestAuthGuard } from '@nestjs/passport'
import { Reflector } from '@nestjs/core'
import { IS_PUBLIC_KEY } from '@koalarx/nest/decorators/is-public.decorator'

@Injectable()
export class AuthGuard extends NestAuthGuard(['jwt', 'api-key']) {
  constructor(public readonly reflector: Reflector) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    )

    const request = context.switchToHttp().getRequest()

    // Se rota é pública e não há header de autenticação, permitir
    if (
      isPublic &&
      !request.headers.authorization &&
      !request.headers['x-api-key']
    ) {
      return true
    }

    // Aplicar estratégia JWT ou API Key
    const canActivate = super.canActivate(context)

    if (typeof canActivate === 'boolean') {
      return canActivate
    }

    return canActivate as Promise<boolean>
  }
}
```

### Guard de Autorização (Perfis)

Para autorização por perfil de usuário:

```typescript
// src/host/security/guards/profiles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { UserProfileEnum } from '@/domain/entities/user/enums/user-profile.enum'

@Injectable()
export class ProfilesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obter perfis requeridos do metadata
    const requiredProfiles = this.reflector.get<UserProfileEnum[]>(
      'profiles',
      context.getHandler(),
    )

    if (!requiredProfiles || requiredProfiles.length === 0) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const user = request.user

    // Verificar se usuário possui um dos perfis requeridos
    return requiredProfiles.includes(user?.profile)
  }
}
```

### Criar Decorador Customizado

```typescript
// src/host/decorators/restriction-by-profile.decorator.ts
import { SetMetadata } from '@nestjs/common'
import { UserProfileEnum } from '@/domain/entities/user/enums/user-profile.enum'

export const RestrictByProfile = (profiles: UserProfileEnum[]) =>
  SetMetadata('profiles', profiles)
```

### Estratégia de Autenticação com API Key

Para suportar autenticação via API Key, estenda a classe base da biblioteca:

```typescript
// src/core/security/strategies/api-key.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ApiKeyStrategyBase } from '@koalarx/nest/core/security/strategies/api-key.strategy'
import { Request } from 'express'

export type DoneFn = (err: Error | null, user?: any) => void

@Injectable()
export class ApiKeyStrategy extends ApiKeyStrategyBase {
  constructor(private readonly jwtService: JwtService) {
    super({ header: 'x-api-key' })
  }

  async validate(apikey: string, done: DoneFn, request: Request) {
    try {
      // Validar API Key usando JWT com chave pública
      const publicKey = process.env.JWT_PUBLIC_KEY
        ? Buffer.from(process.env.JWT_PUBLIC_KEY, 'base64')
        : undefined

      const user = await this.jwtService.verifyAsync(apikey, {
        algorithms: ['RS256'],
        publicKey,
      })

      done(null, user)
    } catch {
      done(new UnauthorizedException('API Key inválida ou expirada'))
    }
  }
}
```

### Registrar Estratégia e Guards

Crie um módulo de segurança com suporte a JWT e API Key:

```typescript
// src/host/security/security.module.ts
import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { JwtStrategy } from './strategies/jwt.strategy'
import { ApiKeyStrategy } from '@/core/security/strategies/api-key.strategy'
import { InfraModule } from '@/infra/infra.module'

@Module({
  imports: [
    InfraModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [JwtStrategy, ApiKeyStrategy],
})
export class SecurityModule {}
```

### Registrar Guards Globalmente

```typescript
// src/host/main.ts
import { AuthGuard } from './security/guards/auth.guard'
import { ProfilesGuard } from './security/guards/profiles.guard'

await new KoalaApp(app)
  .addGlobalGuard(AuthGuard)        // Guard de autenticação
  .addGlobalGuard(ProfilesGuard)    // Guard de autorização
  .buildAndServe()
```

### Usar em Controllers

```typescript
// src/host/controllers/person/person.controller.ts
import { IsPublic } from '@koalarx/nest/decorators/is-public.decorator'
import { RestrictByProfile } from '@/host/decorators/restriction-by-profile.decorator'
import { UserProfileEnum } from '@/domain/entities/user/enums/user-profile.enum'

@Controller('persons')
export class PersonController {
  @Post('login')
  @IsPublic()
  async login(@Body() credentials: LoginDto) {
    // Acesso público - sem autenticação
    return { token: 'jwt-token' }
  }

  @Get()
  async list() {
    // Requer autenticação (JWT)
    return { items: [] }
  }

  @Delete(':id')
  @RestrictByProfile([UserProfileEnum.ADMIN])
  async delete(@Param('id') id: number) {
    // Requer autenticação + perfil ADMIN
    return { success: true }
  }
}
```

## 4. Documentação Swagger/Scalar

Configure a documentação automática da API usando Swagger ou Scalar.

### Configuração Básica

No seu arquivo `main.ts`, use `.useDoc()`:

```typescript
// src/host/main.ts
await new KoalaApp(app)
  .useDoc({
    ui: 'scalar',           // 'swagger' ou 'scalar'
    endpoint: '/doc',
    title: 'API de Demonstração',
    version: '1.0',
  })
  .buildAndServe()
```

### Com Servidores Adicionais

```typescript
.useDoc({
  ui: 'scalar',
  endpoint: '/doc',
  title: 'My API',
  version: '1.0.0',
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local development',
    },
    {
      url: 'https://api.example.com',
      description: 'Production',
    },
  ],
})
```

### Com Autenticação Bearer

```typescript
.useDoc({
  ui: 'scalar',
  endpoint: '/doc',
  title: 'My API',
  version: '1.0.0',
  authorizations: [
    {
      name: 'bearer',
      config: {
        type: 'http',
        scheme: 'bearer',
      },
    },
  ],
})
```

## 5. CORS (Cross-Origin Requests)

Habilite requisições cross-origin com um único método:

```typescript
// src/host/main.ts
await new KoalaApp(app)
  .enableCors()
  .buildAndServe()
```

**Configuração padrão aplicada:**
- `credentials: true` - Permite cookies
- `origin: true` - Aceita qualquer origem
- `optionsSuccessStatus: 200` - Status de sucesso para preflight

## 6. Validação com Zod

Valide dados automaticamente usando Zod integrado ao `RequestValidatorBase`.

### Definir Schema Zod

```typescript
// src/application/person/create/create-person.request.ts
import { z } from 'zod'

export const CreatePersonSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  active: z.boolean().default(true),
})

export type CreatePersonRequest = z.infer<typeof CreatePersonSchema>
```

### Usar em Validator

```typescript
// src/application/person/create/create-person.validator.ts
import { Injectable } from '@nestjs/common'
import { RequestValidatorBase } from '@koalarx/nest/core/request-handler/request-validator.base'
import { CreatePersonSchema, CreatePersonRequest } from './create-person.request'

@Injectable()
export class CreatePersonValidator extends RequestValidatorBase<CreatePersonRequest> {
  protected get schema() {
    return CreatePersonSchema
  }
}
```

### Erros de Validação

Erros Zod são capturados automaticamente pelo `ZodErrorsFilter`:

```typescript
// src/host/main.ts - O filter já está registrado automaticamente
// Erros Zod retornam Status 400 com detalhes dos campos inválidos
```

## 7. Redis (Sincronização de Background Services)

Redis é essencial para sincronizar `CronJobs` e `EventHandlers` em ambientes distribuídos usando **RedLock**.

### Como Funciona

- **RedLock**: Distributed locking que garante apenas uma instância execute cada job
- **Cron Jobs**: Sincronizam via RedLock para execução única por intervalo
- **Event Handlers**: Usam Redis para coordenação entre instâncias

### Configurar Redis

Defina em `.env`:

```env
REDIS_URL=redis://localhost:6379
```

### Usar Redis para Cache (Opcional)

Além do controle de jobs, use Redis para cache:

```typescript
// src/services/cache.service.ts
import { Injectable } from '@nestjs/common'
import { IRedisService } from '@koalarx/nest/services/redis/iredis.service'

@Injectable()
export class CacheService {
  constructor(private readonly redisService: IRedisService) {}

  async set(key: string, value: any, expiresIn: number = 3600): Promise<void> {
    await this.redisService.set(key, JSON.stringify(value), 'EX', expiresIn)
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redisService.get(key)
    return value ? JSON.parse(value) : null
  }

  async delete(key: string): Promise<void> {
    await this.redisService.del(key)
  }
}
```

**Nota importante:** Redis é essencial quando rodando múltiplas instâncias da aplicação. Sem Redis, CronJobs executarão em paralelo em todos os servidores!

## 8. Transações com Prisma

Execute múltiplas operações de banco em uma transação atômica através do repositório.

### Implementar DbTransactionContext

```typescript
// src/infra/database/db-transaction-context.ts
import { PrismaTransactionalClient } from '@koalarx/nest/core/database/prisma-transactional-client'
import { Prisma } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'

export class DbTransactionContext
  extends PrismaTransactionalClient
  implements PrismaClientWithCustomTransaction
{
  get person(): Prisma.PersonDelegate<DefaultArgs> {
    return this.transactionalClient.person
  }

  get personPhone(): Prisma.PersonPhoneDelegate<DefaultArgs> {
    return this.transactionalClient.personPhone
  }

  get personAddress(): Prisma.PersonAddressDelegate<DefaultArgs> {
    return this.transactionalClient.personAddress
  }
}
```

### Injetar DbTransactionContext no Repositório

```typescript
// src/infra/database/repositories/person.repository.ts
import { PRISMA_TOKEN } from '@koalarx/nest/core/koala-nest-database.module'
import { RepositoryBase } from '@koalarx/nest/core/database/repository.base'
import { Inject, Injectable } from '@nestjs/common'
import { DbTransactionContext } from '../db-transaction-context'

@Injectable()
export class PersonRepository
  extends RepositoryBase<Person>
  implements IPersonRepository
{
  constructor(
    @Inject(PRISMA_TOKEN)
    prisma: DbTransactionContext,
  ) {
    super({
      modelName: Person,
      context: prisma,
      include: {
        phones: true,
        address: true,
      },
    })
  }

  // Os métodos herdados de RepositoryBase já usam transações automaticamente
  async save(person: Person): Promise<CreatedRegistreWithIdResponse | null> {
    return this.saveChanges(person)  // Transação automática
  }

  read(id: number): Promise<Person | null> {
    return this.findById(id)
  }
}
```

### Registrar no KoalaApp

```typescript
// src/host/main.ts
await new KoalaApp(app)
  .setDbTransactionContext(DbTransactionContext)
  .buildAndServe()
```

As transações são executadas **automaticamente** pelo `RepositoryBase` quando você usa métodos como `saveChanges()`, `remove()` e outras operações de escrita. Múltiplas operações dentro do repositório são garantidas como atômicas.

## 9. Variáveis Globais

Acesse informações globais configuradas na inicialização da aplicação.

### Configurar no main.ts

```typescript
// src/host/main.ts
await new KoalaApp(app)
  .setAppName('example')
  .setInternalUserName('integration.bot')
  .buildAndServe()
```

### Acessar em Qualquer Lugar

```typescript
import { KoalaGlobalVars } from '@koalarx/nest/core/koala-global-vars'

// Em qualquer componente
console.log(KoalaGlobalVars.appName)          // 'example'
console.log(KoalaGlobalVars.internalUserName) // 'integration.bot'
```

## 10. Ngrok (Exposição Pública em Desenvolvimento)

Exponha sua aplicação local na internet para testes ou webhooks.

### Configurar Token Ngrok

```env
# .env
NGROK_AUTH_TOKEN=seu_token_aqui
```

### Usar no main.ts

```typescript
// src/host/main.ts
await new KoalaApp(app)
  .useNgrok(process.env.NGROK_AUTH_TOKEN!)
  .buildAndServe()
```

A URL pública do ngrok será exibida no console durante a inicialização da aplicação.
