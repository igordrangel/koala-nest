import { ICacheService } from '@/domain/common/icache.service';
import Redis from 'ioredis';

export class RedisCacheService implements ICacheService {
  private readonly client: Redis;

  constructor(
    connectionString: string,
    private readonly keyPrefix: string,
    client?: Redis,
  ) {
    this.client =
      client ??
      new Redis(connectionString, {
        maxRetriesPerRequest: 3,
        lazyConnect: false,
      });
  }

  get(key: string): Promise<string | null> {
    return this.client.get(this.buildKey(key));
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    const redisKey = this.buildKey(key);

    if (ttl !== undefined && ttl > 0) {
      await this.client.set(redisKey, value, 'EX', Math.ceil(ttl));
      return;
    }

    await this.client.set(redisKey, value);
  }

  async setIfNotExists(
    key: string,
    value: string,
    ttl: number,
  ): Promise<boolean> {
    const redisKey = this.buildKey(key);
    const result = await this.client.set(
      redisKey,
      value,
      'EX',
      Math.ceil(ttl),
      'NX',
    );

    return result === 'OK';
  }

  invalidate(key: string): Promise<void> {
    return this.client.del(this.buildKey(key)).then(() => undefined);
  }

  async invalidateByPrefix(prefix: string): Promise<void> {
    const pattern = `${this.buildKey(prefix)}*`;
    const keys = await this.client.keys(pattern);

    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  onModuleDestroy() {
    this.client.disconnect();
  }

  private buildKey(key: string) {
    return `${this.keyPrefix}:${key}`;
  }
}
