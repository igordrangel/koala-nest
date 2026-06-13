---
title: Requests e responses
slug: requests-responses
category: application
docKey: application/requests-responses
order: 3
description: DTOs de entrada e saída com ObjectClass, AutoMap e decoradores Swagger.
---

# Requests e responses

A camada application define contratos de entrada e saída para cada operação. Essas classes alimentam tanto o mapeamento quanto a documentação OpenAPI.

## Request de criação

Requests de **create** estendem `ObjectClass` e usam `@ApiProperty()` para Swagger e `@AutoMap()` para mapeamento:

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

## Response de criação

Responses mínimas retornam apenas o identificador gerado:

```typescript
import { CreatedRegistreWithIdResponse } from '@/application/common/created-registre.response';

export class CreatePersonResponse extends CreatedRegistreWithIdResponse {}
```

Para novos recursos, reutilize `CreatedRegistreWithIdResponse` ou `CreatedRegistreWithUUIDResponse` de `created-registre.response.ts`.

## Request de atualização

Requests de **update** são classes planas — não estendem `ObjectClass`:

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

## Response de leitura

Responses de leitura expõem o modelo completo (ou um subconjunto) mapeado da entidade:

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

## Response de listagem

Listagens retornam `items` e `count`:

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

## Request de listagem

Estenda `PaginationRequest` para herdar parâmetros de paginação:

```typescript
export class ReadManyPersonRequest extends PaginationRequest {
  @ApiProperty()
  @AutoMap()
  name?: string;
}
```

## Convenção de pastas

Organize por recurso e operação:

```
src/application/person/
├── create/       # request, response, handler, validator
├── read/         # handler, response
├── read-many/    # request, response, handler, validator
├── update/       # request, handler, validator
└── delete/       # handler
```
