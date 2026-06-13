import { ICacheService } from '@/domain/common/icache.service';
import { IRedLockService } from '@/domain/common/ired-lock.service';
import { EnvService } from '@/infra/common/env.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RedLockService implements IRedLockService {
  constructor(
    private readonly cache: ICacheService,
    private readonly env: EnvService,
  ) {}

  async acquiredLock(key: string, ttlSecondsLock: number): Promise<boolean> {
    if (this.shouldBypassDistributedLock()) {
      return true;
    }

    return this.cache.setIfNotExists(
      this.getLockKey(key),
      'RedLockService',
      ttlSecondsLock,
    );
  }

  async releaseLock(key: string): Promise<void> {
    if (this.shouldBypassDistributedLock()) {
      return;
    }

    await this.cache.invalidate(this.getLockKey(key));
  }

  private shouldBypassDistributedLock() {
    return (
      this.env.get('NODE_ENV') === 'test' ||
      !this.env.get('REDIS_CONNECTION_STRING')
    );
  }

  private getLockKey(key: string) {
    return `redLock:${key}`;
  }
}
