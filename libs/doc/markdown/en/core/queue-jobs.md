---
title: Queue jobs (messaging)
slug: queue-jobs
category: core
docKey: core/queue-jobs
order: 6
description: Provider-agnostic queue handlers — QueueBase, IQueueService, and infra stub.
---

# Queue jobs (messaging)

> **Opt-in:** install with `kl-nest new` (multiselect) or `kl-nest add queue`.

This feature copies **broker-agnostic** bases (Cloudflare Queues, SQS, RabbitMQ, etc.). You implement the infra adapter later; the consume loop and port are ready.

| Artifact | Role |
| --- | --- |
| `QueueBase` | Pull loop with concurrency, Zod validation, ack/retry |
| `IQueueService` | Domain port (`push` / `pull` / `ack` / `retry` / `isConfigured`) |
| `QueueService` | Infra stub — methods throw until you replace them |
| `QueueFakeService` | In-memory fake for tests |

## Environment variables

When the feature is installed, the CLI injects into `env.ts` / `.env.example`:

| Variable | Default | Usage |
| --- | --- | --- |
| `QUEUE_MAX_CONCURRENCY` | `10` | Parallel slots in `QueueBase` |
| `QUEUE_CAPACITY_DELAY_MS` | `200` | Wait when no free slots |
| `QUEUE_IDLE_DELAY_MS` | `1000` | Wait when the queue is empty |
| `QUEUE_ERROR_DELAY_MS` | `2000` | Backoff after a loop error |

No provider-specific variables (Cloudflare IDs, SQS credentials, etc.) — those belong in your `IQueueService` implementation.

## Create a handler

1. Define the message DTO + `RequestValidatorBase`.
2. Extend `QueueBase<TMessage>` and implement `processMessage`.
3. Pass env options in `super`:

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
    // business logic
  }
}
```

4. Register the handler in the feature module and call `start()` during bootstrap (`main.ts` or an `OnModuleInit` service).
5. Replace `QueueService` with a real adapter in `InfraModule` (`{ provide: IQueueService, useClass: MyAdapter }`).

## Tests

Use `QueueFakeService` in unit/integration tests: `enqueue`, `push`/`pull`/`ack`/`retry`, and `setConfigured(false)` to simulate an unconfigured queue.
