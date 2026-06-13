---
title: Bases reutilizáveis
slug: bases-reutilizaveis
category: core
docKey: core/bases-reutilizaveis
order: 1
description: Classes base para handlers, validators, controllers e repositórios.
---

# Bases reutilizáveis

O Koala Nest fornece classes abstratas que padronizam a implementação de cada camada. Elas definem contratos mínimos e permitem evoluir comportamento comum sem duplicar código.

## RequestHandlerBase

Handlers de casos de uso implementam `RequestHandlerBase` e expõem um único método `handle`. Create e read-many estendem a classe base; read, update e delete implementam a interface diretamente:

```typescript
// src/application/common/request-handler.base.ts
export abstract class RequestHandlerBase<TRequest, TResponse> {
  abstract handle(req: TRequest): Promise<TResponse>;
}
```

Exemplo concreto — criação de pessoa:

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

Validators recebem o payload bruto, normalizam parâmetros de query string e validam com Zod:

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

Controllers implementam a classe abstrata `IController` para manter assinatura consistente:

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

Repositórios concretos estendem `RepositoryBase` para obter acesso ao `Repository` do TypeORM:

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

Entidades de domínio estendem `EntityBase`, que por sua vez estende `ObjectClass`:

```typescript
// src/core/base/entity.base.ts
export abstract class EntityBase<T> extends ObjectClass<T> {}
```

## CreatedRegistreResponse

Para respostas de criação, existem bases com tipagem de ID numérico ou UUID:

```typescript
// src/application/common/created-registre.response.ts
export abstract class CreatedRegistreWithIdResponse extends CreatedRegistreResponseBase<number> {
  @ApiProperty({ type: 'integer', format: 'int32' })
  @AutoMap()
  declare id: number;
}
```

O template Person estende `CreatedRegistreWithIdResponse` em `CreatePersonResponse` — retorna apenas o `id` gerado.

## ICacheService

Cache de dados via `ICacheService` (`get`, `set`, `invalidate`). A implementação é escolhida automaticamente:

- **Redis** — quando `REDIS_CONNECTION_STRING` está no `.env`
- **Memória** — fallback local para desenvolvimento

Injete `ICacheService` nos handlers para cachear respostas ou dados derivados.

Guia completo: [Cache (Redis)](./cache.md).

## CronJob e EventJob

Jobs em background usam `CronJobHandlerBase` e `EventJob`/`EventHandlerBase`. O guia completo está em [Cron e Event Jobs](./cron-event-jobs.md).
