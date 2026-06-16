---
title: Middleware HTTP
slug: middleware-http
category: host
docKey: host/middleware-http
order: 0
description: CORS, cookies, rate limit e bootstrap HTTP via applyHttpMiddleware.
---

# Middleware HTTP

CORS, `cookie-parser` e rate limit são aplicados em um único ponto: `applyHttpMiddleware` em `src/host/bootstrap/apply-http-middleware.ts`. O `main.ts` chama essa função logo após `NestFactory.create`.

```typescript
import { applyHttpMiddleware } from '@/host/bootstrap/apply-http-middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  applyHttpMiddleware(app);
  // ...
}
```

## CORS

Por padrão a API aceita **qualquer origin** (`origin: true` com `credentials: true`), alinhado ao princípio de APIs públicas e consumíveis por qualquer cliente.

Para restringir, defina `CORS_ORIGINS` no `.env` (origens separadas por vírgula):

```env
CORS_ORIGINS=http://localhost:4200,https://app.example.com
```

A resolução fica em `resolveCorsOrigin()` (`src/core/utils/resolve-cors-origins.ts`):

| `CORS_ORIGINS` | Comportamento |
| --- | --- |
| ausente ou vazio | `true` — reflete a origin da requisição |
| uma origem | string única |
| várias origens | array de strings |

## Rate limit

Middleware em `src/core/http/rate-limit.middleware.ts`, registrado pelo bootstrap. **Desabilitado por padrão** (`RATE_LIMIT_MAX=0`).

```env
RATE_LIMIT_MAX=300
RATE_LIMIT_WINDOW_MS=60000
```

| Variável | Default | Descrição |
| --- | --- | --- |
| `RATE_LIMIT_MAX` | `0` | Máximo de requisições por IP na janela; `0` desliga |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Janela em milissegundos |

Resposta ao exceder o limite: HTTP **429** com mensagem JSON padronizada.

## Cookies

`cookie-parser` é registrado no bootstrap — necessário para refresh token em cookie (`/auth/refresh`) quando autenticação JWT está instalada.

## Testes

- `src/test/core/resolve-cors-origins.spec.ts`
- `src/test/core/http/rate-limit.middleware.spec.ts`

Veja também: [Variáveis de ambiente](../inicio/variaveis-de-ambiente.md), [Estrutura do projeto](../inicio/estrutura-do-projeto.md).
