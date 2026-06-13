---
title: Handlers
slug: handlers
category: application
docKey: application/handlers
order: 1
description: Use cases in the application layer with RequestHandlerBase.
---

# Handlers

Handlers encapsulate **use cases** — orchestration between validation, mapping, repository, and response. Each HTTP operation has a dedicated handler.

## General pattern

1. Validate the request with a Zod validator (create, update, read-many).
2. Map request → entity or domain DTO.
3. Execute the operation on the repository.
4. Map entity → response (when applicable).

**Read** and **delete** operations receive only the `id` — they have no validator or request class.

## Create — create resource

```typescript
@Injectable()
export class CreatePersonHandler extends RequestHandlerBase<
  CreatePersonRequest,
  CreatePersonResponse
> {
  constructor(private readonly repository: IPersonRepository) {
    super();
  }

  async handle(req: CreatePersonRequest): Promise<CreatePersonResponse> {
    const person = AutoMapper.map(
      new CreatePersonValidator(req).validate(),
      CreatePersonRequest,
      Person,
    );
    const createdPerson = await this.repository.save(person);
    return AutoMapper.map(createdPerson, Person, CreatePersonResponse);
  }
}
```

## Read — fetch by ID

```typescript
@Injectable()
export class ReadPersonHandler implements RequestHandlerBase<
  number,
  ReadPersonResponse
> {
  constructor(private readonly repository: IPersonRepository) {}

  async handle(id: number): Promise<ReadPersonResponse> {
    const person = await this.repository.findById(id);

    if (!person) {
      throw new NotFoundException('Pessoa não encontrada');
    }

    return AutoMapper.map(person, Person, ReadPersonResponse);
  }
}
```

## ReadMany — paginated listing

```typescript
@Injectable()
export class ReadManyPersonHandler extends RequestHandlerBase<
  ReadManyPersonRequest,
  ReadManyPersonResponse
> {
  constructor(private readonly repository: IPersonRepository) {
    super();
  }

  async handle(req: ReadManyPersonRequest): Promise<ReadManyPersonResponse> {
    const query = AutoMapper.map(
      new ReadManyPersonValidator(req).validate(),
      ReadManyPersonRequest,
      PersonQueryDto,
    );

    return ReadManyPersonResponse.from(
      await this.repository.findMany(query).then((result) => ({
        items: result.items.map((item) =>
          AutoMapper.map(item, Person, ReadManyPersonResponseItem),
        ),
        count: result.count,
      })),
    );
  }
}
```

## Update — update resource

The update flow loads the existing entity, applies validated fields, and merges contacts (update by `id` or create new ones):

```typescript
@Injectable()
export class UpdatePersonHandler implements RequestHandlerBase<
  UpdatePersonRequest,
  void
> {
  constructor(private readonly repository: IPersonRepository) {}

  async handle(request: UpdatePersonRequest): Promise<void> {
    const validated = new UpdatePersonValidator(request).validate();
    const person = await this.repository.findById(validated.id);

    if (!person) {
      throw new NotFoundException('Pessoa não encontrada');
    }

    person.name = validated.name;
    person.address.address = validated.address.address;

    person.contacts = validated.contacts.map((contactRequest) => {
      if (contactRequest.id) {
        const existing = person.contacts.find(
          (contact) => contact.id === contactRequest.id,
        );

        if (existing) {
          existing.contact = contactRequest.contact;
          return existing;
        }
      }

      const contact = new PersonContact();
      contact.contact = contactRequest.contact;
      contact.person = person;
      return contact;
    });

    await this.repository.save(person);
  }
}
```

> `UpdatePersonRequest → Person` maps exist in `PersonMapper` for reference, but this handler applies fields manually because of contact merge logic.

## Delete — remove resource

```typescript
@Injectable()
export class DeletePersonHandler implements RequestHandlerBase<number, void> {
  constructor(private readonly repository: IPersonRepository) {}

  async handle(id: number): Promise<void> {
    const person = await this.repository.findById(id);

    if (!person) {
      throw new NotFoundException('Pessoa não encontrada');
    }

    await this.repository.delete(person);
  }
}
```

## Module registration

Handlers are registered as providers in the feature module:

```typescript
providers: [
  CreatePersonHandler,
  ReadPersonHandler,
  ReadManyPersonHandler,
  UpdatePersonHandler,
  DeletePersonHandler,
],
```
