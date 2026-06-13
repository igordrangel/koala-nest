---
title: Documentação OpenAPI com Scalar
slug: openapi-scalar
category: host
docKey: host/openapi-scalar
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
| `src/host/decorators/api-exclude-endpoint-diff-develop.decorator.ts` | Oculta endpoint fora de `develop` |
| `src/host/decorators/api-property-only-develop.decorator.ts` | Documenta propriedade de DTO apenas em `develop` |
| `src/host/decorators/api-property-enum.decorator.ts` | Documenta enums numéricos no Swagger |
| `src/host/decorators/scalar-token-endpoint.decorator.ts` | Compõe decorators da rota scalar-token |
| Requests/responses em `src/application/` | Schemas documentados com `@ApiProperty()` |
| `src/core/schemas/` | Facilitadores Zod reutilizáveis (`booleanSchema`, `nativeEnumSchema`, etc.) |

## Decorators para ocultar ou condicionar endpoints

```typescript
import { ApiExcludeEndpointDiffDevelop } from '@/host/decorators/api-exclude-endpoint-diff-develop.decorator';

@Delete(':id')
@ApiExcludeEndpointDiffDevelop()
handle(@Param('id') id: string) { ... }
```

Fora de `NODE_ENV=develop`, o endpoint deixa de aparecer no Scalar. Use `@ApiPropertyOnlyDevelop()` em DTOs internos e `@ApiPropertyEnum({ enum: MyEnum })` para enums numéricos.

```typescript
import { ApiPropertyOnlyDevelop } from '@/host/decorators/api-property-only-develop.decorator';
import { ApiPropertyEnum } from '@/host/decorators/api-property-enum.decorator';

export class MyRequest {
  @ApiPropertyOnlyDevelop({ example: 'internal-only' })
  debugField?: string;

  @ApiPropertyEnum({ enum: StatusEnum })
  status: StatusEnum;
}
```

## Schemas Zod reutilizáveis

Em `src/core/schemas/`:

| Helper | Uso |
| --- | --- |
| `booleanSchema()` | Query booleans (`?active=true`) |
| `nativeEnumSchema(enum)` | Enums numéricos em query/body |
| `emailSchema(value, required?)` | Validação de e-mail |
| `documentNumberSchema(value)` | CPF/CNPJ |
| `setMaskDocumentNumber(value)` | Máscara de documento |
| `LIST_QUERY_SCHEMA` | Paginação e ordenação |

Exemplo em validators:

```typescript
import { booleanSchema, LIST_QUERY_SCHEMA } from '@/core/schemas';

protected get schema() {
  return LIST_QUERY_SCHEMA.and(
    z.object({ active: booleanSchema() }),
  );
}
```

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
  .build();
```

Com autenticação instalada, `define-documentation.ts` aplica `.addBearerAuth()` e `.addSecurityRequirements('bearer')` globalmente. Rotas com `@IsPublic()` ficam sem segurança no spec — o mesmo critério do `AuthGuard` global.

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

## Autenticacao automatica no Scalar

Com o módulo de autenticação instalado, o template configura o Scalar para **obter o JWT pela própria UI** — sem copiar token manualmente. A configuração combina esquemas OAuth2 no OpenAPI com o bloco `authentication` do `apiReference`.

### O que o template já faz

| Arquivo | Função |
| --- | --- |
| `src/host/open-api/scalar-authentication.ts` | Monta `securitySchemes` e `authentication` do Scalar |
| `src/host/open-api/define-documentation.ts` | Aplica a config ao `apiReference` quando `IJwtTokenService` está registrado |
| `POST /auth/scalar-token` | Endpoint OAuth2 **password** usado pelo Scalar (JWT) |
| `POST /oauth2/scalar-token` | Endpoint **authorization code** usado pelo Scalar (OAuth2) |

Endpoints `scalar-token` ficam ocultos fora de `develop` (`@ApiExcludeEndpointDiffDevelop`).

### JWT — fluxo password no Scalar

O Scalar exibe o esquema **JWT** com fluxo `password`:

- `username` → claim `sub`
- `password` → claim `profile` (`user` ou `admin`)
- `tokenUrl` → `POST /auth/scalar-token`
- `x-tokenName` → `accessToken` (Scalar envia Bearer automaticamente)

Em `develop`, credenciais de exemplo são pré-preenchidas (`scalar-dev-user` / `admin`). Em produção, os campos ficam vazios.

**Uso em `/doc`:**

1. Abra `/doc`
2. Clique em **Authenticate**
3. Selecione **JWT**, confirme `username`/`password` e autorize
4. Use **Try it** nos endpoints protegidos

### OAuth2 — fluxo authorization code no Scalar

Para cada provider em `OAUTH2_PROVIDERS`, o template registra um esquema (ex.: **auth0**):

- `authorizationUrl` — link completo gerado por `OAuth2AuthService.authLink()`
- `tokenUrl` — `POST /oauth2/scalar-token` (troca `code`, emite JWT e devolve `{ accessToken, refreshToken }`)
- `x-scalar-client-id`, `x-scalar-redirect-uri`, `x-scalar-security-body` — extensões do Scalar para o fluxo authorization code
- `x-tokenName: accessToken`

**Uso em `/doc`:**

1. **Authenticate** → selecione o provider (ex.: auth0)
2. Conclua o login no provedor
3. O Scalar troca o código, recebe o JWT e aplica nos requests

### Configuracao central (`scalar-authentication.ts`)

A lógica fica isolada em `buildScalarAuthentication(app)`:

```typescript
export async function buildScalarAuthentication(app: INestApplication) {
  if (!isProviderRegistered(app, IJwtTokenService)) {
    return undefined;
  }

  // Esquema JWT (password → /auth/scalar-token)
  // Esquemas por provider OAuth2 (authorization code → /oauth2/scalar-token)

  return {
    openApiSecuritySchemes,
    authentication: {
      preferredSecurityScheme: ['JWT', 'auth0', ...],
      securitySchemes: { /* prefill em develop */ },
    },
    persistAuth: EnvConfig.isEnvDevelop,
  };
}
```

`define-documentation.ts` consome o retorno:

```typescript
const scalarAuth = await buildScalarAuthentication(app);

app.use(
  docEndpoint,
  apiReference({
    spec: { content: document },
    persistAuth: scalarAuth?.persistAuth ?? false,
    authentication: scalarAuth?.authentication,
    // ...
  }),
);
```

### Rotas protegidas e públicas no OpenAPI

Com guards globais (`AuthGuard`), o OpenAPI segue a mesma regra:

- **Padrão:** Bearer obrigatório em todos os endpoints (`addSecurityRequirements('bearer')`)
- **Exceção:** rotas com `@IsPublic()` recebem `security: []` no spec automaticamente

Não é necessário `@ApiBearerAuth()` em cada controller.

```typescript
import { IsPublic } from '@/host/decorators/is-public.decorator';

@Post('token')
@IsPublic()
handle() { ... }
```

### Extensões Scalar (OAuth2)

| Extensão | Função |
| --- | --- |
| `x-tokenName` | Campo da resposta usado como Bearer (`accessToken`) |
| `x-scalar-client-id` | Pré-preenche Client ID |
| `x-scalar-redirect-uri` | URI de callback do authorization code |
| `x-scalar-security-body` | Body extra no `tokenUrl` (ex.: `provider`) |

Referência: [Scalar — Authentication](https://scalar.com/products/api-client/authentication).

> **Segurança:** `clientSecret` e credenciais de teste só são pré-preenchidos em `develop`.

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
- [Autenticação](./autenticacao.md) — JWT, guards e OAuth2
- [Requests e responses](../application/requests-responses.md) — DTOs com Swagger e `@AutoMap()`
