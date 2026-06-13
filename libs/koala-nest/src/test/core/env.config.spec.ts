import { describe, expect, it } from 'bun:test';
import { EnvConfig } from '@/core/utils/env.config';

describe('EnvConfig', () => {
  it('identifica ambiente develop', () => {
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = 'develop';

    expect(EnvConfig.isEnvDevelop).toBe(true);
    expect(EnvConfig.isEnvProduction).toBe(false);

    process.env.NODE_ENV = previous;
  });
});
