---
title: Person CRUD flow
slug: person-crud-flow
category: guides
docKey: guias/fluxo-crud-person
order: 1
description: End-to-end guide to the Person module as a reference for new resources.
---

# Person CRUD flow

The **Person** module in the **CRUD Example** template demonstrates all layers working together. Use this guide as a reference when creating a new resource — steps 1 through 8 cover the complete flow.

## File overview

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

## 1. Model entities

Define entities with the core `@Entity` decorator and `@AutoMap()`:

```typescript
import { EntityBase } from '@/core/base/entity.base';
import { Entity } from '@/core/database/entity';
import { AutoMap } from '@/core/tools/mapping';
import {
  Column,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('person')
export class Person extends EntityBase<Person> {
  @PrimaryGeneratedColumn()
  @AutoMap()
  id: number;

  @Column()
  @AutoMap()
  name: string;

  @OneToOne(() => PersonAddress, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn()
  @AutoMap()
  address: PersonAddress;

  @OneToMany(() => PersonContact, (contact) => contact.person, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @AutoMap({ type: () => PersonContact })
  contacts: PersonContact[];
}
```

## 2. Define repository contract

```typescript
export abstract class IPersonRepository {
  abstract findMany(query: PersonQueryDto): Promise<ListResponse<Person>>;
  abstract findById(id: number): Promise<Person | null>;
  abstract save(person: Person): Promise<Person>;
  abstract delete(person: Person): Promise<void>;
}
```

## 3. Create requests, responses, validators, and handlers

Per operation:

| Operation | Request | Response | Validator | Handler |
| --- | --- | --- | --- | --- |
| create | yes | yes | yes | yes |
| read | — | yes | — | yes |
| read-many | yes | yes | yes | yes |
| update | yes | — | yes | yes |
| delete | — | — | — | yes |

Create example:

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

## 4. Register mappings

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

Call `PersonMapper.createMap()` in the `MappingProvider` constructor. This provider is loaded automatically by `ControllerModule` — no need to register it in `PersonModule`.

```typescript
@Injectable()
export class MappingProvider {
  constructor() {
    PersonMapper.createMap();
    // NewResourceMapper.createMap();
  }
}
```

## 5. Implement repository

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

Register in `RepositoryModule`:

```typescript
providers: [{ provide: IPersonRepository, useClass: PersonRepository }],
```

## 6. Create controllers and route

```typescript
class PersonRouterConfig extends RouterConfigBase {
  constructor() {
    super('Person', '/person');
  }
}

export const PERSON_ROUTER_CONFIG = new PersonRouterConfig();
```

One controller per operation, all with `@Controller(PERSON_ROUTER_CONFIG)`.

## 7. Assemble the Nest module

```typescript
@Module({
  imports: [ControllerModule],
  controllers: [CreatePersonController, /* ... */],
  providers: [CreatePersonHandler, /* ... */],
})
export class PersonModule {}
```

Import `PersonModule` in `AppModule`.

## 8. Generate migration

With entities decorated using the core `@Entity`, `dataSourceFactory` already includes them via `DbContext`. Generate and apply the migration:

```bash
bun run migration:generate
bun run migration:run
bun run start:dev
```

The migration generator (`migration-datasource.ts`) discovers entities in `src/domain/entities/` by glob.

Visit `http://localhost:3000/doc` to test endpoints interactively.

## 9. Background jobs (Cron and Event)

The CRUD template includes examples in `src/application/person/jobs/cron/` and `src/application/person/jobs/events/`:

```
src/application/person/jobs/
├── cron/
│   ├── create-person.job.ts
│   └── delete-inactive.job.ts
└── events/
    └── person/
        ├── person-event.job.ts
        └── inactive-person/
            ├── inactive-person.event.ts
            └── inactive-person.handler.ts
```

| Job / Handler | Type | Behavior (example) |
| --- | --- | --- |
| `CreatePersonJob` | CronJob | Creates a person every 15 seconds and fires `InactivePersonEvent` |
| `DeleteInactiveJob` | CronJob | Periodically removes inactive people |
| `InactivePersonHandler` | EventJob | Deactivates active people when the event is dispatched |

Registration in `AppModule` via `JobsModule.register()`:

```typescript
JobsModule.register({
  imports: [PersonModule],
  eventHandlers: [InactivePersonHandler],
  cronJobs: [CreatePersonJob, DeleteInactiveJob],
}),
```

`JobsBootstrapService` subscribes handlers and starts cron jobs automatically.

Full guide: [Cron and Event Jobs](../core/cron-event-jobs.md).

## Available endpoints

| Operation | Method | Route | Handler |
| --- | --- | --- | --- |
| Create | `POST` | `/person` | CreatePersonHandler |
| List | `GET` | `/person` | ReadManyPersonHandler |
| Fetch | `GET` | `/person/:id` | ReadPersonHandler |
| Update | `PUT` | `/person` | UpdatePersonHandler |
| Delete | `DELETE` | `/person/:id` | DeletePersonHandler |

## Summary

When creating a resource similar to Person, follow the steps in this guide in order:

1. **Domain** — entities, `I<Resource>Repository` contract, and query DTOs (if there is listing)
2. **Application** — handlers, requests, responses, validators, and `<Resource>Mapper.createMap()` in `MappingProvider`
3. **Infra** — concrete repository and provider in `RepositoryModule`
4. **Host** — `router.config.ts`, controllers, `<Resource>Module`, and import in `AppModule`
5. **Migrations** — `migration:generate`, review the generated file, and `migration:run`

## Framework patterns (4.x)

### Query DTOs with `PaginationDto.from()`

Query DTOs do **not** extend `ObjectClass` (partial props). Use the inherited factory:

```typescript
const query = PersonQueryDto.from({ name: 'Jane', limit: 50 });
```

### Paginated responses with `ListResponseBase`

Handlers return `MyListResponse.from({ items, count })` instead of duplicating `items`/`count`:

```typescript
export class ReadManyPersonResponse extends ListResponseBase<ReadManyPersonResponseItem> {}
```

### Partial entities (import/jobs)

For incomplete props, do **not** use `.from()` — instantiate and assign fields, or call `initializeUndefinedArrayProps(entity, EntityClass)` after `new`.

### `HOST` vs `API_HOST`

- **`HOST`** (default `0.0.0.0`) — server bind address (Docker/K8s).
- **`API_HOST`** — public hostname for Swagger and OAuth URLs (`resolveApiHost`).

### Default sort in Query DTO

Override `generateOrderBy()` in the query DTO instead of patching the handler:

```typescript
export class PersonQueryDto extends PaginationDto {
  override generateOrderBy() {
    if (this.orderBy) return super.generateOrderBy();
    return { id: 'asc' };
  }
}
```

### Advanced TypeORM (`PaginationDto`)

- `toFindOptionsOrder()` — converts `generateOrderBy()` to `FindOptionsOrder` (ASC/DESC).
- `applyQueryBuilderPagination(qb, alias)` — applies order + skip/take on QueryBuilder.

Rate limit is included in core. See [HTTP middleware](../host/http-middleware.md).
