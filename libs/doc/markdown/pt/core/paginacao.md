---
title: Paginação e filtros
slug: paginacao
category: core
order: 3
description: Paginação, ordenação e filtros em listagens com PaginationRequest e PaginationDto.
---

# Paginação e filtros

O Koala Nest padroniza listagens paginadas com classes reutilizáveis na camada de application e domain.

## Parâmetros padrão

Constantes centralizadas em `src/core/constants/query-params.ts`:

```typescript
export const QUERY_FILTER_PARAMS = {
  direction: 'asc' as QueryDirectionType,
  page: 0,
  limit: 30,
};
```

## PaginationRequest (application)

Classe base para requests de listagem, com decoradores Swagger e `@AutoMap()`:

```typescript
export class PaginationRequest {
  @ApiProperty({
    required: false,
    format: 'int32',
    default: QUERY_FILTER_PARAMS.page,
  })
  @AutoMap()
  page?: number = QUERY_FILTER_PARAMS.page;

  @ApiProperty({
    required: false,
    format: 'int32',
    default: QUERY_FILTER_PARAMS.limit,
  })
  @AutoMap()
  limit?: number = QUERY_FILTER_PARAMS.limit;

  @ApiProperty({ required: false })
  @AutoMap()
  orderBy?: string;

  @ApiProperty({
    required: false,
    enum: ['asc', 'desc'],
    default: QUERY_FILTER_PARAMS.direction,
  })
  @AutoMap()
  direction?: QueryDirectionType = QUERY_FILTER_PARAMS.direction;
}
```

## Request específico de domínio

Estenda `PaginationRequest` para adicionar filtros:

```typescript
export class ReadManyPersonRequest extends PaginationRequest {
  @ApiProperty()
  @AutoMap()
  name?: string;
}
```

## Schema Zod compartilhado

Validação de query params reutiliza `LIST_QUERY_SCHEMA`:

```typescript
export const LIST_QUERY_SCHEMA = z.object({
  page: z.coerce
    .number()
    .transform((value) => {
      if (value) {
        return value - 1;
      }
      return QUERY_FILTER_PARAMS.page;
    })
    .optional(),
  limit: z.coerce.number().default(QUERY_FILTER_PARAMS.limit).optional(),
  orderBy: z.string().optional(),
  direction: z.enum(['asc', 'desc']).default('asc').optional(),
});
```

> A página informada na query string é **1-based** para o cliente, mas convertida para **0-based** internamente.

## PaginationDto (domain)

O DTO de domínio encapsula lógica de skip e orderBy para o TypeORM:

```typescript
export class PaginationDto {
  @AutoMap()
  page?: number = 0;

  @AutoMap()
  limit?: number = QUERY_FILTER_PARAMS.limit;

  @AutoMap()
  orderBy?: string = '';

  @AutoMap()
  direction?: QueryDirectionType = 'asc';

  skip() {
    return (this.limit ?? 0) * (this.page ?? QUERY_FILTER_PARAMS.page);
  }

  generateOrderBy() {
    if (this.orderBy) {
      const orderByField = this.orderBy.split('.');
      return orderByField.reduceRight(
        (acc, item, index) => ({
          [item]: index === orderByField.length - 1 ? this.direction : acc,
        }),
        {},
      );
    }

    return undefined;
  }
}
```

## Uso no repositório

```typescript
findMany(query: PersonQueryDto): Promise<ListResponse<Person>> {
  return this.repository
    .findAndCount({
      where: { name: query.name ? Like(`%${query.name}%`) : undefined },
      order: query.generateOrderBy(),
      skip: query.skip(),
      take: query.limit,
    })
    .then(([items, count]) => ({
      items,
      count,
    }));
}
```

## Tipo ListResponse

```typescript
export interface ListResponse<T> {
  items: T[];
  count: number;
}
```

## Exemplo de requisição HTTP

```http
GET /person?page=1&limit=10&orderBy=name&direction=desc&name=John
```
