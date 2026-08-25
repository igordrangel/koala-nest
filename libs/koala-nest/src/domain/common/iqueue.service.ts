export type QueueMessageBody = Record<string, unknown>;

export const QueueName = {
  example: 'example',
} as const;

export type QueueName = string;

export type PulledQueueMessage = {
  id: string;
  leaseId: string;
  body: QueueMessageBody;
};

export abstract class IQueueService {
  abstract isConfigured(queue: QueueName): boolean;
  abstract push(queue: QueueName, body: QueueMessageBody): Promise<void>;
  abstract pull(
    queue: QueueName,
    batchSize: number,
  ): Promise<PulledQueueMessage[]>;
  abstract ack(
    queue: QueueName,
    messages: Array<{ leaseId: string }>,
  ): Promise<void>;
  abstract retry(
    queue: QueueName,
    messages: Array<{ leaseId: string; delaySeconds?: number }>,
  ): Promise<void>;
}
