---
title: Reusable bases
slug: reusable-bases
category: core
docKey: core/bases-reutilizaveis
order: 1
description: Base classes for handlers, validators, controllers, and repositories.
---

# Reusable bases

Koala Nest provides abstract classes that standardize implementation across each layer. They define minimal contracts and allow evolving common behavior without duplicating code.

## RequestHandlerBase

Use case handlers implement `RequestHandlerBase` and expose a single `handle` method. Create and read-many extend the base class; read, update, and delete implement the interface directly:

```typescript
// src/application/common/request-handler.base.ts
export abstract class RequestHandlerBase<TRequest, TResponse> {
  abstract handle(req: TRequest): Promise<TResponse>;
}
```

Concrete example — creating a person:

```typescript
@Injectable()
export class CreatePersonHandler extends RequestHandlerBase<
  CreatePersonRequest,
  CreatePersonResponse
> {
  constructor(private readonly repository: IPersonRepository) {
    super();
  }

  async handle(req: CreatePersonRequest): Promise<CreatePersonResponse> {
    const person = AutoMapper.map(
      new CreatePersonValidator(req).validate(),
      CreatePersonRequest,
      Person,
    );
    const createdPerson = await this.repository.save(person);
    return AutoMapper.map(createdPerson, Person, CreatePersonResponse);
  }
}
```

## RequestValidatorBase

Validators receive the raw payload, normalize query string parameters, and validate with Zod:

```typescript
// src/application/common/request-validator.base.ts
export abstract class RequestValidatorBase<
  TRequest extends Record<string, any>,
> {
  protected _request: Record<string, any>;

  constructor(request: TRequest) {
    this._request = { ...request };
  }

  validate(): TRequest {
    Object.keys(this._request).forEach((key) => {
      if (key.includes('[]')) {
        const newKey = key.replace('[]', '');
        const value = this._request[key];
        this._request[newKey] =
          typeof value === 'string' ? value.split(',') : value;
        delete this._request[key];
      }
    });

    const requestParsed = this.schema.safeParse(this._request);

    if (requestParsed.success) {
      return Object.assign({} as TRequest, requestParsed.data);
    }

    throw requestParsed.error;
  }

  protected abstract get schema(): ZodType;
}
```

## IController

Controllers implement the abstract `IController` class to maintain a consistent signature:

```typescript
// src/host/controllers/common/controller.base.ts
export abstract class IController<Request, Response, Params = any> {
  abstract handle(
    request: Request,
    params?: Params,
    response?: HttpResponse,
  ): Promise<Response>;
}
```

## RepositoryBase

Concrete repositories extend `RepositoryBase` to get access to TypeORM's `Repository`:

```typescript
// src/infra/repositories/repository.base.ts
export class RepositoryBase<T extends ObjectLiteral> {
  protected readonly repository: Repository<T>;

  constructor(
    protected readonly dataSource: DataSource,
    protected readonly entity: EntityTarget<T>,
  ) {
    this.repository = this.dataSource.getRepository<T>(entity);
  }

  save(entity: T) {
    return this.repository.save(entity);
  }

  async delete(entity: T) {
    await this.repository.remove(entity);
  }
}
```

## EntityBase

Domain entities extend `EntityBase`, which in turn extends `ObjectClass`:

```typescript
// src/core/base/entity.base.ts
export abstract class EntityBase<T> extends ObjectClass<T> {}
```

## CreatedRegistreResponse

For creation responses, there are bases with numeric ID or UUID typing:

```typescript
// src/application/common/created-registre.response.ts
export abstract class CreatedRegistreWithIdResponse extends CreatedRegistreResponseBase<number> {
  @ApiProperty({ type: 'integer', format: 'int32' })
  @AutoMap()
  declare id: number;
}
```

The Person template extends `CreatedRegistreWithIdResponse` in `CreatePersonResponse` — it returns only the generated `id`.

## ICacheService

Data cache via `ICacheService` (`get`, `set`, `invalidate`). Implementation is selected automatically:

- **Redis** — when `REDIS_CONNECTION_STRING` is in `.env`
- **In-memory** — local fallback for development

Inject `ICacheService` in handlers to cache responses or derived data.

Full guide: [Cache (Redis)](./cache.md).

## CronJob and EventJob

Background jobs use `CronJobHandlerBase` and `EventJob`/`EventHandlerBase`. See the full guide at [Cron and Event Jobs](./cron-event-jobs.md).
