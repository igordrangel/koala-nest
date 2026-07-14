---
title: Koala Utils
slug: koala-utils
category: core
docKey: core/koala-utils
order: 6
description: Integration with @koalarx/utils — delay, CPF/CNPJ, strings, dates, and arrays.
---

# Koala Utils

The template ships with [`@koalarx/utils`](https://utils.koalarx.com/) **≥ 5** as an official dependency. The library provides reusable validators, converters, and operators. On the Nest backend, the default style is [**prototypes**](https://utils.koalarx.com/markdown/en/prototypes/overview.md).

## Installation

It is already listed in the template `package.json` and installed automatically by `kl-nest new` (**core** module). For existing projects:

```bash
bun add @koalarx/utils@^5.0.0
```

## Major 5.0

- Removed the `@koalarx/utils/light` subpath
- Holidays are opt-in: install the `date-holidays` peer and `import '@koalarx/utils/holidays'` (the template does not use holidays by default)
- `KlArray.map` / `KlString.split` now return `KlArray`
- New subpaths: [`operators`](https://utils.koalarx.com/) (frontend) and [`prototypes`](https://utils.koalarx.com/) (backend)
- Full guide: [Migration 5.0](https://utils.koalarx.com/markdown/en/guides/migration-5.md) · LLM index: [llms.txt](https://utils.koalarx.com/llms.txt)

## Prototypes at boot (default)

The template enables prototypes on the API entry and on test setups (each JS realm needs the side-effect):

```typescript
// src/host/main.ts
import '@koalarx/utils/prototypes';

// src/test/setup.ts and src/test/setup-e2e.ts
import '@koalarx/utils/prototypes';
```

After that, call methods on natives:

```typescript
'9964085842'.maskCpf();
'52998224725'.validateCpf();
items.orderBy('id', 'desc');
```

## Where the template uses it

| Resource | How to use | Usage in Koala Nest |
|----------|------------|---------------------|
| `delay(ms)` | `import { delay } from '@koalarx/utils/KlDelay'` | `JobsBootstrapService`, cron job loop, E2E setup |
| `validateCpf` / `validateCnpj` | `value.validateCpf()` / `value.validateCnpj()` | `documentNumberSchema` in `src/core/schemas/` |
| `maskCpf` / `maskCnpj` | `value.maskCpf()` / `value.maskCnpj()` | `setMaskDocumentNumber` in `src/core/schemas/` |
| `randomString` | `import { randomString } from '@koalarx/utils'` | OAuth login / `nameToLogin` |

APIs without a prototype equivalent (`delay`, `randomString`) and holidays (`import '@koalarx/utils/holidays'`) stay as explicit imports.

### Delay in jobs and bootstrap

```typescript
import { delay } from '@koalarx/utils/KlDelay';

await delay(options.bootstrapDelayMs);
```

Used in `JobsBootstrapService` and `CronJobHandlerBase` to wait between job cycles.

### CPF/CNPJ in Zod schemas

CNPJ now accepts letters and digits in the first 12 positions (format `AA.AAA.AAA/AAAA-DV`), per [RFB Normative Instruction No. 2,229/2024](https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2024/outubro/cnpj-tera-letras-e-numeros-a-partir-de-julho-de-2026). CPF remains numeric-only. Validation and masking use `String` prototypes; the wrapper strips mask punctuation (`.`, `/`, `-`) only, preserving letters in CNPJ:

```typescript
import {
  isCnpjDocument,
  isCpfDocument,
} from '@/core/schemas/document-number.utils';

export function documentNumberSchema(value: string) {
  if (isCpfDocument(value)) return value.validateCpf();
  if (isCnpjDocument(value)) return value.validateCnpj();
  return false;
}
```

Accepted examples: `529.982.247-25` (CPF), `11.222.333/0001-81` (numeric CNPJ), and `SK.CB2.G25/0001-32` (alphanumeric CNPJ).

Re-exported through the `@/core/schemas` barrel for domain validators.

## Other utilities

With prototypes enabled, prefer the native style. Use explicit core imports only when there is no prototype method (e.g. `delay`, `randomString`, `KlCron`):

```typescript
import { delay } from '@koalarx/utils/KlDelay';
import { randomString } from '@koalarx/utils';
import { KlCron } from '@koalarx/utils/KlCron';

'hello world'.toCamelCase();
new Date().format('dd/MM/yyyy');
[3, 1, 2].orderBy();
```

See the [@koalarx/utils documentation](https://utils.koalarx.com/) (LLM index: [llms.txt](https://utils.koalarx.com/llms.txt)) for the full method list.

## Best practices

- Prefer `@koalarx/utils` over reimplementing document validation, delay, or string formatting.
- Nest backend → prototypes in `main` (and every test/worker entry); frontend → prefer `operators`.
- Keep thin wrappers in `src/core/schemas/` when integrating with Zod or OpenAPI — avoid importing the library directly in controllers.
- For new generic utilities, consider contributing to [koala-utils](https://github.com/igordrangel/koala-utils) instead of duplicating logic in the template.

## See also

- [OpenAPI and Scalar](../host/openapi-scalar.md) — Zod schemas in `src/core/schemas/`
- [Cron and Event Jobs](cron-event-jobs.md) — `delay` usage in the job loop
