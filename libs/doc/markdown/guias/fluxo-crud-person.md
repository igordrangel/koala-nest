---
title: Fluxo CRUD Person
slug: fluxo-crud-person
category: guias
order: 1
description: Guia ponta a ponta do módulo Person como referência para novos recursos.
---

# Fluxo CRUD Person

O módulo **Person** do template Exemplo de CRUD demonstra todas as camadas trabalhando juntas. Use este guia como checklist ao criar um novo recurso.

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
    createMap(CreatePersonRequest, Person);
    createMap(ReadManyPersonRequest, PersonQueryDto);
    createMap(Person, ReadManyPersonResponseItem);
    // ... demais pares
  }
}
```

Chame `PersonMapper.createMap()` no `MappingProvider`.

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

## 8. Gerar migration e testar

```bash
bun run migration:generate
bun run migration:run
bun run start:dev
```

Acesse `http://localhost:3000/doc` para testar os endpoints interativamente.

## Endpoints disponíveis

| Operação | Método | Rota | Handler |
| --- | --- | --- | --- |
| Criar | `POST` | `/person` | CreatePersonHandler |
| Listar | `GET` | `/person` | ReadManyPersonHandler |
| Buscar | `GET` | `/person/:id` | ReadPersonHandler |
| Atualizar | `PUT` | `/person` | UpdatePersonHandler |
| Remover | `DELETE` | `/person/:id` | DeletePersonHandler |

## Checklist para novo recurso

- [ ] Entidades em `domain/entities/`
- [ ] Classe abstrata `I<Recurso>Repository` em `domain/repositories/`
- [ ] DTOs de consulta em `domain/dtos/` (se listagem)
- [ ] Pasta `application/<recurso>/` com handlers; requests, responses e validators conforme a operação
- [ ] `<Recurso>Mapper.createMap()` registrado no `MappingProvider`
- [ ] Repositório concreto em `infra/repositories/`
- [ ] Provider no `RepositoryModule`
- [ ] `router.config.ts` e controllers em `host/controllers/<recurso>/`
- [ ] `<Recurso>Module` importado no `AppModule`
- [ ] Entidades registradas no `dataSourceFactory` e migration gerada
