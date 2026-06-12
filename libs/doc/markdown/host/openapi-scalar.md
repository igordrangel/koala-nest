---
title: Documentação OpenAPI com Scalar
slug: openapi-scalar
category: host
order: 4
description: Configuração da documentação interativa em /doc com Swagger e Scalar.
---

# Documentação OpenAPI com Scalar

Projetos Koala Nest expõem documentação interativa em `/doc` usando **Swagger** para gerar o spec e **Scalar** para renderizar a UI.

## Configuração

```typescript
export function defineDocumentation(app: INestApplication) {
  const documentBuilder = new DocumentBuilder()
    .setTitle('KoalaNest')
    .setDescription('KoalaNest API')
    .setVersion(packageJson.version)
    .build();

  const document = SwaggerModule.createDocument(app, documentBuilder);
  const docEndpoint = '/doc';

  SwaggerModule.setup(docEndpoint, app, document, { swaggerUiEnabled: false });

  app.use(
    docEndpoint,
    apiReference({
      spec: { content: document },
      metaData: {
        title: documentBuilder.info.title,
        description: documentBuilder.info.description,
        version: packageJson.version,
      },
      hideModels: true,
      hideDownloadButton: true,
      hideClientButton: true,
      hiddenClients: [/* ... clientes HTTP ocultos ... */],
    }),
  );
}
```

## Ativação no bootstrap

```typescript
defineDocumentation(app);
```

Após iniciar o servidor:

```
Documentation is available at http://localhost:3000/doc
```

## Decoradores nos DTOs

Requests e responses usam `@ApiProperty()` para enriquecer o schema OpenAPI:

```typescript
export class CreatePersonRequest extends ObjectClass<CreatePersonRequest> {
  @ApiProperty({ example: 'John Doe' })
  @AutoMap()
  name: string;

  @ApiProperty({ type: CreatePersonAddressRequest })
  @AutoMap()
  address: CreatePersonAddressRequest;
}
```

## Decoradores nos controllers

Documente status codes e tipos de resposta:

```typescript
@Post()
@ApiCreatedResponse({ type: CreatePersonResponse })
@HttpCode(HttpStatus.CREATED)
handle(@Body() request: CreatePersonRequest): Promise<CreatePersonResponse> {
  return this.handler.handle(request);
}
```

## Tags automáticas

O decorador `@Controller(PERSON_ROUTER_CONFIG)` aplica `@ApiTags('Person')` automaticamente, agrupando endpoints por recurso na UI Scalar.

## Personalização

Para alterar título, descrição ou versão, edite `defineDocumentation()`. A versão é lida de `package.json` do projeto gerado.
