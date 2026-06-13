---
title: Controllers
slug: controllers
category: host
docKey: host/controllers
order: 1
description: Controllers HTTP finos que delegam para handlers.
---

# Controllers

Controllers são a camada de entrada HTTP. No Koala Nest, eles são **finos** — recebem a requisição, delegam ao handler e retornam a resposta. Não contêm lógica de negócio.

## Classe abstrata IController

Todos os controllers implementam `IController<Request, Response>`:

```typescript
export abstract class IController<Request, Response, Params = any> {
  abstract handle(
    request: Request,
    params?: Params,
    response?: HttpResponse,
  ): Promise<Response>;
}
```

## Decorador @Controller

O decorador customizado fica em `src/host/decorators/controller.decorator.ts` e aplica rota e tag Swagger a partir de um `RouterConfigBase`:

```typescript
export function Controller(config: RouterConfigBase) {
  return function (target: any) {
    NestController(config.group)(target);
    ApiTags(config.tag)(target);
  };
}
```

## Create — POST

```typescript
@Controller(PERSON_ROUTER_CONFIG)
export class CreatePersonController implements IController<
  CreatePersonRequest,
  CreatePersonResponse
> {
  constructor(private readonly handler: CreatePersonHandler) {}

  @Post()
  @ApiCreatedResponse({ type: CreatePersonResponse })
  @HttpCode(HttpStatus.CREATED)
  handle(@Body() request: CreatePersonRequest): Promise<CreatePersonResponse> {
    return this.handler.handle(request);
  }
}
```

## ReadMany — GET com query params

```typescript
@Controller(PERSON_ROUTER_CONFIG)
export class ReadManyPersonController implements IController<
  ReadManyPersonRequest,
  ReadManyPersonResponse
> {
  constructor(private readonly handler: ReadManyPersonHandler) {}

  @Get()
  @ApiOkResponse({ type: ReadManyPersonResponse })
  async handle(
    @Query() query: ReadManyPersonRequest,
  ): Promise<ReadManyPersonResponse> {
    return await this.handler.handle(query);
  }
}
```

## Update — PUT

```typescript
@Controller(PERSON_ROUTER_CONFIG)
export class UpdatePersonController implements IController<
  UpdatePersonRequest,
  void
> {
  constructor(private readonly handler: UpdatePersonHandler) {}

  @Put()
  @ApiOkResponse()
  @HttpCode(HttpStatus.OK)
  handle(@Body() request: UpdatePersonRequest): Promise<void> {
    return this.handler.handle(request);
  }
}
```

## Read — GET por ID

```typescript
@Controller(PERSON_ROUTER_CONFIG)
export class ReadPersonController implements IController<
  string,
  ReadPersonResponse
> {
  constructor(private readonly handler: ReadPersonHandler) {}

  @Get(':id')
  @ApiOkResponse({ type: ReadPersonResponse })
  async handle(@Param('id') id: string): Promise<ReadPersonResponse> {
    return await this.handler.handle(+id);
  }
}
```

## Delete — DELETE por ID

```typescript
@Controller(PERSON_ROUTER_CONFIG)
export class DeletePersonController implements IController<string, void> {
  constructor(private readonly handler: DeletePersonHandler) {}

  @Delete(':id')
  @ApiOkResponse()
  handle(@Param('id') id: string): Promise<void> {
    return this.handler.handle(+id);
  }
}
```

## Padrão de implementação

1. Aplique `@Controller(ROUTER_CONFIG)` na classe.
2. Injete o handler correspondente no construtor.
3. Use decoradores HTTP (`@Get`, `@Post`, `@Put`, `@Delete`) no método `handle`.
4. Documente com `@ApiOkResponse`, `@ApiCreatedResponse`, etc.
5. Delegue imediatamente para `this.handler.handle(...)`.

## Módulo de feature

Controllers e handlers são registrados juntos:

```typescript
@Module({
  imports: [ControllerModule],
  controllers: [
    CreatePersonController,
    ReadPersonController,
    ReadManyPersonController,
    UpdatePersonController,
    DeletePersonController,
  ],
  providers: [
    CreatePersonHandler,
    ReadPersonHandler,
    ReadManyPersonHandler,
    UpdatePersonHandler,
    DeletePersonHandler,
  ],
})
export class PersonModule {}
```
