---
title: Rotas e tags
slug: rotas
category: host
order: 2
description: Configuração centralizada de rotas com RouterConfigBase.
---

# Rotas e tags

Rotas e tags OpenAPI são centralizadas em classes de configuração, evitando strings duplicadas nos controllers.

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

- `group` — prefixo de rota passado ao `@Controller()` do NestJS (ex.: `/person`).
- `tag` — agrupamento no Swagger/Scalar (ex.: `Person`).

## Configuração do recurso Person

```typescript
class PersonRouterConfig extends RouterConfigBase {
  constructor() {
    super('Person', '/person');
  }
}

export const PERSON_ROUTER_CONFIG = new PersonRouterConfig();
```

## Uso nos controllers

Todos os controllers de Person compartilham a mesma configuração:

```typescript
@Controller(PERSON_ROUTER_CONFIG)
export class CreatePersonController implements IController<...> { ... }

@Controller(PERSON_ROUTER_CONFIG)
export class ReadManyPersonController implements IController<...> { ... }
```

Isso agrupa os endpoints sob `/person` e a tag **Person** na documentação interativa.

## Endpoints resultantes

| Método | Rota | Controller |
| --- | --- | --- |
| `POST` | `/person` | CreatePersonController |
| `GET` | `/person` | ReadManyPersonController |
| `GET` | `/person/:id` | ReadPersonController |
| `PUT` | `/person` | UpdatePersonController |
| `DELETE` | `/person/:id` | DeletePersonController |

## Criar configuração para novo recurso

1. Crie `src/host/controllers/<recurso>/router.config.ts`.
2. Estenda `RouterConfigBase` com tag e prefixo desejados.
3. Exporte uma instância constante (ex.: `PRODUCT_ROUTER_CONFIG`).
4. Use `@Controller(PRODUCT_ROUTER_CONFIG)` em todos os controllers do recurso.
