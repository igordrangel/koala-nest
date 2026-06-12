import { ICacheService } from '@/domain/common/icache.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RedisService implements ICacheService {
  get(key: string): Promise<string | null> {
    throw new Error('Method not implemented.');
  }

  set(key: string, value: string, ttl?: number): Promise<void> {
    throw new Error('Method not implemented.');
  }

  invalidate(key: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
