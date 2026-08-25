---
title: Security
slug: security
category: host
docKey: host/seguranca
order: 1
description: API security layers — Helmet, CORS, rate limit, cookies, validation, auth, and RedLock.
---

# Security

Layered view of what the template applies on an **API** (from the HTTP edge to the domain). A **Worker** has no HTTP surface — Helmet, CORS, rate limit, cookies, and OpenAPI are not part of that profile. Choice and flags: [Installation guide — API vs Worker](../getting-started/installation-guide.md#api-vs-worker).

Implementation details live in the linked topics; this page answers **what each layer does** and **which threat it mitigates**.

## Request flow

```mermaid
flowchart LR
  req[Request] --> helmet[Helmet]
  helmet --> rate[RateLimit]
  rate --> cors[CORS]
  cors --> auth[AuthGuard]
  auth --> handler[Handler]
```

Actual bootstrap order (`applyHttpMiddleware`): Helmet → `cookie-parser` → rate limit → CORS. Guards (auth/authorization) run later in the Nest pipeline.

## Summary

| Layer | Scope | Threat / risk mitigated |
| --- | --- | --- |
| Helmet | Core (API) | Reflected XSS in the browser, clickjacking, HTTPS downgrade |
| CORS | Core (API) | Unwanted cross-origin reads in the browser |
| Rate limit | Core (API) | Brute-force / abuse per IP |
| httpOnly refresh cookie | JWT auth | Refresh exfiltration via client JS (XSS) |
| Env Zod | Core | Boot with invalid/insecure config |
| Input Zod | Core | Malformed data / injection surface |
| ErrorsFilter | Core | Stack / internals leakage |
| Authentication | Opt-in | Anonymous access to protected routes |
| Authorization | Opt-in | Profile escalation / misuse of routes |
| RedLock | Cache + cron | Duplicate CronJob runs on multi-replica |

## Helmet (core)

**What it does:** registers security HTTP headers via [`helmet`](https://helmetjs.github.io/) in `applyHttpMiddleware`.

**What it aims to ensure:** reduce reflected XSS impact in the browser, clickjacking (`frameAncestors: 'none'`), and HTTP downgrade in production (HSTS + `upgradeInsecureRequests` only when `NODE_ENV=production`).

**Notes:** CSP allows `cdn.jsdelivr.net` (scripts/styles/images) and `fonts.scalar.com` for Scalar; `'unsafe-inline'` on scripts/styles; `crossOriginEmbedderPolicy: false` avoids breaking external doc assets.

Guide: [HTTP middleware](./http-middleware.md#helmet-security-headers).

## CORS (core)

**What it does:** controls which origins the browser may use with `credentials: true`.

**What it aims to ensure:** stop an arbitrary site from reading authenticated API responses in the browser. Default is open (`origin: true`); restrict with `CORS_ORIGINS`.

Guide: [HTTP middleware](./http-middleware.md#cors) · [Environment variables](../getting-started/environment-variables.md).

## Rate limit (core)

**What it does:** caps requests per IP in a window (`RATE_LIMIT_*`). Responds **429** when exceeded.

**What it aims to ensure:** reduce login brute-force and generic abuse. Disabled with `RATE_LIMIT_MAX=0` (template default).

Guide: [HTTP middleware](./http-middleware.md#rate-limit).

## Cookies / httpOnly refresh (JWT auth)

**What it does:** on login, refresh may be set as an `httpOnly` cookie (`path=/`). On localhost (`API_HOST` containing `localhost`): `SameSite=Strict` without `Secure`. Otherwise: `SameSite=None` + `Secure` for cross-site XHR.

**What it aims to ensure:** limit client scripts from reading the refresh token (XSS). Access tokens typically stay in the body/header.

Guide: [Authentication](./authentication.md).

## Env validation (Zod, core)

**What it does:** `EnvService` / Zod schema fails at boot if required variables or formats are wrong.

**What it aims to ensure:** do not start with missing or invalid secrets/config (fail fast vs silent runtime failure).

Guide: [Environment variables](../getting-started/environment-variables.md).

## Input validation (Zod / RequestValidatorBase, core)

**What it does:** application validators reject body/query/params outside the schema before the business handler.

**What it aims to ensure:** shrink injection surface and malformed data at the application edge.

Guide: [Reusable bases](../core/reusable-bases.md).

## ErrorsFilter (core)

**What it does:** global filter maps Zod, TypeORM, and HTTP exceptions to predictable JSON responses.

**What it aims to ensure:** do not leak stack traces or internal details to the client.

Guide: [Error handling](./error-handling.md).

## Authentication (opt-in)

**What it does:** JWT RS256, OAuth2, and/or M2M API Key — strategies in the host; identity available via `ILoggedUserInfoService`.

**What it aims to ensure:** only authenticated callers reach protected routes. Each strategy authenticates a client type (human, IdP, machine).

Guide: [Authentication](./authentication.md).

## Authorization (opt-in)

**What it does:** global `AuthGuard`, `@IsPublic()` for open routes, `ProfilesGuard` / `@RestrictionByProfile` for profiles.

**What it aims to ensure:** separate **who you are** (authentication) from **what you may do** (profile authorization).

Guide: [Authentication](./authentication.md) · [Routes](./routes.md).

## RedLock (cache + cron)

**What it does:** distributed lock (via cache) for CronJobs across multiple replicas.

**What it aims to ensure:** operational integrity — a job does not run twice. It is **not** HTTP authentication.

Guide: [Cache](../core/cache.md) · [Cron and Event Jobs](../core/cron-event-jobs.md).

## Next steps

- [HTTP middleware](./http-middleware.md) — Helmet, CORS, cookies, rate limit
- [Authentication](./authentication.md) — JWT, OAuth2, API Key, guards
- [Error handling](./error-handling.md) — ErrorsFilter
- [Environment variables](../getting-started/environment-variables.md) — CORS, rate limit, JWT
