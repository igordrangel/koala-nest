---
title: ObjectClass
slug: object-class
category: core
docKey: core/object-class
order: 3
description: Utility class for requests, responses, and entities with the from() factory.
---

# ObjectClass

`ObjectClass` is a lightweight base class used in **create** requests, in `ReadManyPersonResponse`, and in entities (`EntityBase`). It provides the static `from()` method to build instances from plain objects.

## Definition

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

## Usage in requests

Create requests extend `ObjectClass` and combine `@AutoMap()` and `@ApiProperty()` decorators:

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

## Usage in paginated responses

List responses use `ListResponseBase` (already provides `items`/`count` and the `from()` factory):

```typescript
export class ReadManyPersonResponse extends ListResponseBase<ReadManyPersonResponseItem> {}
```

In the handler, the response is built with:

```typescript
return ReadManyPersonResponse.from({
  items: result.items.map((item) =>
    AutoMapper.map(item, Person, ReadManyPersonResponseItem),
  ),
  count: result.count,
});
```

## Relationship with EntityBase

Domain entities extend `EntityBase<T>`, which inherits from `ObjectClass<T>`. This maintains consistency across layers without coupling TypeORM entities to HTTP requests.
