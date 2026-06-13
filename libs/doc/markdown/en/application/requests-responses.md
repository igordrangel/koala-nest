---
title: Requests and responses
slug: requests-responses
category: application
docKey: application/requests-responses
order: 3
description: Input and output DTOs with ObjectClass, AutoMap, and Swagger decorators.
---

# Requests and responses

The application layer defines input and output contracts for each operation. These classes feed both mapping and OpenAPI documentation.

## Create request

**Create** requests extend `ObjectClass` and use `@ApiProperty()` for Swagger and `@AutoMap()` for mapping:

```typescript
export class CreatePersonAddressRequest extends ObjectClass<CreatePersonAddressRequest> {
  @ApiProperty({ example: '123 Main St' })
  @AutoMap()
  address: string;
}

export class CreatePersonContactRequest extends ObjectClass<CreatePersonContactRequest> {
  @ApiProperty({ example: 'john.doe@example.com' })
  @AutoMap()
  contact: string;
}

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

## Create response

Minimal responses return only the generated identifier:

```typescript
import { CreatedRegistreWithIdResponse } from '@/application/common/created-registre.response';

export class CreatePersonResponse extends CreatedRegistreWithIdResponse {}
```

For new resources, reuse `CreatedRegistreWithIdResponse` or `CreatedRegistreWithUUIDResponse` from `created-registre.response.ts`.

## Update request

**Update** requests are plain classes — they do not extend `ObjectClass`:

```typescript
// src/application/person/update/update-person.request.ts
export class UpdatePersonRequest {
  @ApiProperty({ example: 1 })
  @AutoMap()
  id: number;

  @ApiProperty({ example: 'John Doe' })
  @AutoMap()
  name: string;

  @ApiProperty({ type: () => UpdatePersonAddressRequest })
  @AutoMap()
  address: UpdatePersonAddressRequest;

  @ApiProperty({ type: () => UpdatePersonContactRequest, isArray: true })
  @AutoMap({ type: () => UpdatePersonContactRequest })
  contacts: UpdatePersonContactRequest[];
}
```

## Read response

Read responses expose the full model (or a subset) mapped from the entity:

```typescript
// src/application/person/read/read-person.response.ts
export class ReadPersonResponse {
  @ApiProperty({ example: 1 })
  @AutoMap()
  id: number;

  @ApiProperty({ example: 'John Doe' })
  @AutoMap()
  name: string;

  @ApiProperty({ type: () => ReadPersonAddressResponse })
  @AutoMap()
  address: ReadPersonAddressResponse;

  @ApiProperty({ type: () => ReadPersonContactResponse, isArray: true })
  @AutoMap({ type: () => ReadPersonContactResponse })
  contacts: ReadPersonContactResponse[];
}
```

## List response

Listings return `items` and `count`:

```typescript
export class ReadManyPersonResponseItem {
  @ApiProperty()
  @AutoMap()
  id: number;

  @ApiProperty()
  @AutoMap()
  name: string;
}

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

## List request

Extend `PaginationRequest` to inherit pagination parameters:

```typescript
export class ReadManyPersonRequest extends PaginationRequest {
  @ApiProperty()
  @AutoMap()
  name?: string;
}
```

## Folder convention

Organize by resource and operation:

```
src/application/person/
├── create/       # request, response, handler, validator
├── read/         # handler, response
├── read-many/    # request, response, handler, validator
├── update/       # request, handler, validator
├── delete/       # handler
└── jobs/
    ├── cron/     # CronJobHandlerBase
    └── events/   # EventJob + handlers by specialty
```
