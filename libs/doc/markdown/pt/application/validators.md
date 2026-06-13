---
title: Validators
slug: validators
category: application
order: 2
description: Validação de entrada com RequestValidatorBase e schemas Zod.
---

# Validators

Validators garantem que dados de entrada (body, query params) estejam corretos **antes** de chegar ao repositório. Erros de validação são lançados como `ZodError` e tratados pelo filtro global.

## Estrutura

Cada validator estende `RequestValidatorBase` e define um getter `schema` com Zod:

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

## Uso no handler

Validators são instanciados inline — não são providers NestJS:

```typescript
const person = AutoMapper.map(
  new CreatePersonValidator(req).validate(),
  CreatePersonRequest,
  Person,
);
```

Se a validação falhar, `validate()` lança `ZodError`. O `ErrorsFilter` converte em resposta HTTP 400 via `formatZodError()` — mensagens em **português**:

```json
{
  "statusCode": 400,
  "message": "O campo name é obrigatório.",
  "errors": [
    { "field": "name", "message": "O campo name é obrigatório." }
  ]
}
```

Com múltiplos erros, `message` vira `"Foram encontrados N erros de validação."`.

## Validação de listagem

Validators de query combinam filtros específicos com `LIST_QUERY_SCHEMA`:

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

## Normalização de arrays na query string

O `RequestValidatorBase` converte chaves com `[]` em arrays. Por exemplo, `tags[]=a,b` vira `{ tags: ['a', 'b'] }` antes da validação Zod.

## Boas práticas

- Validators existem para operações com body ou query params: **create**, **update** e **read-many**. Read e delete recebem apenas o `id` no handler.
- Schemas Zod espelham a estrutura do request class, não da entidade.
- Regras de negócio complexas podem ficar no handler ou em serviços de domínio; validators focam em formato e constraints de entrada.
