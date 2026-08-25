---
title: Queue jobs (mensageria)
slug: queue-jobs
category: core
docKey: core/queue-jobs
order: 6
description: Handlers de fila agnósticos ao provider — QueueBase, IQueueService e stub de infra.
---

# Queue jobs (mensageria)

> **Opt-in:** instale com `kl-nest new` (multiselect) ou `kl-nest add queue`.

A feature copia bases **agnósticas ao broker** (Cloudflare Queues, SQS, RabbitMQ, etc.). Você implementa o adapter de infra depois; o loop de consumo e o contrato já vêm prontos.

| Artefato | Papel |
| --- | --- |
| `QueueBase` | Loop de pull com concorrência, validação Zod, ack/retry |
| `IQueueService` | Port no domínio (`push` / `pull` / `ack` / `retry` / `isConfigured`) |
| `QueueService` | Stub de infra — métodos lançam `Not implemented` até você substituir |
| `QueueFakeService` | Fake in-memory para testes |

## Variáveis de ambiente

Ao instalar a feature, a CLI injeta em `env.ts` / `.env.example`:

| Variável | Default | Uso |
| --- | --- | --- |
| `QUEUE_MAX_CONCURRENCY` | `10` | Slots paralelos no `QueueBase` |
| `QUEUE_CAPACITY_DELAY_MS` | `200` | Espera quando não há slots livres |
| `QUEUE_IDLE_DELAY_MS` | `1000` | Espera quando a fila está vazia |
| `QUEUE_ERROR_DELAY_MS` | `2000` | Backoff após erro no loop |

Não há variáveis de provider (IDs Cloudflare, credenciais SQS, etc.) — isso fica na sua implementação de `IQueueService`.

## Criar um handler

1. Defina o DTO + `RequestValidatorBase` da mensagem.
2. Estenda `QueueBase<TMessage>` e implemente `processMessage`.
3. Passe as opções do env no `super`:

```typescript
@Injectable()
export class ConsumeExampleQueueHandler extends QueueBase<ExampleMessageDto> {
  constructor(queue: IQueueService, env: EnvService) {
    super(queue, {
      loggerName: ConsumeExampleQueueHandler.name,
      validator: ExampleMessageValidator,
      queueOptions: {
        queueName: QueueName.example,
        maxConcurrency: env.get('QUEUE_MAX_CONCURRENCY'),
        capacityDelayMs: env.get('QUEUE_CAPACITY_DELAY_MS'),
        idleDelayMs: env.get('QUEUE_IDLE_DELAY_MS'),
        errorDelayMs: env.get('QUEUE_ERROR_DELAY_MS'),
      },
    });
  }

  protected async processMessage(message: ExampleMessageDto): Promise<void> {
    // regra de negócio
  }
}
```

4. Registre o handler no módulo da feature e chame `start()` no bootstrap (`main.ts` ou um serviço `OnModuleInit`).
5. Substitua `QueueService` por um adapter real em `InfraModule` (`{ provide: IQueueService, useClass: MeuAdapter }`).

## Testes

Use `QueueFakeService` em testes unitários/integrados: `enqueue`, `push`/`pull`/`ack`/`retry` e `setConfigured(false)` para simular fila não configurada.
