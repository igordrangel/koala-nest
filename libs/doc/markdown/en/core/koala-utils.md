---
title: Koala Utils
slug: koala-utils
category: core
docKey: core/koala-utils
order: 6
description: Integration with @koalarx/utils — delay, CPF/CNPJ, strings, dates, and arrays.
---

# Koala Utils

The template ships with [`@koalarx/utils`](https://www.npmjs.com/package/@koalarx/utils) as an official dependency. The library provides reusable validators, converters, and operators (`KlString`, `KlDelay`, `KlDate`, `KlArray`, etc.).

## Installation

It is already listed in the template `package.json` and installed automatically by `kl-nest new` ( **core** module). For existing projects:

```bash
bun add @koalarx/utils
```

## Where the template uses it

| Resource | Package | Usage in Koala Nest |
|----------|---------|---------------------|
| `delay(ms)` | `@koalarx/utils/KlDelay` | Bootstrap (`bootstrapKoalaJobs`), cron job loop, E2E setup |
| `validateCpf` / `validateCnpj` | `@koalarx/utils/KlString` | `documentNumberSchema` in `src/core/schemas/` |
| `maskCpf` / `maskCnpj` | `@koalarx/utils/KlString` | `setMaskDocumentNumber` in `src/core/schemas/` |

### Delay in jobs and bootstrap

```typescript
import { delay } from '@koalarx/utils/KlDelay';

await delay(options.bootstrapDelayMs);
```

Used in `koala-bootstrap.ts` and `CronJobHandlerBase` to wait between job cycles.

### CPF/CNPJ in Zod schemas

CNPJ now accepts letters and digits in the first 12 positions (format `AA.AAA.AAA/AAAA-DV`), per [RFB Normative Instruction No. 2,229/2024](https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2024/outubro/cnpj-tera-letras-e-numeros-a-partir-de-julho-de-2026). CPF remains numeric-only. Validation and masking live in `@koalarx/utils/KlString`; the wrapper strips mask punctuation (`.`, `/`, `-`) only, preserving letters in CNPJ:

```typescript
import { validateCpf, validateCnpj } from '@koalarx/utils/KlString';
import {
  isCnpjDocument,
  isCpfDocument,
} from '@/core/schemas/document-number.utils';

export function documentNumberSchema(value: string) {
  if (isCpfDocument(value)) return validateCpf(value);
  if (isCnpjDocument(value)) return validateCnpj(value);
  return false;
}
```

Accepted examples: `529.982.247-25` (CPF), `11.222.333/0001-81` (numeric CNPJ), and `SK.CB2.G25/0001-32` (alphanumeric CNPJ).

Re-exported through the `@/core/schemas` barrel for domain validators.

## Other useful operators

Import subpaths as needed:

```typescript
import { KlArray } from '@koalarx/utils/KlArray';
import { KlDate } from '@koalarx/utils/KlDate';
import { KlCron } from '@koalarx/utils/KlCron';
import { toCamelCase, randomString } from '@koalarx/utils/KlString';
```

See the [package README](https://www.npmjs.com/package/@koalarx/utils) for the full method list.

## Best practices

- Prefer `@koalarx/utils` over reimplementing document validation, delay, or string formatting.
- Keep thin wrappers in `src/core/schemas/` when integrating with Zod or OpenAPI — avoid importing the library directly in controllers.
- For new generic utilities, consider contributing to [koala-utils](https://github.com/igordrangel/koala-utils) instead of duplicating logic in the template.

## See also

- [OpenAPI and Scalar](../host/openapi-scalar.md) — Zod schemas in `src/core/schemas/`
- [Cron and Event Jobs](cron-event-jobs.md) — `delay` usage in the job loop
