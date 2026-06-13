---
title: Fluxo CRUD Person
slug: fluxo-crud-person
category: guias
docKey: guias/fluxo-crud-person
order: 1
description: Guia ponta a ponta do módulo Person como referência para novos recursos.
---

# Fluxo CRUD Person

O módulo **Person** do template **Exemplo de CRUD** demonstra todas as camadas trabalhando juntas. Use este guia como referência ao criar um novo recurso — as etapas 1 a 8 cobrem o fluxo completo.

## Visão geral dos arquivos

```
src/
├── domain/
│   ├── entities/person/
│   │   ├── person.ts
│   │   ├── person-address.ts
│   │   └── person-contact.ts
│   ├── dtos/
│   │   ├── pagination.dto.ts
│   │   └── person-query.dto.ts
│   └── repositories/
│       └── iperson.repository.ts
├── application/
│   ├── mapping/
│   │   ├── person.mapper.ts
│   │   └── mapping.provider.ts
│   └── person/
│       ├── create/
│       ├── read/
│       ├── read-many/
│       ├── update/
│       └── delete/
├── infra/
│   └── repositories/
│       └── person.repository.ts
└── host/
    └── controllers/person/
        ├── router.config.ts
        ├── person.module.ts
        └── *.controller.ts
```

## 1. Modelar entidades

Defina entidades com TypeORM e `@AutoMap()`:

```typescript
@Entity('person')
export class Person extends EntityBase<Person> {
  @PrimaryGeneratedColumn()
  @AutoMap()
  id: number;

  @Column()
  @AutoMap()
  name: string;

  @OneToOne(() => PersonAddress, { cascade: true, eager: true, onDelete: 'CASCADE' })
  @JoinColumn()
  @AutoMap()
  address: PersonAddress;

  @OneToMany(() => PersonContact, (contact) => contact.person, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  @AutoMap({ type: () => PersonContact })
  contacts: PersonContact[];
}
```

## 2. Definir contrato de repositório

```typescript
export abstract class IPersonRepository {
  abstract findMany(query: PersonQueryDto): Promise<ListResponse<Person>>;
  abstract findById(id: number): Promise<Person | null>;
  abstract save(person: Person): Promise<Person>;
  abstract delete(person: Person): Promise<void>;
}
```

## 3. Criar requests, responses, validators e handlers

Por operação:

| Operação | Request | Response | Validator | Handler |
| --- | --- | --- | --- | --- |
| create | sim | sim | sim | sim |
| read | — | sim | — | sim |
| read-many | sim | sim | sim | sim |
| update | sim | — | sim | sim |
| delete | — | — | — | sim |

Exemplo de create:

```typescript
async handle(req: CreatePersonRequest): Promise<CreatePersonResponse> {
  const person = AutoMapper.map(
    new CreatePersonValidator(req).validate(),
    CreatePersonRequest,
    Person,
  );
  const createdPerson = await this.repository.save(person);
  return AutoMapper.map(createdPerson, Person, CreatePersonResponse);
}
```

## 4. Registrar mapeamentos

```typescript
export class PersonMapper {
  static createMap() {
    createMap(Person, CreatePersonResponse);

    createMap(Person, ReadPersonResponse);
    createMap(PersonAddress, ReadPersonAddressResponse);
    createMap(PersonContact, ReadPersonContactResponse);

    createMap(CreatePersonRequest, Person);
    createMap(CreatePersonAddressRequest, PersonAddress);
    createMap(CreatePersonContactRequest, PersonContact);

    createMap(UpdatePersonRequest, Person);
    createMap(UpdatePersonAddressRequest, PersonAddress);
    createMap(UpdatePersonContactRequest, PersonContact);

    createMap(ReadManyPersonRequest, PersonQueryDto);
    createMap(Person, ReadManyPersonResponseItem);
  }
}
```

Chame `PersonMapper.createMap()` no construtor do `MappingProvider`. Esse provider é carregado automaticamente pelo `ControllerModule` — não é necessário registrá-lo no `PersonModule`.

```typescript
@Injectable()
export class MappingProvider {
  constructor() {
    PersonMapper.createMap();
    // NovoRecursoMapper.createMap();
  }
}
```

## 5. Implementar repositório

```typescript
@Injectable()
export class PersonRepository
  extends RepositoryBase<Person>
  implements IPersonRepository
{
  constructor(@Inject(DATA_SOURCE_PROVIDER_TOKEN) dataSource: DataSource) {
    super(dataSource, Person);
  }

  findMany(query: PersonQueryDto): Promise<ListResponse<Person>> { /* ... */ }
  findById(id: number): Promise<Person | null> { /* ... */ }
}
```

Registre no `RepositoryModule`:

```typescript
providers: [{ provide: IPersonRepository, useClass: PersonRepository }],
```

## 6. Criar controllers e rota

```typescript
class PersonRouterConfig extends RouterConfigBase {
  constructor() {
    super('Person', '/person');
  }
}

export const PERSON_ROUTER_CONFIG = new PersonRouterConfig();
```

Um controller por operação, todos com `@Controller(PERSON_ROUTER_CONFIG)`.

## 7. Montar o módulo Nest

```typescript
@Module({
  imports: [ControllerModule],
  controllers: [CreatePersonController, /* ... */],
  providers: [CreatePersonHandler, /* ... */],
})
export class PersonModule {}
```

Importe `PersonModule` no `AppModule`.

## 8. Registrar entidades e gerar migration

Adicione as entidades no `dataSourceFactory` (runtime) e gere a migration:

```typescript
// src/infra/database/data-source-factory.ts
entities: [Person, PersonAddress, PersonContact],
```

```bash
bun run migration:generate
bun run migration:run
bun run start:dev
```

O gerador de migrations (`migration-datasource.ts`) descobre entidades em `src/domain/entities/` por glob — o registro explícito no `dataSourceFactory` é obrigatório para o servidor em runtime.

Acesse `http://localhost:3000/doc` para testar os endpoints interativamente.

## 9. Jobs em background (Cron e Event)

O template CRUD inclui exemplos em `src/application/person/jobs/` e `src/application/person/events/`:

| Job / Handler | Tipo | Comportamento (exemplo) |
| --- | --- | --- |
| `CreatePersonJob` | CronJob | Cria pessoa a cada minuto e dispara `InactivePersonEvent` |
| `DeleteInactiveJob` | CronJob | Remove pessoas inativas periodicamente |
| `InactivePersonHandler` | EventJob | Inativa pessoas ativas quando o evento é despachado |

Registro no bootstrap (`src/host/main.ts`):

```typescript
const inactivePersonHandler = await app.resolve(InactivePersonHandler);
inactivePersonHandler.setupSubscriptions();

await delay(5000);

const createPersonJob = await app.resolve(CreatePersonJob);
const deleteInactiveJob = await app.resolve(DeleteInactiveJob);

createPersonJob.start();
deleteInactiveJob.start();
```

Guia completo: [Cron e Event Jobs](../core/cron-event-jobs.md).

## Endpoints disponíveis

| Operação | Método | Rota | Handler |
| --- | --- | --- | --- |
| Criar | `POST` | `/person` | CreatePersonHandler |
| Listar | `GET` | `/person` | ReadManyPersonHandler |
| Buscar | `GET` | `/person/:id` | ReadPersonHandler |
| Atualizar | `PUT` | `/person` | UpdatePersonHandler |
| Remover | `DELETE` | `/person/:id` | DeletePersonHandler |

## Resumo

Ao criar um recurso semelhante ao Person, percorra as etapas deste guia nesta ordem:

1. **Domain** — entidades, contrato `I<Recurso>Repository` e DTOs de consulta (se houver listagem)
2. **Application** — handlers, requests, responses, validators e `<Recurso>Mapper.createMap()` no `MappingProvider`
3. **Infra** — repositório concreto, provider no `RepositoryModule` e entidades no `dataSourceFactory`
4. **Host** — `router.config.ts`, controllers, `<Recurso>Module` e import no `AppModule`
5. **Migrations** — `migration:generate`, revisão do arquivo gerado e `migration:run`
