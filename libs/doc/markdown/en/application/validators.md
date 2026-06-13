---
title: Validators
slug: validators
category: application
docKey: application/validators
order: 2
description: Input validation with RequestValidatorBase and Zod schemas.
---

# Validators

Validators ensure input data (body, query params) is correct **before** reaching the repository. Validation errors are thrown as `ZodError` and handled by the global filter.

## Structure

Each validator extends `RequestValidatorBase` and defines a `schema` getter with Zod:

```typescript
export class CreatePersonValidator extends RequestValidatorBase<CreatePersonRequest> {
  protected get schema() {
    return z.object({
      name: z.string().min(1),
      address: z.object({
        address: z.string().min(1),
      }),
      contacts: z.array(
        z.object({
          contact: z.string().min(1),
        }),
      ),
    });
  }
}
```

## Usage in the handler

Validators are instantiated inline — they are not NestJS providers:

```typescript
const person = AutoMapper.map(
  new CreatePersonValidator(req).validate(),
  CreatePersonRequest,
  Person,
);
```

If validation fails, `validate()` throws `ZodError`. `ErrorsFilter` converts it to an HTTP 400 response via `formatZodError()` — messages in **Portuguese**:

```json
{
  "statusCode": 400,
  "message": "O campo name é obrigatório.",
  "errors": [
    { "field": "name", "message": "O campo name é obrigatório." }
  ]
}
```

With multiple errors, `message` becomes `"Foram encontrados N erros de validação."`.

## List validation

Query validators combine specific filters with `LIST_QUERY_SCHEMA`:

```typescript
// src/application/person/read-many/read-many-person.validator.ts
export class ReadManyPersonValidator extends RequestValidatorBase<ReadManyPersonRequest> {
  protected get schema() {
    return LIST_QUERY_SCHEMA.and(
      z.object({
        name: z.string().optional().nullable(),
      }),
    );
  }
}
```

## Query string array normalization

`RequestValidatorBase` converts keys with `[]` into arrays. For example, `tags[]=a,b` becomes `{ tags: ['a', 'b'] }` before Zod validation.

## Best practices

- Validators exist for operations with body or query params: **create**, **update**, and **read-many**. Read and delete receive only the `id` in the handler.
- Zod schemas mirror the request class structure, not the entity.
- Complex business rules can live in the handler or domain services; validators focus on input format and constraints.
