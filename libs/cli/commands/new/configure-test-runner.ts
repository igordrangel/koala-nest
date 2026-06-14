import type { PackageManager } from '@cli/types';

export function configureTestRunner(
  packageJson: Record<string, unknown>,
  packageManager: PackageManager,
) {
  const scripts = packageJson.scripts as Record<string, string>;
  const devDependencies = packageJson.devDependencies as Record<string, string>;

  if (packageManager === 'bun') {
    scripts.test = 'bun test';
    scripts['test:watch'] = 'bun test --watch';
    return;
  }

  scripts.test = 'vitest run --config vitest.config.ts';
  scripts['test:watch'] = 'vitest --config vitest.config.ts';
  devDependencies.vitest = '^4.1.8';
  devDependencies['vite-tsconfig-paths'] = '^5.1.4';
}

export function configureE2ETestRunner(
  packageJson: Record<string, unknown>,
  packageManager: PackageManager,
) {
  const scripts = packageJson.scripts as Record<string, string>;
  const devDependencies = packageJson.devDependencies as Record<string, string>;

  devDependencies.supertest ??= '^7.1.0';
  devDependencies['@types/supertest'] ??= '^6.0.2';

  if (packageManager === 'bun') {
    scripts['test:e2e'] =
      'bun test --preload ./src/test/setup-e2e.ts src/test/host/controllers/';
    return;
  }

  scripts['test:e2e'] = 'vitest run --config vitest.config.e2e.ts';
}
