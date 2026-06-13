import { EnvService } from '@/infra/common/env.service';
import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicatorResult } from '@nestjs/terminus';

@Injectable()
export class RedisIndicator {
  constructor(private readonly env: EnvService) {}

  isConfigured() {
    return Boolean(this.env.get('REDIS_CONNECTION_STRING'));
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    const url = this.env.get('REDIS_CONNECTION_STRING');

    if (!url) {
      return { redis: { status: 'up' } };
    }

    try {
      const { Redis } = await import('ioredis');
      const client = new Redis(url, {
        connectTimeout: 2_000,
        maxRetriesPerRequest: 1,
        lazyConnect: true,
      });

      await client.connect();
      await client.ping();
      await client.quit();

      return { redis: { status: 'up' } };
    } catch (error) {
      if (isMissingIoredisModule(error)) {
        return {
          redis: {
            status: 'up',
            message:
              'REDIS_CONNECTION_STRING definido, mas ioredis não está instalado',
          },
        };
      }

      const message = error instanceof Error ? error.message : String(error);

      throw new HealthCheckError('Redis check failed', {
        redis: { status: 'down', message },
      });
    }
  }
}

export function isMissingIoredisModule(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const code = 'code' in error ? String(error.code) : '';
  return (
    code === 'ERR_MODULE_NOT_FOUND' ||
    code === 'MODULE_NOT_FOUND' ||
    /Cannot find module 'ioredis'/.test(error.message)
  );
}
