# Exemplo Prático: CRUD de Usuários

Vamos criar um exemplo completo seguindo a estrutura DDD utilizada pela biblioteca.

> Este exemplo segue a estrutura do projeto em `apps/example`. Recomendamos consultar esse projeto para ver a implementação real completa.

## 1. Definir Entidade (Domain)

A entidade estende `EntityBase` e usa AutoMap para mapeamento automático:

```typescript
// src/domain/entities/user/user.ts
import { EntityBase } from '@koalarx/nest/core/database/entity.base'
import { Entity } from '@koalarx/nest/core/database/entity.decorator'
import { AutoMap } from '@koalarx/nest/core/mapping/auto-mapping.decorator'

@Entity()
export class User extends EntityBase<User> {
  @AutoMap()
  id: number

  @AutoMap()
  name: string

  @AutoMap()
  email: string

  @AutoMap()
  active: boolean
}
```

## 2. Criar DTOs (Application)

Crie classes de Request (entrada) herdando de `PersistUserRequest` para reutilização:

```typescript
// src/application/user/common/persist-user.request.ts
import { AutoMap } from '@koalarx/nest/core/mapping/auto-mapping.decorator'
import { ApiProperty } from '@nestjs/swagger'

export class PersistUserRequest {
  @ApiProperty({ example: 'John Doe' })
  @AutoMap()
  name: string

  @ApiProperty({ example: 'john@example.com' })
  @AutoMap()
  email: string

  @ApiProperty({ example: true })
  @AutoMap()
  active: boolean
}
```

```typescript
// src/application/user/create/create-user.request.ts
export class CreateUserRequest extends PersistUserRequest {}
```

```typescript
// src/application/user/create/create-user.response.ts
import { CreatedRegistreWithIdResponse } from '@koalarx/nest/core/controllers/created-registre-response.base'

export class CreateUserResponse extends CreatedRegistreWithIdResponse {}
```

## 3. Criar Abstração de Repositório (Domain)

Use `abstract class` em vez de interface para que funcione corretamente com a injeção de dependência do NestJS:

```typescript
// src/domain/repositories/iuser.repository.ts
import { ListResponseBase } from '@koalarx/nest/core/controllers/list-response.base'
import { User } from '../entities/user/user'

export abstract class IUserRepository {
  abstract save(user: User): Promise<User>
  abstract read(id: number): Promise<User | null>
  abstract readMany(query: any): Promise<ListResponseBase<User>>
  abstract delete(id: number): Promise<void>
}
```

> **Nota**: Use `abstract class` em vez de `interface` para permitir que o NestJS resolva corretamente as dependências durante a injeção.

## 4. Implementar Repositório (Infra)

O repositório estende `RepositoryBase` que fornece operações CRUD automáticas:

```typescript
// src/infra/database/repositories/user.repository.ts
import { Injectable, Inject } from '@nestjs/common'
import { RepositoryBase } from '@koalarx/nest/core/database/repository.base'
import { PRISMA_TOKEN } from '@koalarx/nest/core/koala-nest-database.module'
import { ListResponseBase } from '@koalarx/nest/core/controllers/list-response.base'
import { CreatedRegistreWithIdResponse } from '@koalarx/nest/core/controllers/created-registre-response.base'
import { Prisma } from '@prisma/client'
import { User } from '../../domain/entities/user/user'
import { IUserRepository } from '../../domain/repositories/iuser.repository'
import { DbTransactionContext } from '../db-transaction-context'

@Injectable()
export class UserRepository
  extends RepositoryBase<User>
  implements IUserRepository
{
  constructor(
    @Inject(PRISMA_TOKEN)
    prisma: DbTransactionContext,
  ) {
    super({
      modelName: User,
      context: prisma,
      // Incluir relacionamentos se existirem
      include: {
        // phones: true,
        // address: true,
      },
    })
  }

  async save(user: User): Promise<CreatedRegistreWithIdResponse | null> {
    return this.saveChanges(user)
  }

  read(id: number): Promise<User | null> {
    return this.findById(id)
  }

  readMany(query: any): Promise<ListResponseBase<User>> {
    return this.findManyAndCount<Prisma.UserWhereInput>(
      {
        name: {
          contains: query.name,
        },
        active: query.active,
      },
      query,
    )
  }

  delete(id: number): Promise<void> {
    return this.remove<Prisma.UserWhereUniqueInput>({ id })
  }
}
```

> **Importante**: A classe estende `RepositoryBase<User>` que fornece os métodos CRUD automaticamente, implementando `IUserRepository`. O `PRISMA_TOKEN` é injetado do módulo Koala Nest.

## 5. Criar Validador (Application)

O validador estende `RequestValidatorBase` e usa Zod para validação:

```typescript
// src/application/user/create/create-user.validator.ts
import { RequestValidatorBase } from '@koalarx/nest/core/request-overflow/request-validator.base'
import { z, ZodType, ZodTypeDef } from 'zod'
import { CreateUserRequest } from './create-user.request'

export class CreateUserValidator extends RequestValidatorBase<CreateUserRequest> {
  protected get schema(): ZodType<any, ZodTypeDef, any> {
    return z.object({
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Valid email is required'),
      active: z.boolean().default(true),
    })
  }
}
```

> **Importante**: O validador estende `RequestValidatorBase` que integra a validação Zod automaticamente. A validação ocorre quando `RequestValidatorBase.validate()` é chamado.

## 6. Criar Handler (Application)

Handler é o responsável pela lógica da use case, estendendo `RequestHandlerBase`:

```typescript
// src/application/user/create/create-user.handler.ts
import { Injectable } from '@nestjs/common'
import { AutoMappingService } from '@koalarx/nest/core/mapping/auto-mapping.service'
import { RequestHandlerBase } from '@koalarx/nest/core/request-overflow/request-handler.base'
import { ok, RequestResult } from '@koalarx/nest/core/request-overflow/request-result'
import { User } from '@/domain/entities/user/user'
import { IUserRepository } from '@/domain/repositories/iuser.repository'
import { CreateUserRequest } from './create-user.request'
import { CreateUserResponse } from './create-user.response'
import { CreateUserValidator } from './create-user.validator'

@Injectable()
export class CreateUserHandler extends RequestHandlerBase<
  CreateUserRequest,
  RequestResult<Error, CreateUserResponse>
> {
  constructor(
    private readonly mapper: AutoMappingService,
    private readonly repository: IUserRepository,
  ) {
    super()
  }

  async handle(
    req: CreateUserRequest,
  ): Promise<RequestResult<Error, CreateUserResponse>> {
    // Validar dados da requisição
    const validated = new CreateUserValidator(req).validate()

    // Mapear Request para Entity
    const user = this.mapper.map(
      validated,
      CreateUserRequest,
      User,
    )

    // Salvar no repositório
    const result = await this.repository.save(user)
    
    return ok({ id: result.id })
  }
}
```

> **Nota**: O método `validate()` do `RequestValidatorBase` valida usando o schema Zod definido e lança exceção se inválido.

## 6.1. Configurar Mapeamento Automático (Application)

Crie um perfil de mapeamento para configurar as transformações entre Request, Entity e Response:

```typescript
// src/application/mapping/mapping.profile.ts
import { User } from '@/domain/entities/user/user'
import { createMap } from '@koalarx/nest/core/mapping/create-map'
import { MappingProfile } from '@koalarx/nest/core/mapping/mapping-profile'
import {
  CreateUserRequest,
  CreateUserResponse,
} from '../user/create/create-user.request'

export class MappingProfile extends MappingProfile {
  constructor() {
    super()
    this.createMap()
  }

  createMap() {
    // Mapear Request para Entity
    createMap(CreateUserRequest, User)
    
    // Mapear Entity para Response
    createMap(User, CreateUserResponse)
  }
}
```

> **Importante**: O `MappingProfile` é registrado no `ControllerModule` via `KoalaNestHttpModule.register()`. Isso permite que `AutoMappingService` funcione corretamente.

## 7. Criar Controller

Controller implementa `IController` e delega ao Handler. Usa `ROUTER_CONFIG` para configuração centralizada:

```typescript
// src/host/controllers/user/router.config.ts
export const USER_ROUTER_CONFIG = {
  path: 'users',
}
```

```typescript
// src/host/controllers/user/create-user.controller.ts
import { CreateUserHandler } from '@/application/user/create/create-user.handler'
import { CreateUserRequest } from '@/application/user/create/create-user.request'
import { CreateUserResponse } from '@/application/user/create/create-user.response'
import { IController } from '@koalarx/nest/core/controllers/base.controller'
import { Controller } from '@koalarx/nest/core/controllers/controller.decorator'
import { Body, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ApiCreatedResponse } from '@nestjs/swagger'
import { USER_ROUTER_CONFIG } from './router.config'

@Controller(USER_ROUTER_CONFIG)
export class CreateUserController
  implements IController<CreateUserRequest, CreateUserResponse>
{
  constructor(private readonly handler: CreateUserHandler) {}

  @Post()
  @ApiCreatedResponse({ type: CreateUserResponse })
  @HttpCode(HttpStatus.CREATED)
  async handle(
    @Body() request: CreateUserRequest,
  ): Promise<CreateUserResponse> {
    const response = await this.handler.handle(request)

    if (response.isFailure()) {
      throw response.value
    }

    return response.value
  }
}
```

> **Importante**: 
> - Request/Response são importados de `@/application/user/create/` (não domain)
> - Use `@Controller(ROUTER_CONFIG)` com configuração centralizada
> - Sempre verificar `response.isFailure()` antes de retornar o resultado

## 8. Criar Módulo de Controlador

O módulo de controlador importa `ControllerModule` que configura o mapeamento automático:

```typescript
// src/host/controllers/controller.module.ts
import { MappingProfile } from '@/application/mapping/mapping.profile'
import { InfraModule } from '@/infra/infra.module'
import { KoalaNestHttpModule } from '@koalarx/nest/core/koala-nest-http.module'
import { Module } from '@nestjs/common'

@Module({
  imports: [
    KoalaNestHttpModule.register({
      imports: [InfraModule],
      automapperProfile: MappingProfile,
      middlewares: [],
    }),
  ],
  exports: [KoalaNestHttpModule],
})
export class ControllerModule {}
```

```typescript
// src/host/controllers/user/user.module.ts
import { CreateUserHandler } from '@/application/user/create/create-user.handler'
import { DeleteUserHandler } from '@/application/user/delete/delete-user.handler'
import { Module } from '@nestjs/common'
import { ControllerModule } from '../controller.module'
import { CreateUserController } from './create-user.controller'
import { DeleteUserController } from './delete-user.controller'

@Module({
  imports: [ControllerModule],
  controllers: [CreateUserController, DeleteUserController],
  providers: [CreateUserHandler, DeleteUserHandler],
  exports: [ControllerModule],
})
export class UserModule {}
```

> **Importante**: O módulo de controlador importa `ControllerModule` que configura `KoalaNestHttpModule` com o perfil de mapeamento automático.

## 9. Configurar AppModule

```typescript
// src/host/app.module.ts
import { Module } from '@nestjs/common'
import { KoalaNestModule } from '@koalarx/nest/core/koala-nest.module'
import { env } from '@/core/env'
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

## 10. Executar

```bash
npm run start:dev
```

Acesse:
- API: `http://localhost:3000/users`
- Documentação: `http://localhost:3000/doc`

## Fluxo de Requisição

```
Controller
  └─ recebe Request
     └─ delega para Handler
        └─ valida com Validator (Zod schema)
           └─ mapeia Request → Entity (MappingProfile)
              └─ salva no Repositório
                 └─ retorna ok(Response)
        └─ Controller verifica isFailure()
           └─ retorna Response ou lança erro
```

## Arquivos Estruturados

```
src/
├── application/
│   ├── mapping/
│   │   └── mapping.profile.ts
│   └── user/
│       ├── common/
│       │   └── persist-user.request.ts
│       └── create/
│           ├── create-user.handler.ts
│           ├── create-user.request.ts
│           ├── create-user.response.ts
│           └── create-user.validator.ts
├── domain/
│   ├── entities/
│   │   └── user/
│   │       └── user.ts
│   └── repositories/
│       └── iuser.repository.ts
├── host/
│   ├── app.module.ts
│   └── controllers/
│       ├── controller.module.ts
│       └── user/
│           ├── create-user.controller.ts
│           ├── router.config.ts
│           └── user.module.ts
├── infra/
│   ├── infra.module.ts
│   └── database/
│       ├── db-transaction-context.ts
│       └── repositories/
│           └── user.repository.ts
└── core/
    └── env.ts
```

## Próximas Etapas

1. Adicione mais controllers (Read, Update, Delete)
2. Implemente Cron Jobs para tarefas agendadas
3. Configure Event Handlers para reações a eventos
4. Use Guards para autenticação e autorização

## 10. Executar

```bash
npm run start:dev
```

Acesse:
- API: `http://localhost:3000/users`
- Documentação: `http://localhost:3000/doc`

## Fluxo de Requisição

```
Controller
  └─ valida e recebe Request
     └─ chama Handler
        └─ valida dados com Validator
           └─ mapeia Request → Entity
              └─ salva no Repositório
                 └─ retorna ok(Response)
        └─ Controller retorna Response ou erro
```

## Arquivos Estruturados

```
src/
├── application/
│   └── user/
│       └── create/
│           ├── create-user.handler.ts
│           ├── create-user.request.ts
│           ├── create-user.response.ts
│           └── create-user.validator.ts
├── domain/
│   ├── dtos/
│   │   └── user/
│   │       └── create-user.request.ts
│   ├── entities/
│   │   └── user/
│   │       └── user.ts
│   └── repositories/
│       └── iuser.repository.ts
├── host/
│   ├── app.module.ts
│   └── controllers/
│       └── user/
│           ├── create-user.controller.ts
│           └── user.module.ts
├── infra/
│   └── repositories/
│       └── user.repository.ts
└── core/
    └── env.ts
```

## Próximas Etapas

1. Adicione mais controllers (Read, Update, Delete)
2. Implemente Cron Jobs para tarefas agendadas
3. Configure Event Handlers para reações a eventos
4. Use Guards para autenticação e autorização
