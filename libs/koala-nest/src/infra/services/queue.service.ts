import {
  IQueueService,
  PulledQueueMessage,
  QueueMessageBody,
  QueueName,
} from '@/domain/common/iqueue.service';
import { Injectable } from '@nestjs/common';

const NOT_IMPLEMENTED =
  'QueueService não implementado. Substitua por um adapter de mensageria (Cloudflare Queues, SQS, RabbitMQ, etc.).';

@Injectable()
export class QueueService extends IQueueService {
  isConfigured(_queue: QueueName): boolean {
    throw new Error(NOT_IMPLEMENTED);
  }

  async push(_queue: QueueName, _body: QueueMessageBody): Promise<void> {
    throw new Error(NOT_IMPLEMENTED);
  }

  async pull(
    _queue: QueueName,
    _batchSize: number,
  ): Promise<PulledQueueMessage[]> {
    throw new Error(NOT_IMPLEMENTED);
  }

  async ack(
    _queue: QueueName,
    _messages: Array<{ leaseId: string }>,
  ): Promise<void> {
    throw new Error(NOT_IMPLEMENTED);
  }

  async retry(
    _queue: QueueName,
    _messages: Array<{ leaseId: string; delaySeconds?: number }>,
  ): Promise<void> {
    throw new Error(NOT_IMPLEMENTED);
  }
}
