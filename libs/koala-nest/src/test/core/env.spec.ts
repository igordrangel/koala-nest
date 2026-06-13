import { describe, expect, it } from 'bun:test';
import { envSchema } from '@/core/env';

describe('envSchema', () => {
  it('interpreta CRON_JOBS_ENABLED=false como desabilitado', () => {
    const env = envSchema.parse({
      NODE_ENV: 'test',
      DATABASE_URL: 'postgres://localhost/test',
      CRON_JOBS_ENABLED: 'false',
    });

    expect(env.CRON_JOBS_ENABLED).toBe(false);
  });
});
