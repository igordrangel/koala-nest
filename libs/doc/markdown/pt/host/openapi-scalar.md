---
title: Documentação OpenAPI com Scalar
slug: openapi-scalar
category: host
order: 4
description: Como configurar e personalizar a documentação interativa em /doc com Scalar (OpenAPI via @nestjs/swagger).
---

# Documentação OpenAPI com Scalar

Projetos gerados pelo Koala Nest expõem documentação interativa em **`/doc`**. O fluxo é em duas etapas:

1. **@nestjs/swagger** — gera o spec OpenAPI a partir dos controllers e DTOs.
2. **@scalar/nestjs-api-reference** — renderiza a UI do Scalar com esse spec.

O Swagger UI padrão fica **desabilitado**; apenas o Scalar é exibido.

## Onde fica no projeto

| Arquivo | Função |
| --- | --- |
| `src/host/open-api/define-documentation.ts` | Monta o spec e registra o Scalar |
| `src/host/main.ts` | Chama `defineDocumentation(app)` no bootstrap |
| `src/host/decorators/controller.decorator.ts` | Aplica rota Nest + tag Swagger |
| Requests/responses em `src/application/` | Schemas documentados com `@ApiProperty()` |

## Ativação no bootstrap

Em `src/host/main.ts`, após criar a aplicação:

```typescript
import { defineDocumentation } from './open-api/define-documentation';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ... CORS, filtros ...

  defineDocumentation(app);

  await app.listen(process.env.PORT || 3000);
}
```

Com o servidor rodando:

```
http://localhost:3000/doc
```

A porta segue a variável `PORT` do `.env`.

## Configuração principal

Toda a personalização do Scalar começa em `define-documentation.ts`:

```typescript
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import packageJson from '../../../package.json';
import { apiReference } from '@scalar/nestjs-api-reference';

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
      hiddenClients: [
        'libcurl',
        'clj_http',
        'restsharp',
        'native',
        'http1.1',
        'asynchttp',
        'nethttp',
        'okhttp',
        'unirest',
        'xhr',
        'request',
        'nsurlsession',
        'cohttp',
        'guzzle',
        'http1',
        'http2',
        'webrequest',
        'restmethod',
        'requests',
        'httr',
        'httpie',
        'wget',
        'undici',
      ],
    }),
  );
}
```

### DocumentBuilder (metadados da API)

Use o `DocumentBuilder` do NestJS Swagger para definir o cabeçalho do spec:

| Método | Uso |
| --- | --- |
| `setTitle()` | Nome exibido no Scalar |
| `setDescription()` | Texto introdutório da API |
| `setVersion()` | Versão do spec (o template usa `package.json`) |

Exemplos de extensão:

```typescript
const documentBuilder = new DocumentBuilder()
  .setTitle('Minha API')
  .setDescription('API interna do produto X')
  .setVersion('1.2.0')
  .addServer('http://localhost:3000', 'Desenvolvimento')
  .addServer('https://api.exemplo.com', 'Produção')
  .addBearerAuth()
  .build();
```

Se adicionar autenticação, documente nos controllers com `@ApiBearerAuth()`.

### Endpoint da documentação

Altere `docEndpoint` para mudar a URL:

```typescript
const docEndpoint = '/api-docs';
```

Registre o mesmo valor em `SwaggerModule.setup` e em `app.use`.

### Opções do Scalar

| Opção | Valor no template | Efeito |
| --- | --- | --- |
| `spec.content` | documento gerado pelo Swagger | Alimenta a UI com o OpenAPI |
| `metaData` | title, description, version | Cabeçalho exibido no Scalar |
| `hideModels` | `true` | Oculta painel de schemas/models |
| `hideDownloadButton` | `true` | Remove botão de download do spec |
| `hideClientButton` | `true` | Remove seletor de client HTTP |
| `hiddenClients` | lista de clientes | Esconde geradores de código (curl, fetch, etc.) |

Para exibir models ou o botão de download, passe `false` nas flags correspondentes.

O template oculta clientes HTTP porque a documentação é voltada a **testar endpoints na própria UI**, não a gerar snippets em outras linguagens.

### Desabilitar o Swagger UI

```typescript
SwaggerModule.setup(docEndpoint, app, document, { swaggerUiEnabled: false });
```

O `SwaggerModule` ainda é necessário para **gerar** o documento OpenAPI — apenas a interface padrão do Swagger fica desligada.

## Como os endpoints entram no spec

O Scalar não declara rotas manualmente. Tudo vem dos **controllers** registrados nos módulos Nest e dos decoradores Swagger neles.

### Tags e prefixo de rota

O decorador `@Controller` do Koala Nest aplica rota e tag automaticamente:

```typescript
// src/host/decorators/controller.decorator.ts
export function Controller(config: RouterConfigBase) {
  return function (target: any) {
    NestController(config.group)(target);
    ApiTags(config.tag)(target);
  };
}
```

Configuração do recurso:

```typescript
class PersonRouterConfig extends RouterConfigBase {
  constructor() {
    super('Person', '/person'); // tag, prefixo
  }
}

export const PERSON_ROUTER_CONFIG = new PersonRouterConfig();
```

Todos os controllers de Person usam `@Controller(PERSON_ROUTER_CONFIG)` e aparecem agrupados na tag **Person** em `/doc`.

### Status e tipo de resposta

Documente cada operação no controller:

```typescript
@Post()
@ApiCreatedResponse({ type: CreatePersonResponse })
@HttpCode(HttpStatus.CREATED)
handle(@Body() request: CreatePersonRequest): Promise<CreatePersonResponse> {
  return this.handler.handle(request);
}
```

```typescript
@Get(':id')
@ApiOkResponse({ type: ReadPersonResponse })
async handle(@Param('id') id: string): Promise<ReadPersonResponse> {
  return await this.handler.handle(+id);
}
```

Para respostas vazias (update/delete), `@ApiOkResponse()` sem `type` é suficiente.

### Query params em listagens

O Scalar infere query params a partir da classe usada em `@Query()`:

```typescript
@Get()
@ApiOkResponse({ type: ReadManyPersonResponse })
async handle(@Query() query: ReadManyPersonRequest): Promise<ReadManyPersonResponse> {
  return await this.handler.handle(query);
}
```

As propriedades de `ReadManyPersonRequest` (incluindo as herdadas de `PaginationRequest`) aparecem como parâmetros de query na documentação.

## Schemas dos DTOs

Requests e responses devem usar `@ApiProperty()` em cada campo exposto:

```typescript
export class CreatePersonRequest extends ObjectClass<CreatePersonRequest> {
  @ApiProperty({ example: 'John Doe' })
  @AutoMap()
  name: string;

  @ApiProperty({ type: CreatePersonAddressRequest })
  @AutoMap()
  address: CreatePersonAddressRequest;

  @ApiProperty({ type: CreatePersonContactRequest, isArray: true })
  @AutoMap({ type: () => CreatePersonContactRequest })
  contacts: CreatePersonContactRequest[];
}
```

Boas práticas:

- use `example` para facilitar o "Try it" no Scalar;
- use `type` ou `isArray: true` em objetos aninhados e listas;
- em campos opcionais, `required: false` (padrão em query params);
- mantenha `@ApiProperty()` alinhado ao que o validator Zod realmente aceita.

Entidades de domínio (`src/domain/entities/`) **não** precisam de `@ApiProperty()` — apenas DTOs de entrada/saída na camada application.

## Novo recurso na documentação

Ao criar um recurso, a documentação é atualizada automaticamente se você:

1. Criar `router.config.ts` com tag e prefixo.
2. Usar `@Controller(RECURSO_ROUTER_CONFIG)` em cada controller.
3. Decorar requests/responses com `@ApiProperty()`.
4. Decorar handlers HTTP com `@ApiOkResponse`, `@ApiCreatedResponse`, etc.
5. Registrar os controllers no módulo Nest (`<Recurso>Module`).

Não é necessário editar `define-documentation.ts` por recurso.

## Personalizações comuns

### Trocar título e descrição

Edite o `DocumentBuilder` em `define-documentation.ts`. A versão pode continuar vindo do `package.json` ou ser fixa.

### Mudar a URL de `/doc`

Altere `docEndpoint` e reinicie o servidor.

### Exibir models/schemas

```typescript
apiReference({
  // ...
  hideModels: false,
});
```

### Habilitar download do OpenAPI

```typescript
apiReference({
  // ...
  hideDownloadButton: false,
});
```

### Adicionar ambiente de staging/produção

```typescript
.addServer(process.env.API_URL ?? 'http://localhost:3000', 'API')
```

Defina `API_URL` no `envSchema` se quiser configurar por ambiente.

## Verificação rápida

Se um endpoint não aparece em `/doc`:

- o controller está registrado em `controllers` do módulo Nest?
- o módulo está importado no `AppModule`?
- o método HTTP (`@Get`, `@Post`, etc.) está no controller?
- a aplicação reiniciou após as alterações?

Se o schema de um campo está incompleto:

- falta `@ApiProperty()` na propriedade?
- objetos aninhados precisam de `type: ClasseFilha`?
- arrays precisam de `isArray: true`?

## Leituras relacionadas

- [Controllers](./controllers.md) — padrão fino de entrada HTTP
- [Rotas e tags](./rotas.md) — `RouterConfigBase` e agrupamento no Scalar
- [Requests e responses](../application/requests-responses.md) — DTOs com Swagger e `@AutoMap()`
