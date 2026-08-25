import {
  IQueueService,
  PulledQueueMessage,
  QueueMessageBody,
  QueueName,
} from '@/domain/common/iqueue.service';
import { randomUUID } from 'node:crypto';

export class QueueFakeService extends IQueueService {
  private readonly messages = new Map<QueueName, PulledQueueMessage[]>();
  private pushError: Error | null = null;
  private configured = true;

  readonly pushed: Array<{ queue: QueueName; body: QueueMessageBody }> = [];
  readonly acked: Array<{ queue: QueueName; leaseId: string }> = [];
  readonly retried: Array<{
    queue: QueueName;
    leaseId: string;
    delaySeconds?: number;
  }> = [];

  private bucket(queue: QueueName): PulledQueueMessage[] {
    const existing = this.messages.get(queue);

    if (existing) {
      return existing;
    }

    const created: PulledQueueMessage[] = [];
    this.messages.set(queue, created);
    return created;
  }

  enqueue(queue: QueueName, body: QueueMessageBody): PulledQueueMessage {
    const message: PulledQueueMessage = {
      id: randomUUID(),
      leaseId: randomUUID(),
      body,
    };
    this.bucket(queue).push(message);
    return message;
  }

  failNextPush(error: Error) {
    this.pushError = error;
  }

  setConfigured(configured: boolean): void {
    this.configured = configured;
  }

  isConfigured(_queue: QueueName): boolean {
    return this.configured;
  }

  async push(queue: QueueName, body: QueueMessageBody): Promise<void> {
    if (this.pushError) {
      const error = this.pushError;
      this.pushError = null;
      throw error;
    }

    this.pushed.push({ queue, body });
    this.bucket(queue).push({
      id: randomUUID(),
      leaseId: randomUUID(),
      body,
    });
  }

  async pull(
    queue: QueueName,
    batchSize: number,
  ): Promise<PulledQueueMessage[]> {
    return this.bucket(queue).splice(0, batchSize);
  }

  async ack(
    queue: QueueName,
    messages: Array<{ leaseId: string }>,
  ): Promise<void> {
    for (const message of messages) {
      this.acked.push({ queue, leaseId: message.leaseId });
    }
  }

  async retry(
    queue: QueueName,
    messages: Array<{ leaseId: string; delaySeconds?: number }>,
  ): Promise<void> {
    for (const message of messages) {
      this.retried.push({
        queue,
        leaseId: message.leaseId,
        delaySeconds: message.delaySeconds,
      });
    }
  }
}
