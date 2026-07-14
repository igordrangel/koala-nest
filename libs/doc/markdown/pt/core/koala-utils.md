---
title: Koala Utils
slug: koala-utils
category: core
docKey: core/koala-utils
order: 6
description: Integração com @koalarx/utils — delay, CPF/CNPJ, strings, datas e arrays.
---

# Koala Utils

O template inclui [`@koalarx/utils`](https://utils.koalarx.com/) **≥ 5** como dependência oficial. A biblioteca concentra validadores, conversores e operadores reutilizáveis. No backend Nest, o padrão é usar [**prototypes**](https://utils.koalarx.com/markdown/pt/prototypes/visao-geral.md).

## Instalação

Já vem no `package.json` do template e é instalada automaticamente pelo `kl-nest new` (módulo **core**). Em projetos existentes:

```bash
bun add @koalarx/utils@^5.0.0
```

## Major 5.0

- Removido o subpath `@koalarx/utils/light`
- Feriados são opt-in: instale o peer `date-holidays` e faça `import '@koalarx/utils/holidays'` (o template não usa feriados por padrão)
- `KlArray.map` / `KlString.split` passam a retornar `KlArray`
- Novos subpaths: [`operators`](https://utils.koalarx.com/) (frontend) e [`prototypes`](https://utils.koalarx.com/) (backend)
- Guia completo: [Migração 5.0](https://utils.koalarx.com/markdown/pt/guias/migracao-5.md) · índice LLM: [llms.txt](https://utils.koalarx.com/llms.txt)

## Prototypes no boot (padrão)

O template ativa prototypes no entry da API e nos setups de teste (cada realm JS precisa do side-effect):

```typescript
// src/host/main.ts
import '@koalarx/utils/prototypes';

// src/test/setup.ts e src/test/setup-e2e.ts
import '@koalarx/utils/prototypes';
```

Depois disso, use métodos nos nativos:

```typescript
'9964085842'.maskCpf();
'52998224725'.validateCpf();
items.orderBy('id', 'desc');
```

## Onde o template usa

| Recurso | Como usar | Uso no Koala Nest |
|---------|-----------|-------------------|
| `delay(ms)` | `import { delay } from '@koalarx/utils/KlDelay'` | `JobsBootstrapService`, loop de cron jobs, setup E2E |
| `validateCpf` / `validateCnpj` | `value.validateCpf()` / `value.validateCnpj()` | `documentNumberSchema` em `src/core/schemas/` |
| `maskCpf` / `maskCnpj` | `value.maskCpf()` / `value.maskCnpj()` | `setMaskDocumentNumber` em `src/core/schemas/` |
| `randomString` | `import { randomString } from '@koalarx/utils'` | login OAuth / `nameToLogin` |

Funções sem equivalente em prototype (`delay`, `randomString`) e feriados (`import '@koalarx/utils/holidays'`) continuam por import explícito.

### Delay em jobs e bootstrap

```typescript
import { delay } from '@koalarx/utils/KlDelay';

await delay(options.bootstrapDelayMs);
```

Usado em `JobsBootstrapService` e `CronJobHandlerBase` para aguardar entre ciclos do job.

### CPF/CNPJ nos schemas Zod

O CNPJ passou a aceitar letras e números nas 12 primeiras posições (formato `AA.AAA.AAA/AAAA-DV`), conforme a [Instrução Normativa RFB nº 2.229/2024](https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2024/outubro/cnpj-tera-letras-e-numeros-a-partir-de-julho-de-2026). CPFs permanecem numéricos. A validação e a máscara usam prototypes de `String`; o wrapper remove apenas a pontuação da máscara (`.`, `/`, `-`), preservando letras no CNPJ:

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

Exemplos aceitos: `529.982.247-25` (CPF), `11.222.333/0001-81` (CNPJ numérico) e `SK.CB2.G25/0001-32` (CNPJ alfanumérico).

Reexportado pelo barrel `@/core/schemas` para validators de domínio.

## Outros utilitários

Com prototypes ativos, prefira o estilo nativo. Imports explícitos do core só quando não houver método de prototype (ex.: `delay`, `randomString`, `KlCron`):

```typescript
import { delay } from '@koalarx/utils/KlDelay';
import { randomString } from '@koalarx/utils';
import { KlCron } from '@koalarx/utils/KlCron';

'hello world'.toCamelCase();
new Date().format('dd/MM/yyyy');
[3, 1, 2].orderBy();
```

Consulte a [documentação do @koalarx/utils](https://utils.koalarx.com/) (índice para LLMs: [llms.txt](https://utils.koalarx.com/llms.txt)) para a lista completa de métodos.

## Boas práticas

- Prefira `@koalarx/utils` a reimplementar validação de documento, delay ou formatação de string.
- Backend Nest → prototypes no `main` (e em cada entry de teste/worker); frontend → preferir `operators`.
- Mantenha wrappers finos em `src/core/schemas/` quando precisar integrar com Zod ou OpenAPI — não importe a lib diretamente em controllers.
- Para novos utilitários genéricos, avalie contribuir em [koala-utils](https://github.com/igordrangel/koala-utils) em vez de duplicar no template.

## Veja também

- [OpenAPI e Scalar](../host/openapi-scalar.md) — schemas Zod em `src/core/schemas/`
- [Cron e Event Jobs](cron-event-jobs.md) — uso de `delay` no loop de jobs
