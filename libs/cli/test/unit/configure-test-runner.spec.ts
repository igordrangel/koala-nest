import { describe, expect, it } from 'bun:test';
import {
  configureE2ETestRunner,
  configureTestRunner,
} from '@cli/commands/new/configure-test-runner.ts';

describe('configureTestRunner', () => {
  it('configura Bun test para projetos com bun', () => {
    const packageJson = {
      scripts: {} as Record<string, string>,
      devDependencies: {} as Record<string, string>,
    };

    configureTestRunner(packageJson, 'bun');

    expect(packageJson.scripts.test).toBe('bun test');
    expect(packageJson.scripts['test:watch']).toBe('bun test --watch');
    expect(packageJson.devDependencies.vitest).toBeUndefined();
  });

  it('configura Vitest para npm e pnpm', () => {
    const packageJson = {
      scripts: {} as Record<string, string>,
      devDependencies: {} as Record<string, string>,
    };

    configureTestRunner(packageJson, 'npm');

    expect(packageJson.scripts.test).toBe('vitest run --config vitest.config.ts');
    expect(packageJson.scripts['test:watch']).toBe('vitest --config vitest.config.ts');
    expect(packageJson.devDependencies.vitest).toBe('^4.1.8');
    expect(packageJson.devDependencies['vite-tsconfig-paths']).toBe('^5.1.4');
  });
});

describe('configureE2ETestRunner', () => {
  it('configura Bun E2E com preload do setup-e2e', () => {
    const packageJson = {
      scripts: {} as Record<string, string>,
      devDependencies: {} as Record<string, string>,
    };

    configureE2ETestRunner(packageJson, 'bun');

    expect(packageJson.scripts['test:e2e']).toBe(
      'bun test --preload ./src/test/setup-e2e.ts src/test/host/controllers/',
    );
    expect(packageJson.devDependencies.supertest).toBe('^7.1.0');
  });

  it('configura Vitest E2E para npm e pnpm', () => {
    const packageJson = {
      scripts: {} as Record<string, string>,
      devDependencies: {} as Record<string, string>,
    };

    configureE2ETestRunner(packageJson, 'pnpm');

    expect(packageJson.scripts['test:e2e']).toBe(
      'vitest run --config vitest.config.e2e.ts',
    );
    expect(packageJson.devDependencies['@types/supertest']).toBe('^6.0.2');
  });
});
