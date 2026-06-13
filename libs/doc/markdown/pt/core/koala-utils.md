---
title: Koala Utils
slug: koala-utils
category: core
docKey: core/koala-utils
order: 6
description: Integração com @koalarx/utils — delay, CPF/CNPJ, strings, datas e arrays.
---

# Koala Utils

O template inclui [`@koalarx/utils`](https://www.npmjs.com/package/@koalarx/utils) como dependência oficial. A biblioteca concentra validadores, conversores e operadores reutilizáveis (`KlString`, `KlDelay`, `KlDate`, `KlArray`, etc.).

## Instalação

Já vem no `package.json` do template e é instalada automaticamente pelo `kl-nest new` (módulo **core**). Em projetos existentes:

```bash
bun add @koalarx/utils
```

## Onde o template usa

| Recurso | Pacote | Uso no Koala Nest |
|---------|--------|-------------------|
| `delay(ms)` | `@koalarx/utils/KlDelay` | `JobsBootstrapService`, loop de cron jobs, setup E2E |
| `validateCpf` / `validateCnpj` | `@koalarx/utils/KlString` | `documentNumberSchema` em `src/core/schemas/` |
| `maskCpf` / `maskCnpj` | `@koalarx/utils/KlString` | `setMaskDocumentNumber` em `src/core/schemas/` |

### Delay em jobs e bootstrap

```typescript
import { delay } from '@koalarx/utils/KlDelay';

await delay(options.bootstrapDelayMs);
```

Usado em `JobsBootstrapService` e `CronJobHandlerBase` para aguardar entre ciclos do job.

### CPF/CNPJ nos schemas Zod

O CNPJ passou a aceitar letras e números nas 12 primeiras posições (formato `AA.AAA.AAA/AAAA-DV`), conforme a [Instrução Normativa RFB nº 2.229/2024](https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2024/outubro/cnpj-tera-letras-e-numeros-a-partir-de-julho-de-2026). CPFs permanecem numéricos. A validação e a máscara ficam em `@koalarx/utils/KlString`; o wrapper remove apenas a pontuação da máscara (`.`, `/`, `-`), preservando letras no CNPJ:

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

Exemplos aceitos: `529.982.247-25` (CPF), `11.222.333/0001-81` (CNPJ numérico) e `SK.CB2.G25/0001-32` (CNPJ alfanumérico).

Reexportado pelo barrel `@/core/schemas` para validators de domínio.

## Outros operadores úteis

Importe subpaths conforme a necessidade:

```typescript
import { KlArray } from '@koalarx/utils/KlArray';
import { KlDate } from '@koalarx/utils/KlDate';
import { KlCron } from '@koalarx/utils/KlCron';
import { toCamelCase, randomString } from '@koalarx/utils/KlString';
```

Consulte o [README do pacote](https://www.npmjs.com/package/@koalarx/utils) para a lista completa de métodos.

## Boas práticas

- Prefira `@koalarx/utils` a reimplementar validação de documento, delay ou formatação de string.
- Mantenha wrappers finos em `src/core/schemas/` quando precisar integrar com Zod ou OpenAPI — não importe a lib diretamente em controllers.
- Para novos utilitários genéricos, avalie contribuir em [koala-utils](https://github.com/igordrangel/koala-utils) em vez de duplicar no template.

## Veja também

- [OpenAPI e Scalar](../host/openapi-scalar.md) — schemas Zod em `src/core/schemas/`
- [Cron e Event Jobs](cron-event-jobs.md) — uso de `delay` no loop de jobs
