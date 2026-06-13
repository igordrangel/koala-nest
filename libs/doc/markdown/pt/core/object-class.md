---
title: ObjectClass
slug: object-class
category: core
order: 2
description: Classe utilitária para requests, responses e entidades com factory from().
---

# ObjectClass

`ObjectClass` é uma classe base leve usada em requests de **create**, em `ReadManyPersonResponse` e em entidades (`EntityBase`). Ela oferece o método estático `from()` para construir instâncias a partir de objetos literais.

## Definição

```typescript
// src/core/base/object-class.ts
export type ObjectClassProps<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K];
};

export abstract class ObjectClass<T = object> {
  declare protected readonly _propsType?: ObjectClassProps<T>;

  static from<This extends new () => object>(
    this: This,
    props: ObjectClassProps<InstanceType<This>>,
  ): InstanceType<This> {
    return Object.assign(new this(), props) as InstanceType<This>;
  }
}
```

## Uso em requests

Requests de criação estendem `ObjectClass` e combinam decoradores `@AutoMap()` e `@ApiProperty()`:

```typescript
export class CreatePersonRequest extends ObjectClass<CreatePersonRequest> {
  @ApiProperty({ example: 'John Doe' })
  @AutoMap()
  name: string;

  @ApiProperty({ type: CreatePersonAddressRequest })
  @AutoMap()
  address: CreatePersonAddressRequest;

  @ApiProperty({ type: CreatePersonContactRequest, isArray: true })
  @AutoMap({ type: () => CreatePersonContactRequest })
  contacts: CreatePersonContactRequest[];
}
```

## Uso em responses paginadas

Responses de listagem também usam `ObjectClass` e o factory `from()`:

```typescript
export class ReadManyPersonResponse extends ObjectClass<
  ListResponse<ReadManyPersonResponseItem>
> {
  @ApiProperty({ type: [ReadManyPersonResponseItem] })
  @AutoMap({ type: () => ReadManyPersonResponseItem })
  items: ReadManyPersonResponseItem[];

  @ApiProperty()
  @AutoMap()
  count: number;
}
```

No handler, a resposta é montada com:

```typescript
return ReadManyPersonResponse.from(
  await this.repository.findMany(query).then((result) => ({
    items: result.items.map((item) =>
      AutoMapper.map(item, Person, ReadManyPersonResponseItem),
    ),
    count: result.count,
  })),
);
```

## Relação com EntityBase

Entidades de domínio estendem `EntityBase<T>`, que herda de `ObjectClass<T>`. Isso mantém consistência entre camadas sem acoplar entidades TypeORM a requests HTTP.
