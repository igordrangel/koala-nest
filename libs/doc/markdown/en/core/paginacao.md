---
title: Pagination and filters
slug: paginacao
category: core
order: 3
description: Pagination, sorting, and filters in listings with PaginationRequest and PaginationDto.
---

# Pagination and filters

Koala Nest standardizes paginated listings with reusable classes in the application and domain layers.

## Default parameters

Centralized constants in `src/core/constants/query-params.ts`:

```typescript
export const QUERY_FILTER_PARAMS = {
  direction: 'asc' as QueryDirectionType,
  page: 0,
  limit: 30,
};
```

## PaginationRequest (application)

Base class for list requests, with Swagger decorators and `@AutoMap()`:

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

## Domain-specific request

Extend `PaginationRequest` to add filters:

```typescript
export class ReadManyPersonRequest extends PaginationRequest {
  @ApiProperty()
  @AutoMap()
  name?: string;
}
```

## Shared Zod schema

Query param validation reuses `LIST_QUERY_SCHEMA`:

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

> The page provided in the query string is **1-based** for the client, but converted to **0-based** internally.

## PaginationDto (domain)

The domain DTO encapsulates skip and orderBy logic for TypeORM:

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

## Usage in the repository

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

## ListResponse type

```typescript
export interface ListResponse<T> {
  items: T[];
  count: number;
}
```

## HTTP request example

```http
GET /person?page=1&limit=10&orderBy=name&direction=desc&name=John
```
