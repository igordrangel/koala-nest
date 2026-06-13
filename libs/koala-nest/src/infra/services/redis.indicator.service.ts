import { EnvService } from '@/infra/common/env.service';
import { Injectable } from '@nestjs/common';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';

@Injectable()
export class RedisIndicator {
  constructor(
    private readonly env: EnvService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  isConfigured() {
    return Boolean(this.env.get('REDIS_CONNECTION_STRING'));
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check('redis');
    const url = this.env.get('REDIS_CONNECTION_STRING');

    if (!url) {
      return indicator.up();
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

      return indicator.up();
    } catch (error) {
      if (isMissingIoredisModule(error)) {
        return indicator.up({
          message:
            'REDIS_CONNECTION_STRING definido, mas ioredis não está instalado',
        });
      }

      const message = error instanceof Error ? error.message : String(error);

      return indicator.down({ message });
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
