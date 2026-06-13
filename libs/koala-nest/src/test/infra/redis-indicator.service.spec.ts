import { describe, expect, it } from 'bun:test';
import {
  isMissingIoredisModule,
  RedisIndicator,
} from '@/infra/services/redis.indicator.service';
import type { HealthIndicatorService } from '@nestjs/terminus';

function createHealthIndicatorServiceMock(): HealthIndicatorService {
  return {
    check: (key: string) => ({
      up: (details?: Record<string, unknown>) => ({
        [key]: { status: 'up' as const, ...details },
      }),
      down: (details?: Record<string, unknown> | string) => {
        const data =
          typeof details === 'string' ? { message: details } : details;

        return { [key]: { status: 'down' as const, ...data } };
      },
    }),
  } as HealthIndicatorService;
}

describe('RedisIndicator', () => {
  it('retorna up quando REDIS_CONNECTION_STRING não está definido', async () => {
    const indicator = new RedisIndicator(
      {
        get: () => undefined,
      } as never,
      createHealthIndicatorServiceMock(),
    );

    await expect(indicator.isHealthy()).resolves.toEqual({
      redis: { status: 'up' },
    });
  });

  it('isConfigured reflete presença de REDIS_CONNECTION_STRING', () => {
    const healthIndicatorService = createHealthIndicatorServiceMock();

    const configured = new RedisIndicator(
      {
        get: (key: string) =>
          key === 'REDIS_CONNECTION_STRING'
            ? 'redis://localhost:6379'
            : undefined,
      } as never,
      healthIndicatorService,
    );

    const notConfigured = new RedisIndicator(
      {
        get: () => undefined,
      } as never,
      healthIndicatorService,
    );

    expect(configured.isConfigured()).toBe(true);
    expect(notConfigured.isConfigured()).toBe(false);
  });
});

describe('isMissingIoredisModule', () => {
  it('detecta módulo ioredis ausente', () => {
    const error = new Error("Cannot find module 'ioredis'");
    (error as NodeJS.ErrnoException).code = 'ERR_MODULE_NOT_FOUND';

    expect(isMissingIoredisModule(error)).toBe(true);
  });

  it('ignora outros erros', () => {
    expect(isMissingIoredisModule(new Error('ECONNREFUSED'))).toBe(false);
    expect(isMissingIoredisModule('fail')).toBe(false);
  });
});
