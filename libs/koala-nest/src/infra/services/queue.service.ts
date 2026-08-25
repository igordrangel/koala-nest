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

  push(_queue: QueueName, _body: QueueMessageBody): Promise<void> {
    return Promise.reject(new Error(NOT_IMPLEMENTED));
  }

  pull(_queue: QueueName, _batchSize: number): Promise<PulledQueueMessage[]> {
    return Promise.reject(new Error(NOT_IMPLEMENTED));
  }

  ack(_queue: QueueName, _messages: Array<{ leaseId: string }>): Promise<void> {
    return Promise.reject(new Error(NOT_IMPLEMENTED));
  }

  retry(
    _queue: QueueName,
    _messages: Array<{ leaseId: string; delaySeconds?: number }>,
  ): Promise<void> {
    return Promise.reject(new Error(NOT_IMPLEMENTED));
  }
}
