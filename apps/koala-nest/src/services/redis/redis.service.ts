import { Injectable, OnModuleDestroy } from '@nestjs/common'
import Redis from 'ioredis'
import { EnvConfig } from '../../core/utils/env.config'
import { EnvService } from '../../env/env.service'
import { IRedisService } from './iredis.service'

@Injectable()
export class RedisService implements IRedisService, OnModuleDestroy {
  private readonly redisClient: Redis
  private readonly environment: string

  get isConnected(): boolean {
    return !!this.redisClient
  }

  constructor(env: EnvService) {
    if (!EnvConfig.isEnvTest) {
      const redisUrl = env.get('REDIS_CONNECTION_STRING')

      if (redisUrl) {
        const url = new URL(redisUrl)
        this.environment = env.get('NODE_ENV')

        this.redisClient = new Redis({
          host: url.hostname,
          port: Number(url.port),
          password: url.password,
          username: url.username,
        })
      }
    }
  }

  onModuleDestroy() {
    this.redisClient.disconnect()
  }

  async getCache(key: string): Promise<string | null> {
    if (EnvConfig.isEnvTest) {
      return ''
    }

    return await this.redisClient.get(this.getKeyCache(key))
  }

  async setCache(
    key: string,
    ttlSecondsCache: number,
    payload: any,
  ): Promise<void> {
    if (!EnvConfig.isEnvTest) {
      await this.redisClient.set(
        this.getKeyCache(key),
        JSON.stringify(payload),
        'EX',
        ttlSecondsCache,
      )
    }
  }

  async deleteCache(key: string): Promise<void> {
    if (!EnvConfig.isEnvTest) {
      await this.redisClient.del(this.getKeyCache(key))
    }
  }

  private getKeyCache(key: string) {
    return `${this.environment}:app:${key}`
  }
}
