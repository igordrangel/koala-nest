<p align="center">
  <a href="https://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<h1 align="center">@koalarx/nest</h1>

<p align="center">Uma abstração <a href="https://nestjs.com" target="_blank">Nest.js</a> para APIs escaláveis.</p>

## Índice
- [Criando novo projeto](#criar-novo-projeto)
- [Introdução](#introducao)
- [Application](#application)
  - [Mapping](#mapping)
  - [Mediator](#mediator)
    - [Request](#request)
    - [Validator](#validator)
    - [Response](#response)
    - [RequestHandler](#requesthandler)
  - [CronJob](#cronjob)
  - [EventJob](#eventjob)
- [Domain](#domain)
  - [Entity](#entity)
  - [DTO](#dto)
- [Host](#host)
  - [Controller](#controller)
  - [Build](#build)
    - [Documentação](#documentação)
    - [Ngrok](#ngrok)
    - [Filters](#filters)
- [Infra](#infra)
  - [Repository](#repository)
- [Test](#test)
  - [Unit Test](#unit-test)
  - [E2E Test](#e2e-test)
- [Utils](#utils)
  - [List](#listas)
  - [assignObject](#assignobject)
  - [EnvConfig](#envconfig)
  - [Promises](#promises)
  - [setMaskDocumentNumber](#setmaskdocumentnumber)
- [Environment](#environment)
- [Decorators](#decorators)
- [API Key Strategy](#api-key-strategy)
- [Errors](#errors)

## Criar novo projeto

```bash
npm i -g @koalarx/nest-cli
```

```bash
koala-nest new app-demo
```

## Instrodução
O Koala Nest é uma biblioteca para o framework Nest.js que adota o padrão de projeto DDD (Domain-Driven Design). 

Seu principal objetivo é fornecer abstrações que simplifiquem e acelerem o desenvolvimento de APIs escaláveis e bem estruturadas.

## Domain

### Entity
As entidades são um espelho de uma tabela no banco, e portanto devem ser implementadas em uma classe conforme exemplificado abaixo:

```prisma
schema.prisma
...

model Person {
  id              Int     @id @default(autoincrement())
  name            String
  active          Boolean @default(true)
  personAddressId Int     @map("person_address_id")

  phones  PersonPhone[]
  address PersonAddress @relation(fields: [personAddressId], references: [id])

  @@map("person")
}

...
```

Utilize o decorator `@Entity` para que ao passar os dados no construtor eles sejam automaticamente atribuídos na classe, onde inclusive, `Array` serão convertidos em [List](#listas) caso o mesmo tenha sido mapeado com o decorator `@AutoMap`.

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

  @AutoMap({ type: List })
  phones = new List(PersonPhone)

  @AutoMap({ type: PersonAddress })
  address: PersonAddress

  @AutoMap()
  active: boolean
}
```

### DTO

Os DTOs (Data Transfer Objects) são utilizados para transferir dados entre diferentes camadas da aplicação. Eles são responsáveis por definir a estrutura dos dados que serão enviados ou recebidos.

Os DTOs são implementados como classes que estendem `PaginationDto` ou outras classes base, e utilizam o decorator `@AutoMap` para mapear automaticamente as propriedades.

#### Exemplo de DTO

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

## Application
A camada de Application é responsável por orquestrar a lógica de aplicação, conectando as diferentes camadas do sistema, como Domain, Infra e Host. Ela contém os componentes que implementam casos de uso específicos, garantindo que as regras de negócio sejam aplicadas corretamente e que os dados sejam processados e transformados conforme necessário.

### Mapping
O mapeamento é uma funcionalidade essencial para transformar objetos de um tipo para outro, facilitando a comunicação entre diferentes camadas da aplicação. No projeto de exemplo, o mapeamento é realizado utilizando o decorator `@AutoMap`, que permite mapear automaticamente as propriedades das classes.

#### Exemplo de Mapeamento

###### application/person/common/persist-person.request.ts
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
  @AutoMap({ type: PersistPersonPhoneRequest, isArray: { addTo: true } })
  phones: Array<PersistPersonPhoneRequest>

  @ApiProperty({ type: PersistPersonAddressRequest })
  @AutoMap({ type: PersistPersonAddressRequest })
  address: PersistPersonAddressRequest
}
```

###### application/mapping/person.mapping.ts
```typescript
import { ReadManyPersonDto } from '@/domain/dtos/read-many-person.dto'
import { Person } from '@/domain/entities/person/person'
import { PersonAddress } from '@/domain/entities/person/person-address'
import { PersonPhone } from '@/domain/entities/person/person-phone'
import { createMap } from '@koalarx/nest/core/mapping/create-map'
import { ReadManyPersonRequest } from '../person/read-many/read-many-person.request'
import {
  ReadPersonAddressResponse,
  ReadPersonPhoneResponse,
  ReadPersonResponse,
} from '../person/read/read-person.response'

export class PersonMapping {
  static createMap() {
    createMap(CreatePersonAddressRequest, PersonAddress)
    createMap(CreatePersonPhoneRequest, PersonPhone)
    createMap(CreatePersonRequest, Person)
  }
}
```

###### application/mapping/mapping.profile.ts
```typescript
import { AutoMappingProfile } from '@koalarx/nest/core/mapping/auto-mapping-profile'
import { Injectable } from '@nestjs/common'
import { PersonMapping } from './person.mapping'

@Injectable()
export class MappingProfile implements AutoMappingProfile {
  profile(): void {
    PersonMapping.createMap()
  }
}
```

###### host/constrollers/controller.module.ts
```typescript
import { MappingProfile } from '@/application/mapping/mapping.profile'
import { InfraModule } from '@/infra/infra.module'
import { KoalaNestHttpModule } from '@koalarx/nest/core/koala-nest-http.module'
import { Module } from '@nestjs/common'

@Module({
  imports: [
    KoalaNestHttpModule.register({
      automapperProfile: MappingProfile,
      middlewares: [],
    }),
    InfraModule,
  ],
  exports: [KoalaNestHttpModule, InfraModule],
})
export class ControllerModule {}
```

### Mediator
A camada **Mediator** é responsável por gerenciar a comunicação entre diferentes partes da aplicação, como validação de dados, execução de comandos e retorno de respostas. Ela organiza e centraliza a lógica de fluxo, garantindo que cada componente tenha uma responsabilidade bem definida.

#### Request
Os **Requests** representam os dados de entrada necessários para executar uma operação. Eles são definidos como classes que encapsulam as informações que serão validadas e processadas.

##### Exemplo de Request

```typescript
import {
  PaginatedRequestProps,
  PaginationRequest,
} from '@koalarx/nest/core/controllers/pagination.request'
import { AutoMap } from '@koalarx/nest/core/mapping/auto-mapping.decorator'
import { ApiProperty } from '@nestjs/swagger'

export class ReadManyPersonRequest extends PaginationRequest {
  @ApiProperty({ required: false })
  @AutoMap()
  name?: string

  @ApiProperty({ required: false })
  @AutoMap()
  active?: boolean

  constructor(props?: PaginatedRequestProps<ReadManyPersonRequest>) {
    super()
    Object.assign(this, props)
  }
}
```

#### Validator
Os **Validators** são responsáveis por validar os dados recebidos no **Request**. Eles utilizam o [zod](https://github.com/colinhacks/zod) para definir esquemas de validação e garantir que os dados estejam no formato esperado antes de serem processados.

##### Exemplo de Validator
```typescript
import { booleanSchema } from '@koalarx/nest/core/controllers/schemas/boolean.schema'
import { LIST_QUERY_SCHEMA } from '@koalarx/nest/core/controllers/schemas/list-query.schema'
import { RequestValidatorBase } from '@koalarx/nest/core/request-overflow/request-validator.base'
import { z, ZodType, ZodTypeDef } from 'zod'
import { ReadManyPersonRequest } from './read-many-person.request'

export class ReadManyPersonValidator extends RequestValidatorBase<ReadManyPersonRequest> {
  protected get schema(): ZodType<any, ZodTypeDef, any> {
    return LIST_QUERY_SCHEMA.merge(
      z.object({
        name: z.string().optional().nullable(),
        active: booleanSchema().optional().nullable(),
      }),
    )
  }
}
```

#### Response
Os **Responses** representam os dados de saída que serão retornados após a execução de uma operação. Eles são definidos como classes que encapsulam as informações que serão enviadas ao cliente.

##### Exemplo de Response
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

#### RequestHandler
Os **RequestHandlers** são responsáveis por processar os **Requests**, aplicando as regras de negócio e retornando os **Responses**. Eles utilizam os **Validators** para validar os dados de entrada e os **Repositories** para acessar os dados necessários.

##### Exemplo de RequestHandler
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
    const listOfPerson = await this.repository.readMany(
      this.mapper.map(
        new ReadManyPersonValidator(query).validate(),
        ReadManyPersonRequest,
        ReadManyPersonDto,
      ),
    )

    return ok({
      ...listOfPerson,
      items: listOfPerson.items.map((person) =>
        this.mapper.map(person, Person, ReadPersonResponse),
      ),
    })
  }
}
```

### CronJob
A funcionalidade de **CronJob** é utilizada para agendar e executar tarefas recorrentes em intervalos de tempo definidos. No Koala Nest, os **CronJobs** são implementados como classes que estendem `CronJobHandlerBase`, fornecendo uma estrutura padronizada para criação e gerenciamento de tarefas agendadas.
#### Estrutura de um CronJob

Os **CronJobs** possuem três métodos principais que devem ser implementados:

- **`run()`**: Define a lógica principal da tarefa que será executada.
- **`isActive()`**: Determina se o CronJob está ativo e deve ser executado.
- **`defineTimeInMinutes()`**: Define o intervalo de tempo (em minutos) entre as execuções da tarefa.

#### Exemplo de CronJob

##### DeleteInactiveJob

Este exemplo demonstra um CronJob que remove pessoas inativas do sistema.

```typescript
import { ReadManyPersonDto } from '@/domain/dtos/read-many-person.dto'
import {
  CronJobHandlerBase,
  CronJobResponse,
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

  protected async isActive(): Promise<boolean> {
    return true
  }

  protected defineTimeInMinutes(): number {
    return 1
  }
}
```
##### CreatePersonJob

Este exemplo demonstra um CronJob que cria uma nova pessoa no sistema e dispara eventos relacionados.

```typescript
import { IPersonRepository } from '@/domain/repositories/iperson.repository'
import {
  CronJobHandlerBase,
  CronJobResponse,
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

        EventQueue.dispatchEventsForAggregate(jobs._id)
      }

      console.log('Person created with id:', result.value.id)
    } else {
      console.error('Error creating person:', result.value)
    }

    return ok(null)
  }

  protected async isActive(): Promise<boolean> {
    return true
  }

  protected defineTimeInMinutes(): number {
    return 5
  }
}
```

##### Registro de CronJobs

Para que os CronJobs sejam executados, eles devem ser registrados no módulo correspondente. Por exemplo:

###### host/app.module.ts
```typescript
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
      cronJobs: [DeleteInactiveJob, CreatePersonJob],
      eventJobs: [],
    }),
  ],
})
export class AppModule {}
```

###### host/main.ts
```typescript
import { CreatePersonJob } from '@/application/person/create-person-job/create-person-job'
import { DeleteInactiveJob } from '@/application/person/delete-inative-job/delete-inactive-job'
import { DbTransactionContext } from '@/infra/database/db-transaction-context'
import { KoalaApp } from '@koalarx/nest/core/koala-app'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  return NestFactory.create(AppModule).then((app) =>
    new KoalaApp(app)
      .addCronJob(CreatePersonJob)
      .addCronJob(DeleteInactiveJob)
      ...
      .enableCors()
      .buildAndServe()
  )
}
```

### EventJob
A funcionalidade de **EventJob** é utilizada para gerenciar eventos dentro da aplicação, permitindo a execução de ações baseadas em eventos disparados por diferentes partes do sistema. No Koala Nest, os **EventJobs** são implementados como classes que estendem `EventJob`, fornecendo uma estrutura padronizada para criação e gerenciamento de eventos.

#### Estrutura de um EventJob

Os **EventJobs** possuem os seguintes elementos principais:

- **`defineHandlers()`**: Define os handlers que serão responsáveis por processar os eventos associados ao job.
- **`addEvent()`**: Adiciona um evento à fila de eventos do job.
- **`clearQueue()`**: Limpa a fila de eventos após o processamento.
- **`dispatchEventsForAggregate()`**: Dispara os eventos associados a um job específico.

#### Exemplo de EventJob

##### PersonEventJob

Este exemplo demonstra um EventJob que gerencia eventos relacionados a uma entidade `Person`.

```typescript
import { Person } from '@/domain/entities/person/person'
import { EventHandlerBase } from '@koalarx/nest/core/backgroud-services/event-service/event-handler.base'
import { EventJob } from '@koalarx/nest/core/backgroud-services/event-service/event-job'
import { Type } from '@nestjs/common'
import { InactivePersonHandler } from './inactive-person/inactive-person-handler'

export class PersonEventJob extends EventJob<Person> {
  defineHandlers(): Type<EventHandlerBase<any>>[] {
    return [InactivePersonHandler]
  }
}
```

##### Exemplo de EventHandler

Os **EventHandlers** são responsáveis por processar os eventos associados a um **EventJob**. Eles estendem a classe `EventHandlerBase` e implementam o método `handleEvent()`.

```typescript
import { ReadManyPersonDto } from '@/domain/dtos/read-many-person.dto'
import { IPersonRepository } from '@/domain/repositories/iperson.repository'
import { EventHandlerBase } from '@koalarx/nest/core/backgroud-services/event-service/event-handler.base'
import { Injectable } from '@nestjs/common'
import { InactivePersonEvent } from './inactive-person-event'

@Injectable()
export class InactivePersonHandler extends EventHandlerBase<InactivePersonEvent> {
  constructor(private readonly repository: IPersonRepository) {
    super()
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

##### Exemplo de Evento

Os eventos são definidos como classes que estendem `EventClass` e encapsulam os dados necessários para o processamento.

```typescript
import { EventClass } from '@koalarx/nest/core/backgroud-services/event-service/event-class'

export class InactivePersonEvent extends EventClass {}
```

##### Registro de EventJobs

Para que os EventJobs sejam executados, eles devem ser registrados no módulo correspondente. Por exemplo:

###### host/app.module.ts
```typescript
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
      cronJobs: [],
      eventJobs: [InactivePersonHandler],
    }),
  ],
})
export class AppModule {}
```

###### host/main.ts
```typescript
import { InactivePersonHandler } from '@/application/person/events/inactive-person/inactive-person-handler'
import { DbTransactionContext } from '@/infra/database/db-transaction-context'
import { KoalaApp } from '@koalarx/nest/core/koala-app'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  return NestFactory.create(AppModule).then((app) =>
    new KoalaApp(app)
      .addEventJob(InactivePersonHandler)
      ...
      .enableCors()
      .buildAndServe()
  )
}
```

#### Registro e Disparo de Eventos

Os eventos são adicionados ao job e disparados utilizando a classe `EventQueue`.

##### Exemplo de Adição e Disparo de Eventos

```typescript
import { EventQueue } from '@koalarx/nest/core/backgroud-services/event-service/event-queue'
import { InactivePersonEvent } from './inactive-person-event'
import { PersonEventJob } from './person-event.job'

const jobs = new PersonEventJob()
jobs.addEvent(new InactivePersonEvent())

EventQueue.dispatchEventsForAggregate(jobs._id)
```

## Infra
A camada **Infra** é responsável por fornecer a infraestrutura necessária para o funcionamento da aplicação. Ela contém implementações de acesso a dados, serviços externos e outras dependências que suportam as camadas superiores, como **Application** e **Domain**.

### Repository

Os **Repositories** são responsáveis por encapsular a lógica de acesso ao banco de dados, fornecendo métodos para leitura, escrita e manipulação de dados. Eles implementam interfaces definidas na camada **Domain**, garantindo que a lógica de persistência esteja desacoplada das regras de negócio.

#### Estrutura de um Repository

Os **Repositories** geralmente estendem classes base que fornecem funcionalidades comuns, como `RepositoryBase`, e implementam interfaces específicas para cada entidade.

##### Exemplo de Repository

###### infra/database/person.repository.ts
```typescript
import { ReadManyPersonDto } from '@/domain/dtos/read-many-person.dto'
import { Person } from '@/domain/entities/person/person'
import { IPersonRepository } from '@/domain/repositories/iperson.repository'
import { CreatedRegistreWithIdResponse } from '@koalarx/nest/core/controllers/created-registre-response.base'
import { ListResponseBase } from '@koalarx/nest/core/controllers/list-response.base'
import { RepositoryBase } from '@koalarx/nest/core/database/repository.base'
import { PRISMA_TOKEN } from '@koalarx/nest/core/koala-nest-database.module'
import { Inject, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
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
    return this.saveChanges(person).then((response) => {
      if (response) {
        return { id: response.id }
      }

      return null
    })
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

#### Registro de Repositories

Os **Repositories** são registrados em um módulo específico para que possam ser injetados em outras partes da aplicação.

##### Exemplo de Registro

######
```typescript
import { IPersonRepository } from '@/domain/repositories/iperson.repository'
import { KoalaNestDatabaseModule } from '@koalarx/nest/core/koala-nest-database.module'
import { Module } from '@nestjs/common'
import { PersonRepository } from './person.repository'

@Module({
  imports: [
    KoalaNestDatabaseModule.register({
      repositories: [{ interface: IPersonRepository, class: PersonRepository }],
      services: [],
    }),
  ],
  exports: [KoalaNestDatabaseModule],
})
export class RepositoriesModule {}
```

## Host
### Controller
### Build
#### Documentação
#### Ngrok
#### Filters

## Utils
### List

`List` é um `Array` com os métodos tradicionais como: `find`, `forEach`, etc...além de métodos `add`, `remove` e `update`.
O principal uso das listas é ter acesso ao que for incluído, removido e atualizado na lista, perfeito para ações no banco de dados que envolvem multiplas classes associadas a outra.

```typescript
const list = new List<number>()
list.add(1)
list.toArray('added') // [1]

list.remove(1)
list.toArray('removed') // [1]
```

```typescript
const list = new List(Person)

list.setList([new Person({id: 1, ...})])
list.add(new Person({id: 2, ...}))
list.toArray() // [Person, Person]
list.toArray('added') // [Person]

list.remove(new Person({id: 1, ...}))
list.toArray() // [Person]
list.toArray('removed') // [Person]
```

```typescript
const list = new List(Person)

// Define uma lista inicial
list.setList([
  new Person({
    id: 1, 
    name: 'John Doe', ...
  }),  
  new Person({id: 3, ...})
])

// Atualiza a lista, separando novos, removidos e atualizados
list.update([
  new Person({
    id: 1, 
    name: 'John', ...
  }),
  new Person({id: 2, ...})
])

list.toArray() // [Person(id: 1), Person(id: 2)]
list.toArray('added') // [Person(id: 2)]
list.toArray('updated') // [Person(id: 1)]
list.toArray('removed') // [Person(id: 3)]
```
### assignObject
### EnvConfig
### Promises
### setMaskDocumentNumber

## Environment

## Decorators

## API Key Strategy

## Errors

## Test
### Unit Test
### E2E Test
