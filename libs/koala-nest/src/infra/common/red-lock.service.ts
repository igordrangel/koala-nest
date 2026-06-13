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
    if (this.env.get('NODE_ENV') === 'test') {
      return true;
    }

    const lockKey = this.getLockKey(key);
    const existingLock = await this.cache.get(lockKey);

    if (existingLock) {
      return false;
    }

    await this.cache.set(lockKey, 'RedLockService', ttlSecondsLock);

    return true;
  }

  async releaseLock(key: string): Promise<void> {
    if (this.env.get('NODE_ENV') !== 'test') {
      await this.cache.invalidate(this.getLockKey(key));
    }
  }

  private getLockKey(key: string) {
    return `redLock:${key}`;
  }
}
