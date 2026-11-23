import { existsSync } from 'node:fs';
import path from 'node:path';
import { getPackageRoot } from './get-package-root';

/** Pasta com AGENTS.md e .agents/ para projetos gerados. */
export function getAgentsAssetsPath(): string {
  const root = getPackageRoot(import.meta.url);
  const publishedAssets = path.join(root, 'cli', 'assets', 'agents');

  if (existsSync(publishedAssets)) {
    return publishedAssets;
  }

  const monorepoAssets = path.join(root, 'libs', 'cli', 'assets', 'agents');

  if (existsSync(monorepoAssets)) {
    return monorepoAssets;
  }

  throw new Error(
    'Assets de agentes de IA não encontrados (cli/assets/agents).',
  );
}
