# Documentação Completa - Exemplo de Aplicação com Koala Libs

Esta documentação descreve a arquitetura e implementação de uma API REST completa usando a biblioteca **@koalarx/nest**, seguindo o padrão **DDD (Domain-Driven Design)**.

## 📋 Tabela de Conteúdos

1. [Visão Geral](#visão-geral)
2. [Camada Domain](#camada-domain)
3. [Camada Application](#camada-application)
4. [Camada Host](#camada-host)
5. [Camada Infra](#camada-infra)
6. [Testes](#testes)
7. [Jobs e Eventos](#jobs-e-eventos)

---

## Visão Geral

A aplicação exemplo demonstra um **CRUD de Pessoa** com a seguinte estrutura:

- **Domain**: Definição de entidades, DTOs e interfaces de repositório
- **Application**: Handlers que implementam a lógica de negócio
- **Host**: Controllers que expõem endpoints HTTP
- **Infra**: Implementação de repositórios e acesso ao banco de dados
- **Tests**: Testes unitários e E2E

### Fluxo de Requisição

O fluxo padrão de uma operação CRUD segue este padrão:

```
Cliente HTTP → Controller (Host) → Handler (Application) 
→ AutoMapper → Repository (Infra) → Database → Response
```

---

## Camada Domain

A camada **Domain** contém as definições core da aplicação: entidades, DTOs e interfaces de repositório.

### Entidades

As entidades representam os objetos de negócio principais.

#### Person.ts

```typescript
import { EntityBase } from '@koalarx/nest/core/database/entity.base'
import { Entity } from '@koalarx/nest/core/database/entity.decorator'
import { AutoMap } from '@koalarx/nest/core/mapping/auto-mapping.decorator'
import { List } from '@koalarx/nest/core/utils/list'
import { PersonAddress } from './person-address'
import { PersonPhone } from './person-phone'

@Entity()
export class Person extends EntityBase<Person> {
  @AutoMap()
  id: number

  @AutoMap()
  name: string

  @AutoMap({ type: () => List })
  phones = new List(PersonPhone)

  @AutoMap({ type: () => PersonAddress })
  address: PersonAddress

  @AutoMap()
  active: boolean
}
```

**Característica**: A entidade estende `EntityBase` e utiliza o decorador `@AutoMap()` para permitir mapeamento automático.

#### PersonAddress.ts

```typescript
import { EntityBase } from '@koalarx/nest/core/database/entity.base'
import { Entity } from '@koalarx/nest/core/database/entity.decorator'
import { AutoMap } from '@koalarx/nest/core/mapping/auto-mapping.decorator'

@Entity()
export class PersonAddress extends EntityBase<PersonAddress> {
  @AutoMap()
  id: number

  @AutoMap()
  address: string
}
```

#### PersonPhone.ts

```typescript
import { EntityBase } from '@koalarx/nest/core/database/entity.base'
import { Entity } from '@koalarx/nest/core/database/entity.decorator'
import { AutoMap } from '@koalarx/nest/core/mapping/auto-mapping.decorator'

@Entity()
export class PersonPhone extends EntityBase<PersonPhone> {
  @AutoMap()
  id: number

  @AutoMap()
  phone: string
}
```

### DTOs (Data Transfer Objects)

Os DTOs são utilizados para transferência de dados em queries e filtros.

#### ReadManyPersonDto.ts

```typescript
import { PaginatedRequestProps } from '@koalarx/nest/core/controllers/pagination.request'
import { PaginationDto } from '@koalarx/nest/core/dtos/pagination.dto'
import { AutoMap } from '@koalarx/nest/core/mapping/auto-mapping.decorator'

export class ReadManyPersonDto extends PaginationDto {
  @AutoMap()
  name?: string

  @AutoMap()
  active?: boolean

  constructor(props?: PaginatedRequestProps<ReadManyPersonDto>) {
    super()
    Object.assign(this, props)
  }
}
```

### Interface de Repositório

A interface de repositório define o contrato para operações de persistência.

#### IPersonRepository.ts

```typescript
import { ListResponseBase } from '@koalarx/nest/core/controllers/list-response.base'
import { ReadManyPersonDto } from '../dtos/read-many-person.dto'
import { Person } from '../entities/person/person'

export abstract class IPersonRepository {
  abstract save(person: Person): Promise<any>
  abstract read(id: number): Promise<Person | null>
  abstract readMany(query: ReadManyPersonDto): Promise<ListResponseBase<Person>>
  abstract delete(id: number): Promise<void>
}
```

---

## Camada Application

A camada **Application** contém a lógica de negócio através de Handlers, Validators e Mappings.

### Mapeamento (AutoMapping)

O AutoMapping facilita a conversão entre Request, Entity e Response de forma transparente.

#### PersonMapping.ts

```typescript
import { ReadManyPersonDto } from '@/domain/dtos/read-many-person.dto'
import { Person } from '@/domain/entities/person/person'
import { PersonAddress } from '@/domain/entities/person/person-address'
import { PersonPhone } from '@/domain/entities/person/person-phone'
import { createMap } from '@koalarx/nest/core/mapping/create-map'
import {
  CreatePersonAddressRequest,
  CreatePersonPhoneRequest,
  CreatePersonRequest,
} from '../person/create/create-person.request'
import { ReadManyPersonRequest } from '../person/read-many/read-many-person.request'
import {
  ReadPersonAddressResponse,
  ReadPersonPhoneResponse,
  ReadPersonResponse,
} from '../person/read/read-person.response'
import {
  UpdatePersonAddressRequest,
  UpdatePersonPhoneRequest,
  UpdatePersonRequest,
} from '../person/update/update-person.request'

export class PersonMapping {
  static createMap() {
    // Mapeamentos de Create
    createMap(CreatePersonAddressRequest, PersonAddress)
    createMap(CreatePersonPhoneRequest, PersonPhone)
    createMap(CreatePersonRequest, Person)

    // Mapeamentos de Read (Entity para Response)
    createMap(PersonAddress, ReadPersonAddressResponse)
    createMap(PersonPhone, ReadPersonPhoneResponse)
    createMap(Person, ReadPersonResponse)

    // Mapeamentos de ReadMany
    createMap(ReadManyPersonRequest, ReadManyPersonDto)

    // Mapeamentos de Update
    createMap(UpdatePersonAddressRequest, PersonAddress)
    createMap(UpdatePersonPhoneRequest, PersonPhone)
    createMap(UpdatePersonRequest, Person)
  }
}
```

### Requests e Validators

Requests definem a estrutura de dados recebida e Validators realizam validação e transformação.

#### Common - PersistPersonRequest.ts

Base compartilhada entre Create e Update:

```typescript
import { AutoMap } from '@koalarx/nest/core/mapping/auto-mapping.decorator'
import { ApiProperty } from '@nestjs/swagger'

export class PersistPersonAddressRequest {
  @ApiProperty({ example: 'Street 1' })
  @AutoMap()
  address: string
}

export class PersistPersonPhoneRequest {
  @ApiProperty({ example: '22999999999' })
  @AutoMap()
  phone: string
}

export class PersistPersonRequest {
  @ApiProperty({ example: 'John Doe' })
  @AutoMap()
  name: string

  @ApiProperty({ type: [PersistPersonPhoneRequest] })
  @AutoMap({ type: () => PersistPersonPhoneRequest, isArray: { addTo: true } })
  phones: Array<PersistPersonPhoneRequest>

  @ApiProperty({ type: PersistPersonAddressRequest })
  @AutoMap({ type: () => PersistPersonAddressRequest })
  address: PersistPersonAddressRequest
}
```

#### Create - CreatePersonRequest.ts

```typescript
import {
  PersistPersonAddressRequest,
  PersistPersonPhoneRequest,
  PersistPersonRequest,
} from '../common/persist-person.request'

export class CreatePersonAddressRequest extends PersistPersonAddressRequest {}

export class CreatePersonPhoneRequest extends PersistPersonPhoneRequest {}

export class CreatePersonRequest extends PersistPersonRequest {}
```

#### Create - CreatePersonValidator.ts

```typescript
import { RequestValidatorBase } from '@koalarx/nest/core/request-overflow/request-validator.base'
import { z, ZodType, ZodTypeDef } from 'zod'
import { CreatePersonRequest } from './create-person.request'

export class CreatePersonValidator extends RequestValidatorBase<CreatePersonRequest> {
  protected get schema(): ZodType<any, ZodTypeDef, any> {
    return z.object({
      name: z.string(),
      phones: z.array(
        z.object({
          phone: z.string(),
        }),
      ),
      address: z.object({
        address: z.string(),
      }),
    })
  }
}
```

#### ReadMany - ReadManyPersonRequest.ts

```typescript
import { PaginatedRequest } from '@koalarx/nest/core/controllers/pagination.request'
import { AutoMap } from '@koalarx/nest/core/mapping/auto-mapping.decorator'

export class ReadManyPersonRequest extends PaginatedRequest {
  @AutoMap()
  name?: string

  @AutoMap()
  active?: boolean
}
```

#### ReadMany - ReadManyValidator.ts

```typescript
import { RequestValidatorBase } from '@koalarx/nest/core/request-overflow/request-validator.base'
import { z, ZodType, ZodTypeDef } from 'zod'
import { ReadManyPersonRequest } from './read-many-person.request'

export class ReadManyPersonValidator extends RequestValidatorBase<ReadManyPersonRequest> {
  protected get schema(): ZodType<any, ZodTypeDef, any> {
    return z.object({
      name: z.string().optional(),
      active: z.boolean().optional(),
      page: z.number().optional(),
      pageSize: z.number().optional(),
    })
  }
}
```

#### Update - UpdatePersonRequest.ts e UpdatePersonValidator.ts

```typescript
import {
  PersistPersonAddressRequest,
  PersistPersonPhoneRequest,
  PersistPersonRequest,
} from '../common/persist-person.request'

export class UpdatePersonAddressRequest extends PersistPersonAddressRequest {
  id?: number
}

export class UpdatePersonPhoneRequest extends PersistPersonPhoneRequest {
  id?: number
}

export class UpdatePersonRequest extends PersistPersonRequest {}
```

```typescript
import { RequestValidatorBase } from '@koalarx/nest/core/request-overflow/request-validator.base'
import { z, ZodType, ZodTypeDef } from 'zod'
import { UpdatePersonRequest } from './update-person.request'

export class UpdatePersonValidator extends RequestValidatorBase<UpdatePersonRequest> {
  protected get schema(): ZodType<any, ZodTypeDef, any> {
    return z.object({
      name: z.string().optional(),
      phones: z.array(
        z.object({
          id: z.number().optional(),
          phone: z.string(),
        }),
      ).optional(),
      address: z.object({
        id: z.number().optional(),
        address: z.string(),
      }).optional(),
    })
  }
}
```

### Responses

As Responses definem a estrutura de dados retornada para o cliente.

#### CreatePersonResponse.ts

```typescript
import { CreatedRegistreWithIdResponse } from '@koalarx/nest/core/controllers/created-registre-response.base'

export class CreatePersonResponse extends CreatedRegistreWithIdResponse {}
```

#### ReadPersonResponse.ts

```typescript
import { AutoMap } from '@koalarx/nest/core/mapping/auto-mapping.decorator'
import { ApiProperty } from '@nestjs/swagger'

export class ReadPersonAddressResponse {
  @ApiProperty()
  @AutoMap()
  id: number

  @ApiProperty({ example: 'Street 1' })
  @AutoMap()
  address: string
}

export class ReadPersonPhoneResponse {
  @ApiProperty()
  @AutoMap()
  id: number

  @ApiProperty({ example: '22999999999' })
  @AutoMap()
  phone: string
}

export class ReadPersonResponse {
  @ApiProperty()
  @AutoMap()
  id: number

  @ApiProperty({ example: 'John Doe' })
  @AutoMap()
  name: string

  @ApiProperty({ type: [ReadPersonPhoneResponse] })
  @AutoMap({ type: () => ReadPersonPhoneResponse, isArray: true })
  phones: Array<ReadPersonPhoneResponse>

  @ApiProperty({ type: ReadPersonAddressResponse })
  @AutoMap({ type: () => ReadPersonAddressResponse })
  address: ReadPersonAddressResponse

  @ApiProperty()
  @AutoMap()
  active: boolean
}
```

#### ReadManyPersonResponse.ts

```typescript
import { ListResponse } from '@koalarx/nest/core'
import { AutoMap } from '@koalarx/nest/core/mapping/auto-mapping.decorator'
import { ApiProperty } from '@nestjs/swagger'
import { ReadPersonResponse } from '../read/read-person.response'

export class ReadManyPersonResponse
  implements ListResponse<ReadPersonResponse>
{
  @ApiProperty({ type: [ReadPersonResponse] })
  @AutoMap()
  items: ReadPersonResponse[]

  @ApiProperty()
  @AutoMap()
  count: number
}
```

### Handlers

Os Handlers implementam a lógica de negócio de cada operação.

#### CreatePersonHandler.ts

**Fluxo**: Request → Validar → Mapear para Entidade → Persistir → Retornar ID

```typescript
import { Person } from '@/domain/entities/person/person'
import { IPersonRepository } from '@/domain/repositories/iperson.repository'
import { AutoMappingService } from '@koalarx/nest/core/mapping/auto-mapping.service'
import { RequestHandlerBase } from '@koalarx/nest/core/request-overflow/request-handler.base'
import {
  ok,
  RequestResult,
} from '@koalarx/nest/core/request-overflow/request-result'
import { Injectable } from '@nestjs/common'
import { CreatePersonRequest } from './create-person.request'
import { CreatePersonResponse } from './create-person.response'
import { CreatePersonValidator } from './create-person.validator'

@Injectable()
export class CreatePersonHandler extends RequestHandlerBase<
  CreatePersonRequest,
  RequestResult<Error, CreatePersonResponse>
> {
  constructor(
    private readonly mapper: AutoMappingService,
    private readonly repository: IPersonRepository,
  ) {
    super()
  }

  async handle(
    req: CreatePersonRequest,
  ): Promise<RequestResult<Error, CreatePersonResponse>> {
    // 1. Validar dados
    const person = this.mapper.map(
      new CreatePersonValidator(req).validate(),
      CreatePersonRequest,
      Person,
    )

    // 2. Persistir no banco
    const result = await this.repository.save(person)

    // 3. Retornar resultado
    return ok({ id: result.id })
  }
}
```

#### ReadPersonHandler.ts

**Fluxo**: ID → Buscar no banco → Mapear para Response → Retornar

```typescript
import { Person } from '@/domain/entities/person/person'
import { IPersonRepository } from '@/domain/repositories/iperson.repository'
import { ResourceNotFoundError } from '@koalarx/nest/core/errors/resource-not-found.error'
import { AutoMappingService } from '@koalarx/nest/core/mapping/auto-mapping.service'
import { RequestHandlerBase } from '@koalarx/nest/core/request-overflow/request-handler.base'
import {
  failure,
  ok,
  RequestResult,
} from '@koalarx/nest/core/request-overflow/request-result'
import { Injectable } from '@nestjs/common'
import { ReadPersonResponse } from './read-person.response'

@Injectable()
export class ReadPersonHandler extends RequestHandlerBase<
  number,
  RequestResult<ResourceNotFoundError, ReadPersonResponse>
> {
  constructor(
    private readonly mapper: AutoMappingService,
    private readonly repository: IPersonRepository,
  ) {
    super()
  }

  async handle(
    id: number,
  ): Promise<RequestResult<ResourceNotFoundError, ReadPersonResponse>> {
    // 1. Buscar no banco
    const person = await this.repository.read(id)

    // 2. Validar existência
    if (!person) {
      return failure(new ResourceNotFoundError('Pessoa'))
    }

    // 3. Mapear para Response
    return ok(this.mapper.map(person, Person, ReadPersonResponse))
  }
}
```

#### ReadManyPersonHandler.ts

**Fluxo**: Query → Mapear para DTO → Buscar no banco → Mapear para Response → Retornar com paginação

```typescript
import { ReadManyPersonDto } from '@/domain/dtos/read-many-person.dto'
import { Person } from '@/domain/entities/person/person'
import { IPersonRepository } from '@/domain/repositories/iperson.repository'
import { ResourceNotFoundError } from '@koalarx/nest/core/errors/resource-not-found.error'
import { AutoMappingService } from '@koalarx/nest/core/mapping/auto-mapping.service'
import { RequestHandlerBase } from '@koalarx/nest/core/request-overflow/request-handler.base'
import {
  ok,
  RequestResult,
} from '@koalarx/nest/core/request-overflow/request-result'
import { Injectable } from '@nestjs/common'
import { ReadPersonResponse } from '../read/read-person.response'
import { ReadManyPersonRequest } from './read-many-person.request'
import { ReadManyPersonResponse } from './read-many-person.response'
import { ReadManyPersonValidator } from './read-many.validator'

@Injectable()
export class ReadManyPersonHandler extends RequestHandlerBase<
  ReadManyPersonRequest,
  RequestResult<ResourceNotFoundError, ReadManyPersonResponse>
> {
  constructor(
    private readonly mapper: AutoMappingService,
    private readonly repository: IPersonRepository,
  ) {
    super()
  }

  async handle(
    query: ReadManyPersonRequest,
  ): Promise<RequestResult<ResourceNotFoundError, ReadManyPersonResponse>> {
    // 1. Validar e mapear query para DTO
    const listOfPerson = await this.repository.readMany(
      this.mapper.map(
        new ReadManyPersonValidator(query).validate(),
        ReadManyPersonRequest,
        ReadManyPersonDto,
      ),
    )

    // 2. Mapear entidades para responses
    return ok({
      ...listOfPerson,
      items: listOfPerson.items.map((person) =>
        this.mapper.map(person, Person, ReadPersonResponse),
      ),
    })
  }
}
```

#### UpdatePersonHandler.ts

**Fluxo**: ID + Request → Validar → Buscar entidade → Atualizar → Persistir

```typescript
import { Person } from '@/domain/entities/person/person'
import { IPersonRepository } from '@/domain/repositories/iperson.repository'
import { ResourceNotFoundError } from '@koalarx/nest/core/errors/resource-not-found.error'
import { AutoMappingService } from '@koalarx/nest/core/mapping/auto-mapping.service'
import { RequestHandlerBase } from '@koalarx/nest/core/request-overflow/request-handler.base'
import {
  failure,
  ok,
  RequestResult,
} from '@koalarx/nest/core/request-overflow/request-result'
import { Injectable } from '@nestjs/common'
import { UpdatePersonRequest } from './update-person.request'
import { UpdatePersonValidator } from './update-person.validator'

type UpdatePersonHandleRequest = {
  id: number
  data: UpdatePersonRequest
}

@Injectable()
export class UpdatePersonHandler extends RequestHandlerBase<
  UpdatePersonHandleRequest,
  RequestResult<ResourceNotFoundError, null>
> {
  constructor(
    private readonly mapper: AutoMappingService,
    private readonly repository: IPersonRepository,
  ) {
    super()
  }

  async handle({
    id,
    data,
  }: UpdatePersonHandleRequest): Promise<RequestResult<Error, null>> {
    // 1. Buscar entidade existente
    const personInBd = await this.repository.read(id)

    if (!personInBd) {
      return failure(new ResourceNotFoundError('Person'))
    }

    // 2. Validar e mapear dados recebidos
    const person = this.mapper.map(
      new UpdatePersonValidator(data).validate(),
      UpdatePersonRequest,
      Person,
    )

    // 3. Atualizar propriedades
    personInBd.name = person.name
    personInBd.active = person.active
    personInBd.address.address = person.address.address
    personInBd.phones.update(person.phones.toArray())

    // 4. Persistir
    await this.repository.save(personInBd)

    return ok(null)
  }
}
```

#### DeletePersonHandler.ts

**Fluxo**: ID → Validar existência → Deletar

```typescript
import { IPersonRepository } from '@/domain/repositories/iperson.repository'
import { ResourceNotFoundError } from '@koalarx/nest/core/errors/resource-not-found.error'
import { RequestHandlerBase } from '@koalarx/nest/core/request-overflow/request-handler.base'
import {
  failure,
  ok,
  RequestResult,
} from '@koalarx/nest/core/request-overflow/request-result'
import { Injectable } from '@nestjs/common'

@Injectable()
export class DeletePersonHandler extends RequestHandlerBase<
  number,
  RequestResult<ResourceNotFoundError, null>
> {
  constructor(private readonly repository: IPersonRepository) {
    super()
  }

  async handle(
    id: number,
  ): Promise<RequestResult<ResourceNotFoundError, null>> {
    // 1. Validar existência
    const person = await this.repository.read(id)

    if (!person) {
      return failure(new ResourceNotFoundError('Pessoa'))
    }

    // 2. Deletar
    await this.repository.delete(id)

    return ok(null)
  }
}
```

---

## Camada Host

A camada **Host** contém os Controllers que expõem os endpoints HTTP.

### Controllers

Os Controllers recebem a requisição HTTP, delegam ao Handler e retornam a resposta.

#### CreatePersonController.ts

```typescript
import { CreatePersonHandler } from '@/application/person/create/create-person.handler'
import { CreatePersonRequest } from '@/application/person/create/create-person.request'
import { CreatePersonResponse } from '@/application/person/create/create-person.response'
import { IController } from '@koalarx/nest/core/controllers/base.controller'
import { Controller } from '@koalarx/nest/core/controllers/controller.decorator'
import { Body, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ApiCreatedResponse } from '@nestjs/swagger'
import { PERSON_ROUTER_CONFIG } from './router.config'

@Controller(PERSON_ROUTER_CONFIG)
export class CreatePersonController
  implements IController<CreatePersonRequest, CreatePersonResponse>
{
  constructor(private readonly handler: CreatePersonHandler) {}

  @Post()
  @ApiCreatedResponse({ type: CreatePersonResponse })
  @HttpCode(HttpStatus.CREATED)
  async handle(
    @Body() request: CreatePersonRequest,
  ): Promise<CreatePersonResponse> {
    const response = await this.handler.handle(request)

    if (response.isFailure()) {
      throw response.value
    }

    return response.value
  }
}
```

**Endpoint**: `POST /person`

#### ReadPersonController.ts

```typescript
import { ReadPersonHandler } from '@/application/person/read/read-person.handler'
import { ReadPersonResponse } from '@/application/person/read/read-person.response'
import { IController } from '@koalarx/nest/core/controllers/base.controller'
import { Controller } from '@koalarx/nest/core/controllers/controller.decorator'
import { Get, Param } from '@nestjs/common'
import { ApiOkResponse } from '@nestjs/swagger'
import { PERSON_ROUTER_CONFIG } from './router.config'

@Controller(PERSON_ROUTER_CONFIG)
export class ReadPersonController
  implements IController<null, ReadPersonResponse, string>
{
  constructor(private readonly handler: ReadPersonHandler) {}

  @Get(':id')
  @ApiOkResponse({ type: ReadPersonResponse })
  async handle(_, @Param('id') id: string): Promise<ReadPersonResponse> {
    const response = await this.handler.handle(+id)

    if (response.isFailure()) {
      throw response.value
    }

    return response.value
  }
}
```

**Endpoint**: `GET /person/:id`

#### ReadManyPersonController.ts

```typescript
import { ReadManyPersonHandler } from '@/application/person/read-many/read-many-person.handler'
import { ReadManyPersonRequest } from '@/application/person/read-many/read-many-person.request'
import { ReadManyPersonResponse } from '@/application/person/read-many/read-many-person.response'
import { IController } from '@koalarx/nest/core/controllers/base.controller'
import { Controller } from '@koalarx/nest/core/controllers/controller.decorator'
import { Get, Query } from '@nestjs/common'
import { ApiOkResponse } from '@nestjs/swagger'
import { PERSON_ROUTER_CONFIG } from './router.config'

@Controller(PERSON_ROUTER_CONFIG)
export class ReadManyPersonController
  implements IController<ReadManyPersonRequest, ReadManyPersonResponse>
{
  constructor(private readonly handler: ReadManyPersonHandler) {}

  @Get()
  @ApiOkResponse({ type: ReadManyPersonResponse })
  async handle(
    @Query() query: ReadManyPersonRequest,
  ): Promise<ReadManyPersonResponse> {
    const response = await this.handler.handle(query)

    if (response.isFailure()) {
      throw response.value
    }

    return response.value
  }
}
```

**Endpoint**: `GET /person?name=value&active=true&page=1&pageSize=10`

#### UpdatePersonController.ts

```typescript
import { UpdatePersonHandler } from '@/application/person/update/update-person.handler'
import { UpdatePersonRequest } from '@/application/person/update/update-person.request'
import { IController } from '@koalarx/nest/core/controllers/base.controller'
import { Controller } from '@koalarx/nest/core/controllers/controller.decorator'
import { Body, Param, Put } from '@nestjs/common'
import { ApiOkResponse } from '@nestjs/swagger'
import { PERSON_ROUTER_CONFIG } from './router.config'

@Controller(PERSON_ROUTER_CONFIG)
export class UpdatePersonController
  implements IController<UpdatePersonRequest, void>
{
  constructor(private readonly handler: UpdatePersonHandler) {}

  @Put(':id')
  @ApiOkResponse()
  async handle(
    @Body() request: UpdatePersonRequest,
    @Param('id') id: string,
  ): Promise<void> {
    const response = await this.handler.handle({
      id: +id,
      data: request,
    })

    if (response.isFailure()) {
      throw response.value
    }
  }
}
```

**Endpoint**: `PUT /person/:id`

#### DeletePersonController.ts

```typescript
import { DeletePersonHandler } from '@/application/person/delete/delete-person.handler'
import { IController } from '@koalarx/nest/core/controllers/base.controller'
import { Controller } from '@koalarx/nest/core/controllers/controller.decorator'
import { Delete, HttpCode, HttpStatus, Param } from '@nestjs/common'
import { ApiNoContentResponse } from '@nestjs/swagger'
import { PERSON_ROUTER_CONFIG } from './router.config'

@Controller(PERSON_ROUTER_CONFIG)
export class DeletePersonController implements IController<null, void, string> {
  constructor(private readonly handler: DeletePersonHandler) {}

  @Delete(':id')
  @ApiNoContentResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  async handle(_, @Param('id') id: string): Promise<void> {
    const response = await this.handler.handle(+id)

    if (response.isFailure()) {
      throw response.value
    }
  }
}
```

**Endpoint**: `DELETE /person/:id`

### Configuração de Rotas

#### RouterConfig.ts

```typescript
import { RouterConfigBase } from '@koalarx/nest/core/controllers/router-config.base'

class PersonRouterConfig extends RouterConfigBase {
  constructor() {
    super('Person', '/person')
  }
}

export const PERSON_ROUTER_CONFIG = new PersonRouterConfig()
```

**Características**:
- Estende `RouterConfigBase` que centraliza a configuração de rotas
- Primeiro parâmetro: nome do recurso (`'Person'`)
- Segundo parâmetro: path base dos endpoints (`'/person'`)
- A instância é usada nos controllers via decorador `@Controller(PERSON_ROUTER_CONFIG)`

---

## Camada Infra

A camada **Infra** implementa o acesso aos dados através de repositórios concretos.

### Repositório

#### PersonRepository.ts

```typescript
import { ReadManyPersonDto } from '@/domain/dtos/read-many-person.dto'
import { Person } from '@/domain/entities/person/person'
import { IPersonRepository } from '@/domain/repositories/iperson.repository'
import { CreatedRegistreWithIdResponse } from '@koalarx/nest/core/controllers/created-registre-response.base'
import { ListResponseBase } from '@koalarx/nest/core/controllers/list-response.base'
import { RepositoryBase } from '@koalarx/nest/core/database/repository.base'
import { PRISMA_TOKEN } from '@koalarx/nest/core/koala-nest-database.module'
import { Inject, Injectable } from '@nestjs/common'
import { Prisma } from 'prisma/generated/client'
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

  async save(person: Person): Promise<CreatedRegistreWithIdResponse | null> {
    return this.saveChanges(person)
  }

  read(id: number): Promise<Person | null> {
    return this.findById(id)
  }

  readMany(query: ReadManyPersonDto): Promise<ListResponseBase<Person>> {
    return this.findManyAndCount<Prisma.PersonWhereInput>(
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
    return this.remove<Prisma.PersonWhereUniqueInput>({ id })
  }
}
```

**Características**:
- Estende `RepositoryBase` que fornece operações CRUD prontas
- Implementa `IPersonRepository` do contrato de domain
- Injeção de `DbTransactionContext` para gerenciar transações
- Métodos utilizam internals da classe base para buscar/salvar/deletar

#### Comportamento do Método `remove()` com Orphan Removal

O método `remove()` (utilizado no método `delete()`) possui internamente uma função de `orphanRemoval` que remove automaticamente todas as entidades associadas (relacionamentos) quando a entidade principal é deletada.

```typescript
// Exemplo: Deletar uma Pessoa
await this.repository.delete(personId)

// Internamente, o RepositoryBase.remove() executará:
// 1. Remove PersonPhones associados (orphanRemoval)
// 2. Remove PersonAddress associado (orphanRemoval)
// 3. Remove Person
```

**Para evitar deletar entidades associadas**, passe um array de relacionamentos que devem ser **preservados** como segundo parâmetro:

```typescript
// Exemplo: Deletar Person mas manter o Address
delete(id: number): Promise<void> {
  // 'address' não será deletado, apenas desvínculado
  return this.remove<Prisma.PersonWhereUniqueInput>({ id }, ['address'])
}
```

**Sintaxe completa**:
```typescript
// Método remove com orphanRemoval seletivo
remove<T extends Prisma.Args>(
  where: T,
  skipOrphanRemovalOn?: string[]  // Relacionamentos a preservar
): Promise<void>
```

**Exemplos práticos**:

```typescript
// ❌ Deleta tudo (Person, Phones, Address)
await this.remove({ id: 1 })

// ✅ Deleta Person e Phones, mas preserva Address
await this.remove({ id: 1 }, ['address'])

// ✅ Deleta Person, mas preserva Phones e Address
await this.remove({ id: 1 }, ['phones', 'address'])

// ✅ Deleta Person e Address, mas preserva Phones
await this.remove({ id: 1 }, ['phones'])
```

**Caso de Uso**:
Use `skipOrphanRemovalOn` quando você quer transferir relacionamentos para outro registro ou manter histórico antes de deletar a entidade principal.

### Contexto de Transação

#### DbTransactionContext.ts

Gerencia transações com o Prisma, permitindo operações ACID em múltiplas tabelas:

```typescript
import { PrismaClientWithCustomTransaction } from '@koalarx/nest/core/database/prisma-client-with-custom-transaction.interface'
import { PrismaTransactionalClient } from '@koalarx/nest/core/database/prisma-transactional-client'
import { DefaultArgs } from '@prisma/client/runtime/client'
import { Prisma } from 'prisma/generated/client'

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

  get personAddress(): Prisma.PersonAddressDelegate<
    DefaultArgs,
    Prisma.PrismaClientOptions
  > {
    return this.transactionalClient.personAddress
  }
}
```

**Características**:
- Estende `PrismaTransactionalClient` que gerencia o ciclo de vida da transação
- Implementa `PrismaClientWithCustomTransaction` interface para type-safety
- Getters para cada modelo (`person`, `personPhone`, `personAddress`) que retornam delegates Prisma
- Esses delegates são usados pelo `RepositoryBase` para operações CRUD dentro de transações
- Automaticamente injetado nos repositórios via `DbTransactionContext` token

---

## Testes

A biblioteca oferece suporte para testes unitários e E2E com setup facilitado.

### Testes Unitários

#### Mockups

[create-person-request.mockup.ts](./test/mockup/person/create-person-request.mockup.ts):

```typescript
import { CreatePersonRequest } from '@/application/person/create/create-person.request'
import { faker } from '@faker-js/faker'
import { assignObject } from '@koalarx/nest/core/utils/assing-object'

export const createPersonRequestMockup = assignObject(CreatePersonRequest, {
  name: faker.person.fullName(),
  phones: [{ phone: faker.phone.number() }],
  address: { address: faker.location.streetAddress() },
})
```

#### Setup do App de Testes

[create-unit-test-app.ts](./test/create-unit-test-app.ts):

```typescript
import { CreatePersonHandler } from '@/application/person/create/create-person.handler'
import { MappingProfile } from '@/application/mapping/mapping.profile'
import { AutoMappingService } from '@koalarx/nest/core/mapping/auto-mapping.service'
import { KoalaAppTestDependencies } from '@koalarx/nest/test/koala-app-test-dependencies'
import { PersonRepository } from './repositories/person.repository'
import { DeletePersonHandler } from '@/application/person/delete/delete-person.handler'
import { ReadPersonHandler } from '@/application/person/read/read-person.handler'
import { ReadManyPersonHandler } from '@/application/person/read-many/read-many-person.handler'
import { UpdatePersonHandler } from '@/application/person/update/update-person.handler'

export function createUnitTestApp() {
  const automapService = new AutoMappingService(new MappingProfile())
  const personRepository = new PersonRepository()

  return new KoalaAppTestDependencies({
    dependencies: [
      new CreatePersonHandler(automapService, personRepository),
      new ReadPersonHandler(automapService, personRepository),
      new ReadManyPersonHandler(automapService, personRepository),
      new UpdatePersonHandler(automapService, personRepository),
      new DeletePersonHandler(personRepository),
    ],
  })
}
```

**Nota sobre PersonRepository em Testes**: A classe `PersonRepository` usada aqui é uma implementação **fake/mock** para testes. Ela estende `InMemoryBaseRepository<Person>` (armazenamento em memória) ao invés de `RepositoryBase` (que usa Prisma). Já possui **abstrações prontas** herdadas de `InMemoryBaseRepository`:
- `saveChanges()`: Persiste em memória
- `findById()`: Busca por ID em memória
- `findManyAndCount()`: Lista e conta registros em memória
- `remove()`: Remove de memória

Essa implementação fake permite testes rápidos sem dependência de banco de dados real.

#### PersonRepository.ts (Fake para Testes)

```typescript
import { ReadManyPersonDto } from '@/domain/dtos/read-many-person.dto'
import { Person } from '@/domain/entities/person/person'
import { IPersonRepository } from '@/domain/repositories/iperson.repository'
import { ListResponseBase } from '@koalarx/nest/core/controllers/list-response.base'
import { EntityActionType } from '@koalarx/nest/core/database/entity.base'
import { InMemoryBaseRepository } from '@koalarx/nest/test/repositories/in-memory-base.repository'

export class PersonRepository
  extends InMemoryBaseRepository<Person>
  implements IPersonRepository
{
  save(person: Person): Promise<any> {
    // Lógica específica de teste: marcar como inativo ao criar
    if (person._action === EntityActionType.create) {
      person.active = false
    }

    return this.saveChanges(person, (item) => item.id === person.id)
  }

  read(id: number): Promise<Person | null> {
    return this.findById(id)
  }

  readMany(query: ReadManyPersonDto): Promise<ListResponseBase<Person>> {
    return this.findManyAndCount<ReadManyPersonDto>(
      query,
      (person) =>
        (!query.name || person.name.includes(query.name)) &&
        (query.active === undefined || person.active === query.active),
    )
  }

  delete(id: number): Promise<void> {
    return this.remove((person) => person.id === id)
  }
}
```

**Características**:
- Estende `InMemoryBaseRepository<Person>` para armazenamento em memória (não usa banco de dados)
- Implementa `IPersonRepository` mantendo o mesmo contrato da versão real
- Métodos utilizam abstrações herdadas (`saveChanges`, `findById`, `findManyAndCount`, `remove`)
- Pode adicionar lógica específica de teste (ex: `person.active = false` no `save()`)
- Usado apenas em testes unitários com `createUnitTestApp()

#### Exemplo de Teste Unitário

[create-person.handler.spec.ts](./application/person/create/create-person.handler.spec.ts):

```typescript
import { createUnitTestApp } from '@/test/create-unit-test-app'
import { createPersonRequestMockup } from '@/test/mockup/person/create-person-request.mockup'
import { CreatePersonHandler } from './create-person.handler'

describe('CreatePersonHandler', () => {
  const app = createUnitTestApp()

  it('should create a person', async () => {
    const handler = app.get(CreatePersonHandler)
    const request = createPersonRequestMockup

    const result = await handler.handle(request)

    expect(result.isOk()).toBeTruthy()

    if (result.isOk()) {
      expect(result.value).toEqual({
        id: expect.any(Number),
      })
    }
  })
})
```

[read-person.handler.spec.ts](./application/person/read/read-person.handler.spec.ts):

```typescript
import { createUnitTestApp } from '@/test/create-unit-test-app'
import { createPersonRequestMockup } from '@/test/mockup/person/create-person-request.mockup'
import { CreatePersonHandler } from '../create/create-person.handler'
import { ReadPersonHandler } from './read-person.handler'

describe('ReadPersonHandler', () => {
  const app = createUnitTestApp()

  it('should get a person by id', async () => {
    const createResult = await app
      .get(CreatePersonHandler)
      .handle(createPersonRequestMockup)

    expect(createResult.isOk()).toBeTruthy()

    if (createResult.isOk()) {
      const result = await app
        .get(ReadPersonHandler)
        .handle(createResult.value.id)

      expect(result.isOk()).toBeTruthy()

      if (result.isOk()) {
        expect(result.value.id).toBe(createResult.value.id)
      }
    }
  })
})
```

### Testes E2E

#### Setup do App E2E

> 💡 **Nota Importante**: Este exemplo usa **PostgreSQL**. Você pode usar qualquer banco de dados que o Prisma suporta (MySQL, SQLite, SQL Server, etc.). Basta estender a classe `E2EDatabaseClient` com a implementação específica do seu banco.

[setup-e2e.ts](./test/setup-e2e.ts):

Configura o banco de dados E2E e fornece um cliente compartilhado entre os testes. **Este exemplo é específico para PostgreSQL**:

```typescript
import { createE2EDatabase } from '@koalarx/nest/test/utils/create-e2e-database'
import { E2EDatabaseClient } from '@koalarx/nest/test/utils/e2e-database-client'
import { delay } from '@koalarx/utils'
import { Pool } from 'pg'

export let pgClient: E2EPostgresClient

class E2EPostgresClient extends E2EDatabaseClient {
  private baseUrl: URL
  public pool: Pool

  constructor(url: string, schemaName: string) {
    super(url, schemaName)
    this.baseUrl = new URL(this.url)
    this.baseUrl.pathname = `/${this.schemaName}`
    this.pool = this.createSession()
  }

  private createSession(idleTimeout?: number) {
    return new Pool({
      connectionString: this.baseUrl.toString(),
      ...(idleTimeout ? { idleTimeoutMillis: idleTimeout } : {}),
    })
  }

  async createDatabase(schemaName: string): Promise<void> {
    this.baseUrl.pathname = `/postgres`
    const pool = this.createSession()
    await pool.query(`CREATE DATABASE "${schemaName}"`)
    await pool.end()
    this.baseUrl.pathname = `/${schemaName}`
  }

  async dropDatabase(): Promise<void> {
    await this.pool.end()
    await delay(1000)
    this.baseUrl.pathname = '/postgres'
    const pool = this.createSession(100)
    await pool.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = '${this.schemaName}'
      AND pid <> pg_backend_pid()
    `)
    await delay(500)
    await pool.query(`DROP DATABASE IF EXISTS "${this.schemaName}"`)
    await pool.end()
  }
}

beforeAll(async () => {
  const { client } = await createE2EDatabase('bun', E2EPostgresClient)
  pgClient = client
}, 60000)

afterAll(async () => {
  await pgClient.dropDatabase()
})
```

**Para outros bancos de dados**, você implementaria métodos similares adaptados ao seu banco:

- **MySQL**: Usar `mysql2/promise` em vez de `pg`, comandos SQL como `CREATE DATABASE` são similares
- **SQLite**: Usar `better-sqlite3` ou `sqlite3`, criar arquivos de banco em vez de schemas
- **SQL Server**: Usar `tedious`, adaptar sintaxe SQL específica do SQL Server

[create-e2e-test-app.ts](./test/create-e2e-test-app.ts):

```typescript
import { AppModule } from '@/host/app.module'
import { DbTransactionContext } from '@/infra/database/db-transaction-context'
import { setPrismaClientOptions } from '@koalarx/nest/core/database/prisma.service'
import { KoalaAppTest } from '@koalarx/nest/test/koala-app-test'
import { Test } from '@nestjs/testing'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'
import { pgClient } from './setup-e2e'

export async function createE2ETestApp() {
  const adapter = new PrismaPg(pgClient.pool)
  setPrismaClientOptions({ adapter })

  return Test.createTestingModule({ imports: [AppModule] })
    .compile()
    .then((moduleRef) => moduleRef.createNestApplication())
    .then((app) =>
      new KoalaAppTest(app)
        .setDbTransactionContext(DbTransactionContext)
        .enableCors()
        .build(),
    )
    .then((app) => app.init())
}
```

> **Adaptando para Outro Banco de Dados**: Se usar MySQL, SQLite ou outro banco, você apenas ajustaria:
> - `PrismaPg` → `PrismaMySql`, `PrismaSqlite`, etc.
> - `pgClient.pool` → seu cliente específico (ex: `mysqlClient.connection`)
> - Os métodos de `E2EDatabaseClient` seriam adaptados para sua sintaxe SQL

#### Exemplo de Teste E2E

[person.controller.spec.ts](./host/controllers/person/person.controller.spec.ts):

```typescript
import { createE2ETestApp } from '@/test/create-e2e-test-app'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { PERSON_ROUTER_CONFIG } from './router.config'

describe(`CRUD OF PERSON`, () => {
  let app: INestApplication
  let personId: number
  let addressId: number

  beforeAll(async () => {
    app = await createE2ETestApp()
  })

  it('should create a person', async () => {
    const response = await request(app.getHttpServer())
      .post(PERSON_ROUTER_CONFIG.group)
      .send({
        name: 'John Doe',
        phones: [],
        address: {
          address: 'Streat 1',
        },
      })

    personId = response.body.id

    expect(response.statusCode).toBe(201)
    expect(response.body).toStrictEqual({
      id: expect.any(Number),
    })
  })

  it('should get the created person', async () => {
    const response = await request(app.getHttpServer()).get(
      `${PERSON_ROUTER_CONFIG.group}/${personId}`,
    )

    addressId = response.body.address.id

    expect(response.statusCode).toBe(200)
    expect(response.body).toStrictEqual({
      id: personId,
      name: 'John Doe',
      phones: [],
      address: {
        id: expect.any(Number),
        address: 'Streat 1',
      },
      active: true,
    })
  })

  it('should get all persons', async () => {
    const response = await request(app.getHttpServer()).get(
      PERSON_ROUTER_CONFIG.group,
    )

    expect(response.statusCode).toBe(200)
    expect(response.body).toStrictEqual({
      items: [
        {
          id: personId,
          name: 'John Doe',
          phones: [],
          address: {
            id: addressId,
            address: 'Streat 1',
          },
          active: true,
        },
      ],
      count: 1,
    })
  })

  it('should get all inactive persons', async () => {
    const response = await request(app.getHttpServer()).get(
      `${PERSON_ROUTER_CONFIG.group}?active=false`,
    )

    expect(response.statusCode).toBe(200)
    expect(response.body).toStrictEqual({
      items: [],
      count: 0,
    })
  })

  it('should get persons by name', async () => {
    const response = await request(app.getHttpServer()).get(
      `${PERSON_ROUTER_CONFIG.group}?name=John`,
    )

    expect(response.statusCode).toBe(200)
    expect(response.body).toStrictEqual({
      items: [
        {
          id: personId,
          name: 'John Doe',
          phones: [],
          address: {
            id: addressId,
            address: 'Streat 1',
          },
          active: true,
        },
      ],
      count: 1,
    })
  })

  it('should update the created person', async () => {
    const updateResponse = await request(app.getHttpServer())
      .put(`${PERSON_ROUTER_CONFIG.group}/${personId}`)
      .send({
        name: 'John Doe Updated',
        phones: [],
        address: {
          id: addressId,
          address: 'Streat 2',
        },
        active: true,
      })

    expect(updateResponse.statusCode).toBe(200)

    const response = await request(app.getHttpServer()).get(
      `${PERSON_ROUTER_CONFIG.group}/${personId}`,
    )

    expect(response.body).toStrictEqual({
      id: personId,
      name: 'John Doe Updated',
      phones: [],
      address: {
        id: addressId,
        address: 'Streat 2',
      },
      active: true,
    })
  })

  it('should delete the created person', async () => {
    const deleteResponse = await request(app.getHttpServer()).delete(
      `${PERSON_ROUTER_CONFIG.group}/${personId}`,
    )

    expect(deleteResponse).toBeTruthy()
    expect(deleteResponse.statusCode).toBe(204)
  })
})
```

---

## Jobs e Eventos

A biblioteca oferece abstração para **CronJobs** (tarefas agendadas) e **EventJobs** (processamento de eventos).

### CronJobs

CronJobs são tarefas executadas em intervalo de tempo. A biblioteca gerencia automaticamente locks com Redis para evitar duplicação em ambientes com múltiplos pods.

#### CreatePersonJob.ts

```typescript
import { IPersonRepository } from '@/domain/repositories/iperson.repository'
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
import { PersonEventJob } from '../events/person-event.job'

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

  protected async settings(): Promise<CronJobSettings> {
    return {
      isActive: true,
      timeInMinutes: 1,
    }
  }

  protected async run(): Promise<CronJobResponse> {
    const result = await this.createPerson.handle({
      name: 'John Doe',
      phones: [{ phone: '22999999999' }],
      address: { address: 'Street 1' },
    })

    if (result.isOk()) {
      const person = await this.repository.read(result.value.id)

      if (person) {
        const jobs = new PersonEventJob()
        jobs.addEvent(new InactivePersonEvent())

        // Dispatch: Enfilera os eventos para processamento assíncrono
        EventQueue.dispatchEventsForAggregate(jobs._id)
      }

      console.log('Person created with id:', result.value.id)
    } else {
      console.error('Error creating person:', result.value)
    }

    return ok(null)
  }
}
```

#### DeleteInactiveJob.ts

```typescript
import { ReadManyPersonDto } from '@/domain/dtos/read-many-person.dto'
import {
  CronJobHandlerBase,
  CronJobResponse,
  CronJobSettings,
} from '@koalarx/nest/core/backgroud-services/cron-service/cron-job.handler.base'
import { ok } from '@koalarx/nest/core/request-overflow/request-result'
import { ILoggingService } from '@koalarx/nest/services/logging/ilogging.service'
import { IRedLockService } from '@koalarx/nest/services/redlock/ired-lock.service'
import { Injectable } from '@nestjs/common'
import { DeletePersonHandler } from '../delete/delete-person.handler'
import { ReadManyPersonHandler } from '../read-many/read-many-person.handler'

@Injectable()
export class DeleteInactiveJob extends CronJobHandlerBase {
  constructor(
    redlockService: IRedLockService,
    loggingService: ILoggingService,
    private readonly readManyPerson: ReadManyPersonHandler,
    private readonly deletePerson: DeletePersonHandler,
  ) {
    super(redlockService, loggingService)
  }

  protected async settings(): Promise<CronJobSettings> {
    return {
      isActive: true,
      timeInMinutes: 1,
    }
  }

  protected async run(): Promise<CronJobResponse> {
    const result = await this.readManyPerson.handle(
      new ReadManyPersonDto({ active: false }),
    )

    if (result.isOk()) {
      for (const person of result.value.items) {
        await this.deletePerson.handle(person.id)

        console.log('Person with id was deleted:', person.id)
      }
    } else {
      console.error('Error to search inactive people:', result.value)
    }

    return ok(null)
  }
}
```

### EventJobs

EventJobs permitem processar eventos de domínio de forma assíncrona. O fluxo é:

1. **CronJob/Handler** cria evento e chama `EventQueue.dispatchEventsForAggregate(jobId)`
2. **EventQueue** enfilera os eventos para processamento
3. **EventHandlers** processam os eventos de forma assíncrona
4. **Resultado**: Lógica de negócio executada sem bloquear a requisição

#### PersonEventJob.ts

Define quais handlers processarão os eventos da Pessoa:

```typescript
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

**Características**:
- Estende `EventJob<Person>` tipando a entidade agregada
- Método `defineHandlers()` retorna array de handlers que processarão os eventos
- Cada handler é responsável por uma ação específica

#### InactivePersonEvent.ts

```typescript
import { EventClass } from '@koalarx/nest/core/backgroud-services/event-service/event-class'

export class InactivePersonEvent extends EventClass {}
```

**Características**:
- Estende `EventClass` como marcador de evento de domínio
- Pode ser utilizado em múltiplos handlers
- Pode ser disparado de qualquer handler ou CronJob

#### InactivePersonHandler.ts

```typescript
import { ReadManyPersonDto } from '@/domain/dtos/read-many-person.dto'
import { IPersonRepository } from '@/domain/repositories/iperson.repository'
import { EventHandlerBase } from '@koalarx/nest/core/backgroud-services/event-service/event-handler.base'
import { Injectable } from '@nestjs/common'
import { InactivePersonEvent } from './inactive-person-event'

@Injectable()
export class InactivePersonHandler extends EventHandlerBase {
  constructor(private readonly repository: IPersonRepository) {
    super(InactivePersonEvent)
  }

  async handleEvent(): Promise<void> {
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

---

## Resumo de Boas Práticas

1. **Separação de Responsabilidades**: Cada camada tem responsabilidade bem definida
2. **Injeção de Dependência**: Use NestJS DI para injetar repositórios e serviços
3. **AutoMapping**: Aproveite o decorador `@AutoMap()` para reduzir código boilerplate
4. **Validação**: Use `RequestValidatorBase` com Zod para validar e transformar dados
5. **Error Handling**: Retorne `RequestResult` com sucesso ou falha
6. **Testes**: Crie mocks e use a estrutura de testes fornecida
7. **CronJobs e EventJobs**: Use para processar tarefas assincronamente com segurança em clusters

