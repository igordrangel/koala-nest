import { RequestValidatorBase } from '@/application/common/request-validator.base';
import {
  IQueueService,
  PulledQueueMessage,
  QueueMessageBody,
  QueueName,
} from '@/domain/common/iqueue.service';
import { EnvService } from '@/infra/common/env.service';
import { delay } from '@koalarx/utils/KlDelay';
import { Logger } from '@nestjs/common';

export type QueueBaseOptions = {
  queueName: QueueName;
};

export type QueueMessageValidatorClass<TMessage> = new (
  request: Record<string, any>,
) => RequestValidatorBase<TMessage & Record<string, any>>;

export type QueueBaseConfig<TMessage> = {
  loggerName: string;
  validator: QueueMessageValidatorClass<TMessage>;
  queueOptions: QueueBaseOptions;
};

type QueueRuntimeOptions = {
  queueName: QueueName;
  maxConcurrency: number;
  capacityDelayMs: number;
  idleDelayMs: number;
  errorDelayMs: number;
};

export abstract class QueueBase<TMessage extends Record<string, any>> {
  private readonly queue: IQueueService;
  private readonly options: QueueRuntimeOptions;
  private readonly validator: QueueMessageValidatorClass<TMessage>;
  private running = false;
  private inFlight = 0;

  protected readonly logger: Logger;

  constructor(
    queue: IQueueService,
    env: EnvService,
    config: QueueBaseConfig<TMessage>,
  ) {
    this.queue = queue;
    this.options = {
      queueName: config.queueOptions.queueName,
      maxConcurrency: env.get('QUEUE_MAX_CONCURRENCY'),
      capacityDelayMs: env.get('QUEUE_CAPACITY_DELAY_MS'),
      idleDelayMs: env.get('QUEUE_IDLE_DELAY_MS'),
      errorDelayMs: env.get('QUEUE_ERROR_DELAY_MS'),
    };
    this.validator = config.validator;
    this.logger = new Logger(config.loggerName);
  }

  private parseMessage(message: PulledQueueMessage): TMessage | null {
    try {
      return new this.validator({
        id: message.id,
        leaseId: message.leaseId,
        ...message.body,
      }).validate();
    } catch {
      this.logger.warn(
        `Mensagem ${this.options.queueName} inválida (id=${message.id}); ACK sem retry`,
      );
      return null;
    }
  }

  private async dispatchMessage(message: PulledQueueMessage): Promise<void> {
    try {
      const parsedMessage = this.parseMessage(message);

      if (parsedMessage !== null) {
        await this.processMessage(parsedMessage);
      }

      await this.queue.ack(this.options.queueName, [
        { leaseId: message.leaseId },
      ]);
    } catch (error) {
      this.logger.error(
        `Falha ao processar mensagem da fila ${this.options.queueName}`,
        error,
      );

      try {
        await this.queue.retry(this.options.queueName, [
          { leaseId: message.leaseId },
        ]);
      } catch (retryError) {
        this.logger.error(
          `Falha ao solicitar retry na fila ${this.options.queueName}`,
          retryError,
        );
      }
    } finally {
      this.inFlight -= 1;
    }
  }

  protected abstract processMessage(message: TMessage): Promise<void>;

  protected push(queue: QueueName, body: QueueMessageBody): Promise<void> {
    return this.queue.push(queue, body);
  }

  async start(): Promise<void> {
    if (this.running) {
      return;
    }

    if (!this.queue.isConfigured(this.options.queueName)) {
      this.logger.warn(
        `Handler não iniciado: fila ${this.options.queueName} não configurada`,
      );
      return;
    }

    this.running = true;
    this.logger.log(
      `Handler iniciado para ${this.options.queueName} (max concurrency=${this.options.maxConcurrency})`,
    );

    while (this.running) {
      try {
        const slots = this.options.maxConcurrency - this.inFlight;

        if (slots <= 0) {
          await delay(this.options.capacityDelayMs);
          continue;
        }

        const messages = await this.queue.pull(this.options.queueName, slots);

        if (messages.length === 0) {
          await delay(this.options.idleDelayMs);
          continue;
        }

        for (const message of messages) {
          this.inFlight += 1;
          void this.dispatchMessage(message);
        }
      } catch (error) {
        this.logger.error(
          `Falha no loop da fila ${this.options.queueName}`,
          error,
        );
        await delay(this.options.errorDelayMs);
      }
    }
  }

  stop(): void {
    this.running = false;
  }
}
