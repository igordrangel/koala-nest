---
title: Controllers
slug: controllers
category: host
order: 1
description: Thin HTTP controllers that delegate to handlers.
---

# Controllers

Controllers are the HTTP entry layer. In Koala Nest, they are **thin** — they receive the request, delegate to the handler, and return the response. They contain no business logic.

## IController abstract class

All controllers implement `IController<Request, Response>`:

```typescript
export abstract class IController<Request, Response, Params = any> {
  abstract handle(
    request: Request,
    params?: Params,
    response?: HttpResponse,
  ): Promise<Response>;
}
```

## @Controller decorator

The custom decorator lives in `src/host/decorators/controller.decorator.ts` and applies route and Swagger tag from a `RouterConfigBase`:

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

## ReadMany — GET with query params

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

## Read — GET by ID

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

## Delete — DELETE by ID

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

## Implementation pattern

1. Apply `@Controller(ROUTER_CONFIG)` on the class.
2. Inject the corresponding handler in the constructor.
3. Use HTTP decorators (`@Get`, `@Post`, `@Put`, `@Delete`) on the `handle` method.
4. Document with `@ApiOkResponse`, `@ApiCreatedResponse`, etc.
5. Delegate immediately to `this.handler.handle(...)`.

## Feature module

Controllers and handlers are registered together:

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
