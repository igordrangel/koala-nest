import { Injectable } from '@nestjs/common'
import { EnvConfig } from '../../core/utils/env.config'
import { IRedisService } from '../redis/iredis.service'
import { IRedLockService } from './ired-lock.service'

@Injectable()
export class RedLockService implements IRedLockService {
  constructor(private readonly redisService: IRedisService) {}

  async acquiredLock(key: string, ttlSecondsLock: number): Promise<boolean> {
    if (EnvConfig.isEnvTest) {
      return true
    }

    const lockKey = this.getLockKey(key)
    const canLock = await this.redisService.getCache(lockKey)

    if (canLock) {
      return false
    }

    await this.redisService.setCache(lockKey, ttlSecondsLock, 'RedLockService')

    return true
  }

  async releaseLock(key: string): Promise<void> {
    if (!EnvConfig.isEnvTest) {
      await this.redisService.deleteCache(this.getLockKey(key))
    }
  }

  private getLockKey(key: string) {
    return `redLock:${key}`
  }
}
