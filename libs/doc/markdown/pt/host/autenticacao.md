---
title: Autenticação
slug: autenticacao
category: host
docKey: host/autenticacao
order: 4
description: JWT, guards globais, rotas públicas, OAuth2 genérico e API Key.
---

# Autenticação

O módulo de autenticação é opcional na CLI (`kl-nest new` → **JWT**, **OAuth2** e/ou **API Key**). Com JWT, o template inclui entidade `User`, login por e-mail/senha e emissão de tokens RS256. Com OAuth2, usuários são criados ou reutilizados após o fluxo authorization code. **API Key** é aditiva (exige JWT e/ou OAuth2) e autentica chamadas machine-to-machine na borda HTTP.

A instalação de auth **não** altera `data-source-factory.ts`: a entidade `User` entra no DataSource via `@Entity` (DbContext) e o `UserRepository` é registrado no `RepositoryModule`.

## Componentes principais

| Peça | Função |
| --- | --- |
| `SecurityModule` | Configura JWT RS256, Passport e serviços de token/OAuth2 |
| `AuthGuard` | Guard global — valida Bearer JWT e/ou header `ApiKey` |
| `ProfilesGuard` | Guard global — restringe por perfil do token |
| `@IsPublic()` | Marca rotas que ignoram o `AuthGuard` |
| `@RestrictionByProfile([AuthProfile.admin])` | Restringe endpoint aos perfis informados |
| `ILoggedUserInfoService` | Serviço request-scoped para handlers/controllers |
| `AuthProfile` (`src/core/auth/auth-profile.enum.ts`) | Enum de string com perfis suportados (`user`, `admin`) |
| `POST /auth/login` | Login com e-mail/senha; emite par access/refresh |
| `GET /auth/user-info` | Dados do usuário autenticado |
| `POST /auth/refresh` | Renova o par de tokens com refresh token (Bearer ou cookie) |

## Rotas públicas

Rotas com `@IsPublic()` ignoram o `AuthGuard` **e** deixam de exigir Bearer no OpenAPI/Scalar:

```typescript
import { IsPublic } from '@/host/decorators/is-public.decorator';

@Post('login')
@IsPublic()
handle() { ... }
```

Demais endpoints são protegidos por padrão — não é necessário `@ApiBearerAuth()` em cada controller.

## Restrição por perfil

O valor de `profile` vem do usuário no banco (carregado pelo `AuthGuard` após validar o JWT):

```typescript
import { AuthProfile } from '@/core/auth/auth-profile.enum';
import { RestrictionByProfile } from '@/host/decorators/restriction-by-profile.decorator';

@Delete(':id')
@RestrictionByProfile([AuthProfile.admin])
handle(@Param('id') id: string) { ... }
```

## Login (JWT password)

Endpoint público para autenticar com e-mail e senha:

```bash
POST /auth/login
Content-Type: application/json

{
  "username": "admin@example.com",
  "password": "admin123"
}
```

Resposta:

```json
{
  "accessToken": "...",
  "refreshToken": "..."
}
```

## Renovação de token

Renove o par access/refresh sem autenticar novamente:

```bash
POST /auth/refresh
Authorization: Bearer <refreshToken>
```

Ou envie o refresh token como **cookie httpOnly** `refreshToken` — o `AuthGuard` promove automaticamente para `Authorization` nesta rota.

No login, o cookie é definido com `httpOnly` e `path=/`. Em localhost (`API_HOST` contendo `localhost`): `SameSite=Strict` sem `Secure`. Fora de localhost (front ≠ API): `SameSite=None; Secure` para o navegador aceitar o `Set-Cookie` em XHR cross-site.

O formato da resposta é o mesmo de `POST /auth/login` (`accessToken` + `refreshToken`). Refresh tokens são rejeitados em todas as demais rotas pelo `JwtStrategy`.

## Usuário logado nos handlers

Injete `ILoggedUserInfoService` (mesmo padrão de Globo Seguros / Solicita.ai):

```typescript
import { ILoggedUserInfoService } from '@/domain/services/ilogged-user-info.service';

@Injectable()
export class MyHandler {
  constructor(private readonly loggedUserInfo: ILoggedUserInfoService) {}

  async handle(req: MyRequest) {
    const user = this.loggedUserInfo.getUser();
  }
}
```

O serviço é request-scoped e lê o `request.user` preenchido pelo `AuthGuard` após validar o JWT.

## OAuth2 — qualquer provedor, qualquer quantidade

Na CLI (`kl-nest new` → **OAuth2**), o template entrega o fluxo **authorization code** pronto. O caso usual é login com **provedores terceiros** (Google, Microsoft, Auth0, Keycloak, GitHub Enterprise, Okta, etc.) — você só preenche credenciais no `.env`. Não reimplementa troca de `code`, `state` CSRF, discovery OIDC nem controllers.

**Google e Microsoft no `.env.example` são apenas exemplos.** A lib é genérica: liste quantos providers quiser em `OAUTH2_PROVIDERS` e repita o padrão `OAUTH2_{CHAVE}_*` para cada um. A `CHAVE` é o valor que você envia no body (`provider: "auth0"` → `OAUTH2_AUTH0_*`).

### O que já vem pronto (só configurar)

| Peça | Função |
| --- | --- |
| `OAuthProviderRegistry` | Lê N providers de `OAUTH2_PROVIDERS` + variáveis `OAUTH2_{CHAVE}_*` |
| `OAuth2AuthService` | Gera `state`, monta auth URL, troca `code` por token, busca userinfo |
| `POST /oauth2/auth-link` | Retorna URL de autorização do provedor informado |
| `POST /oauth2/token` | Troca `code` + `state` → `OAuthUserInfoDto` |
| Scalar | Um esquema OAuth2 **por provider** listado em `/doc` |

### O que você preenche (dados do provedor)

Gerados **fora** da API, no console do IdP:

| Dado | Onde obter |
| --- | --- |
| `OAUTH2_PROVIDERS` | Lista separada por vírgula — quantos providers precisar |
| `OAUTH2_{CHAVE}_CLIENT_ID` / `_CLIENT_SECRET` | Console do provedor (Google Cloud, Azure, Auth0, …) |
| `OAUTH2_{CHAVE}_DOMAIN` | Issuer OIDC do provedor (discovery automático) |
| `OAUTH2_{CHAVE}_SCOPE` | Scopes exigidos pelo provedor |
| `redirect_uri` registrado | `API_HOST` + `/oauth2/callback` (ou `OAUTH2_{CHAVE}_REDIRECT_PATH`) |

### Registrar um provedor OIDC (padrão)

Para **cada** chave em `OAUTH2_PROVIDERS`, adicione o bloco `OAUTH2_{CHAVE}_*`. Endpoints (`authorization`, `token`, `userinfo`) vêm do `/.well-known/openid-configuration`.

```env
OAUTH2_PROVIDERS=google,microsoft,auth0,keycloak
# --- google (exemplo) ---
OAUTH2_GOOGLE_DOMAIN=https://accounts.google.com
OAUTH2_GOOGLE_CLIENT_ID=...
OAUTH2_GOOGLE_CLIENT_SECRET=...
OAUTH2_GOOGLE_SCOPE=openid profile email
# --- microsoft (exemplo) ---
OAUTH2_MICROSOFT_DOMAIN=https://login.microsoftonline.com/common/v2.0
OAUTH2_MICROSOFT_CLIENT_ID=...
OAUTH2_MICROSOFT_CLIENT_SECRET=...
OAUTH2_MICROSOFT_SCOPE=openid profile email
# --- auth0 ---
OAUTH2_AUTH0_DOMAIN=https://tenant.auth0.com
OAUTH2_AUTH0_CLIENT_ID=...
OAUTH2_AUTH0_CLIENT_SECRET=...
OAUTH2_AUTH0_SCOPE=openid profile email
# --- keycloak ---
OAUTH2_KEYCLOAK_DOMAIN=https://idp.empresa.com/realms/prod
OAUTH2_KEYCLOAK_CLIENT_ID=...
OAUTH2_KEYCLOAK_CLIENT_SECRET=...
OAUTH2_KEYCLOAK_SCOPE=openid profile email
API_HOST=http://localhost:3000
```

Fluxo ponta a ponta (qualquer provider):

```mermaid
sequenceDiagram
  participant FE as Frontend
  participant API as Koala Nest
  participant IdP as Provedor OIDC
  FE->>API: POST /oauth2/auth-link { provider: auth0 }
  API-->>FE: { url }
  FE->>IdP: redirect (usuário autentica)
  IdP-->>FE: callback ?code&state
  FE->>API: POST /oauth2/token { provider, code, state }
  API-->>FE: OAuthUserInfoDto
  FE->>API: POST /auth/login { username, password }
  API-->>FE: accessToken + refreshToken
```

### Servidor OAuth próprio (avançado)

Quando **você** hospeda o servidor e ele **não** expõe discovery OIDC, defina URLs manualmente (sem `_DOMAIN`):

```env
OAUTH2_PROVIDERS=myapp
OAUTH2_MYAPP_CLIENT_ID=...
OAUTH2_MYAPP_CLIENT_SECRET=...
OAUTH2_MYAPP_SCOPE=openid profile email
OAUTH2_MYAPP_AUTHORIZATION_URL=https://auth.myapp.com/oauth/authorize
OAUTH2_MYAPP_TOKEN_URL=https://auth.myapp.com/oauth/token
OAUTH2_MYAPP_USERINFO_URL=https://auth.myapp.com/oauth/userinfo
```

### Validação do `state` (autenticidade do fluxo)

No `POST /oauth2/auth-link`, a API gera um `state` aleatório e grava temporariamente:

```
oauth2:state:{state} → { provider }   (TTL 10 min)
```

No `POST /oauth2/token`, confere se o `state` existe, bate com o `provider` do body e remove a chave (uso único). Isso garante que o `code` pertence a um fluxo **iniciado pela API** — proteção anti-CSRF. O frontend (Angular, etc.) só repassa `code` e `state`; a validação é **sempre no servidor**, pois o endpoint é público.

Implementação em `OAuth2AuthService` — usa `ICacheService` por baixo (armazenamento temporário, não cache de dados de negócio).

| Cenário | Comportamento |
| --- | --- |
| **1 instância** (dev local) | `state` fica em memória (`InMemoryCacheService`) — **Redis não é necessário** |
| **Várias instâncias** (load balancer, K8s) | **Recomendado** `REDIS_CONNECTION_STRING` — o `auth-link` pode rodar na réplica A e o `token` na B |

```mermaid
sequenceDiagram
  participant FE as Frontend
  participant API as Koala Nest
  participant Store as Store (memória ou Redis)
  participant IdP as Provedor OIDC
  FE->>API: POST /oauth2/auth-link { provider }
  API->>Store: grava oauth2:state:{state}
  API-->>FE: { url com state }
  FE->>IdP: redirect
  IdP-->>FE: callback ?code&state
  FE->>API: POST /oauth2/token { provider, code, state }
  API->>Store: valida e remove state
  API-->>FE: OAuthUserInfoDto
```

### O que fica com o desenvolvedor

O template **não persiste usuário** nem emite JWT automaticamente após OAuth. Você decide:

1. Mapear `OAuthUserInfoDto` → claims (`sub`, `profile`, `email`);
2. Chamar `POST /auth/login` para emitir JWT da API;
3. (Opcional) criar/atualizar usuário no banco antes do passo 2.

## Bootstrap com guards

Quando a CLI instala autenticação, o `main.ts` registra guards globais. Jobs em background são iniciados automaticamente pelo `JobsBootstrapService` via `JobsModule.register()` no `AppModule`:

```typescript
app.useGlobalGuards(
  await app.resolve(AuthGuard),
  await app.resolve(ProfilesGuard),
);
```

O bootstrap de jobs inscreve handlers de eventos e inicia CronJobs apenas quando `CRON_JOBS_ENABLED=true`. O atraso antes de iniciar os jobs é controlado por `BOOTSTRAP_DELAY_MS`.

## API Key (M2M)

API Key autentica callers HTTP síncronos (integrações, BFF, hops pontuais entre serviços). **Não** substitui broker/eventos nem obriga proxy de arquivos — storage em cloud + mensageria continuam a escolha preferível para domínio escalável. A strategy fica no host; handlers só veem o usuário já autenticado via `ILoggedUserInfoService`.

CLI: `--auth jwt,api-key` (ou `oauth2,api-key` / `jwt,oauth2,api-key`). Flag opcional `--api-key-internal-subnet` libera IPs privados (RFC1918) no tipo `domain` para pods no cluster.

### CRUD e token

- Endpoints em `/api-key` (criar/listar/ler/atualizar/excluir), escopados ao usuário autenticado
- Na criação, a chave é um JWT RS256 com `typ: api-key`, `sub` = userId, `iss` = id da chave — retornada **só** neste response
- Uso: header `ApiKey: <jwt>`

### Tipos de origem (`origin` CSV)

| Tipo | Validação |
| --- | --- |
| `host` | `req.hostname` na lista |
| `uri` | hostname + path (sem params de rota) |
| `domain` | IP do cliente vs IP cadastrado **ou** domínio (reverse DNS / resolve A/AAAA). Sem headers `Origin`/`Referer` |

`*` na lista libera só em `develop`/`test`. Com subnet interna habilitada, IPs privados também passam no tipo `domain` sem cadastrar cada pod.

Configure `trust proxy` se a API estiver atrás de load balancer / ingress.

## Autenticacao no Scalar

Com autenticação instalada, o Scalar obtém credenciais via `authentication` no `apiReference`:

- **JWT:** esquema **JWT** (fluxo password) → `POST /auth/login`
- **OAuth2:** um esquema por provider (authorization code) → `POST /oauth2/scalar-token`
- **API Key:** esquema **ApiKey** (header `ApiKey`)

Guia completo: [OpenAPI com Scalar](./openapi-scalar.md#autenticacao-automatica-no-scalar)

## Próximos passos

- [Segurança](./seguranca.md) — visão de camadas (Helmet, CORS, cookies, guards)
- [Variáveis de ambiente](../inicio/variaveis-de-ambiente.md) — chaves JWT, OAuth2 e Redis
- [OpenAPI com Scalar](./openapi-scalar.md#autenticacao-automatica-no-scalar) — configuracao automatica no Scalar
- [Controllers](./controllers.md) — padrão fino HTTP → handler
