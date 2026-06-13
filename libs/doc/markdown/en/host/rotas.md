---
title: Routes and tags
slug: rotas
category: host
order: 2
description: Centralized route configuration with RouterConfigBase.
---

# Routes and tags

Routes and OpenAPI tags are centralized in configuration classes, avoiding duplicated strings across controllers.

## RouterConfigBase

```typescript
export abstract class RouterConfigBase {
  protected constructor(
    private readonly _tag: string,
    private readonly _group: string,
  ) {}

  get group() {
    return this._group;
  }

  get tag() {
    return this._tag;
  }
}
```

- `group` — route prefix passed to NestJS `@Controller()` (e.g. `/person`).
- `tag` — grouping in Swagger/Scalar (e.g. `Person`).

## Person resource configuration

```typescript
class PersonRouterConfig extends RouterConfigBase {
  constructor() {
    super('Person', '/person');
  }
}

export const PERSON_ROUTER_CONFIG = new PersonRouterConfig();
```

## Usage in controllers

All Person controllers share the same configuration:

```typescript
@Controller(PERSON_ROUTER_CONFIG)
export class CreatePersonController implements IController<...> { ... }

@Controller(PERSON_ROUTER_CONFIG)
export class ReadManyPersonController implements IController<...> { ... }
```

This groups endpoints under `/person` and the **Person** tag in interactive documentation.

## Resulting endpoints

| Method | Route | Controller |
| --- | --- | --- |
| `POST` | `/person` | CreatePersonController |
| `GET` | `/person` | ReadManyPersonController |
| `GET` | `/person/:id` | ReadPersonController |
| `PUT` | `/person` | UpdatePersonController |
| `DELETE` | `/person/:id` | DeletePersonController |

## Creating configuration for a new resource

1. Create `src/host/controllers/<resource>/router.config.ts`.
2. Extend `RouterConfigBase` with the desired tag and prefix.
3. Export a constant instance (e.g. `PRODUCT_ROUTER_CONFIG`).
4. Use `@Controller(PRODUCT_ROUTER_CONFIG)` on all resource controllers.
