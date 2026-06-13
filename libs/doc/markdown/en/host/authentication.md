---
title: Authentication
slug: authentication
category: host
docKey: host/authentication
order: 4
description: JWT, global guards, public routes, and generic OAuth2.
---

# Authentication

The authentication module is optional in the CLI (`kl-nest new` → **JWT** or **OAuth2**). It covers **JWT issuance and validation** — no user persistence in the database. You decide how to obtain claims (`sub`, `profile`, etc.) and evolve the login flow.

## Main components

| Piece | Role |
| --- | --- |
| `SecurityModule` | Configures RS256 JWT, Passport, and token/OAuth2 services |
| `AuthGuard` | Global guard — validates Bearer token |
| `ProfilesGuard` | Global guard — restricts by token profile |
| `@IsPublic()` | Marks routes that bypass `AuthGuard` |
| `@RestrictionByProfile(['admin'])` | Restricts endpoint to listed profiles |
| `POST /auth/token` | Issues access/refresh pair from claims |

## Public routes

```typescript
import { IsPublic } from '@/host/decorators/is-public.decorator';

@Post('token')
@IsPublic()
handle() { ... }
```

## Profile restriction

The `profile` value comes from the JWT payload (set via `POST /auth/token`):

```typescript
import { RestrictionByProfile } from '@/host/decorators/restriction-by-profile.decorator';

@Delete(':id')
@RestrictionByProfile(['admin'])
handle(@Param('id') id: string) { ... }
```

## Token issuance

Public endpoint to generate tokens after you resolve user identity:

```bash
POST /auth/token
Content-Type: application/json

{
  "sub": "user-uuid",
  "profile": "admin",
  "email": "user@example.com"
}
```

Response:

```json
{
  "accessToken": "...",
  "refreshToken": "..."
}
```

## Generic OAuth2

Configure providers in `.env` without coupling to a specific vendor:

```env
OAUTH2_PROVIDERS=google,microsoft
OAUTH2_GOOGLE_DOMAIN=https://accounts.google.com
OAUTH2_GOOGLE_CLIENT_ID=...
OAUTH2_GOOGLE_CLIENT_SECRET=...
OAUTH2_GOOGLE_SCOPE=openid profile email
```

Endpoints:

- `GET /oauth2/:provider/auth-link` — authorization URL
- `POST /oauth2/:provider/exchange-code` — exchanges `code` + `state` for user data (`OAuthUserInfoDto`)

The response **does not persist users**. Suggested flow: `exchange-code` → map claims → `POST /auth/token`.

## Bootstrap with guards

When the CLI installs authentication, `main.ts` registers global guards via `KoalaApp`:

```typescript
const koalaApp = bootstrapKoalaApp(app);
await koalaApp
  .addGlobalGuard(AuthGuard)
  .addGlobalGuard(ProfilesGuard)
  .build();
```

## Next steps

- [Environment variables](../getting-started/environment-variables.md) — JWT and OAuth2 keys
- [Controllers](./controllers.md) — thin HTTP → handler pattern
