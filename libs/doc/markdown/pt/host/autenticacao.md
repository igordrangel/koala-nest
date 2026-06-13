---
title: Autenticação
slug: autenticacao
category: host
docKey: host/autenticacao
order: 4
description: JWT, guards globais, rotas públicas e OAuth2 genérico.
---

# Autenticação

O módulo de autenticação é opcional na CLI (`kl-nest new` → **JWT** ou **OAuth2**). Ele cobre **emissão e validação de JWT** — sem persistência de usuário no banco. O desenvolvedor decide como obter as claims (`sub`, `profile`, etc.) e evoluir o fluxo de login.

## Componentes principais

| Peça | Função |
| --- | --- |
| `SecurityModule` | Configura JWT RS256, Passport e serviços de token/OAuth2 |
| `AuthGuard` | Guard global — valida Bearer token |
| `ProfilesGuard` | Guard global — restringe por perfil do token |
| `@IsPublic()` | Marca rotas que ignoram o `AuthGuard` |
| `@RestrictionByProfile(['admin'])` | Restringe endpoint aos perfis informados |
| `POST /auth/token` | Emite par access/refresh a partir de claims |

## Rotas públicas

```typescript
import { IsPublic } from '@/host/decorators/is-public.decorator';

@Post('token')
@IsPublic()
handle() { ... }
```

## Restrição por perfil

O valor de `profile` vem do payload JWT (informado em `POST /auth/token`):

```typescript
import { RestrictionByProfile } from '@/host/decorators/restriction-by-profile.decorator';

@Delete(':id')
@RestrictionByProfile(['admin'])
handle(@Param('id') id: string) { ... }
```

## Emissão de token

Endpoint público para gerar tokens após o dev resolver a identidade do usuário:

```bash
POST /auth/token
Content-Type: application/json

{
  "sub": "user-uuid",
  "profile": "admin",
  "email": "user@example.com"
}
```

Resposta:

```json
{
  "accessToken": "...",
  "refreshToken": "..."
}
```

## OAuth2 genérico

Configure providers no `.env` sem acoplar a um vendor específico:

```env
OAUTH2_PROVIDERS=google,microsoft
OAUTH2_GOOGLE_DOMAIN=https://accounts.google.com
OAUTH2_GOOGLE_CLIENT_ID=...
OAUTH2_GOOGLE_CLIENT_SECRET=...
OAUTH2_GOOGLE_SCOPE=openid profile email
```

Endpoints:

- `GET /oauth2/:provider/auth-link` — URL de autorização
- `POST /oauth2/:provider/exchange-code` — troca `code` + `state` por dados do usuário (`OAuthUserInfoDto`)

O retorno **não persiste usuário**. Fluxo sugerido: `exchange-code` → mapear claims → `POST /auth/token`.

## Bootstrap com guards

Quando a CLI instala autenticação, o `main.ts` registra guards globais via `KoalaApp`:

```typescript
const koalaApp = bootstrapKoalaApp(app);
await koalaApp
  .addGlobalGuard(AuthGuard)
  .addGlobalGuard(ProfilesGuard)
  .build();
```

## Próximos passos

- [Variáveis de ambiente](../inicio/variaveis-de-ambiente.md) — chaves JWT e OAuth2
- [Controllers](./controllers.md) — padrão fino HTTP → handler
