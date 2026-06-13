import type { PackageManager } from '@cli/types/index.ts';

export const PackageManagerRunner: Record<PackageManager, string> = {
  bun: 'bunx',
  npm: 'npx',
  pnpm: 'pnpx',
};
