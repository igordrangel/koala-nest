---
title: Handlers
slug: handlers
category: application
docKey: application/handlers
order: 1
description: Casos de uso na camada application com RequestHandlerBase.
---

# Handlers

Handlers encapsulam **casos de uso** — a orquestração entre validação, mapeamento, repositório e resposta. Cada operação HTTP tem um handler dedicado.

## Padrão geral

1. Validar o request com um validator Zod (create, update, read-many).
2. Mapear request → entidade ou DTO de domínio.
3. Executar operação no repositório.
4. Mapear entidade → response (quando aplicável).

Operações **read** e **delete** recebem apenas o `id` — não possuem validator nem request class.

## Create — criar recurso

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

## Read — buscar por ID

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

## ReadMany — listagem paginada

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

## Update — atualizar recurso

O update carrega a entidade existente, aplica os campos validados e trata merge de contatos (atualiza por `id` ou cria novos):

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

> Os maps `UpdatePersonRequest → Person` no `PersonMapper` existem para referência, mas este handler aplica os campos manualmente por causa da lógica de contatos.

## Delete — remover recurso

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

## Registro no módulo

Handlers são registrados como providers no módulo de feature:

```typescript
providers: [
  CreatePersonHandler,
  ReadPersonHandler,
  ReadManyPersonHandler,
  UpdatePersonHandler,
  DeletePersonHandler,
],
```
