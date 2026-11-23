import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
} from 'node:fs';
import path from 'node:path';
import {
  AGENTS_ASSET_RELATIVE_PATHS,
  AGENTS_FILE_PATH,
  AGENTS_INSTRUCTIONS_DIR,
  AGENTS_LABEL,
  AGENTS_SKILLS_DIR,
  LEGACY_AI_CONTEXT_CURSOR_RULE_PATHS,
  LEGACY_AI_CONTEXT_GITHUB_PATH,
} from '@cli/constants/agents';
import { getAgentsAssetsPath } from './get-agents-assets-path';
import { resolveProjectPath } from './resolve-project-path';

export type InstallAgentsResult = {
  label: string;
  installed: boolean;
  reason?: string;
};

function removeIfExists(targetPath: string): void {
  if (existsSync(targetPath)) {
    rmSync(targetPath, { recursive: true, force: true });
  }
}

function removeEmptyDirIfExists(dirPath: string): void {
  if (!existsSync(dirPath)) {
    return;
  }

  const entries = readdirSync(dirPath);

  if (entries.length === 0) {
    rmSync(dirPath, { recursive: true, force: true });
  }
}

/**
 * Remove estrutura antiga de contexto AI (Cursor/Copilot) e `.agents` gerado,
 * para o install poder recriar do zero.
 */
export function purgeAgentsContext(projectRoot: string): void {
  for (const relativePath of LEGACY_AI_CONTEXT_CURSOR_RULE_PATHS) {
    removeIfExists(path.join(projectRoot, relativePath));
  }

  removeEmptyDirIfExists(path.join(projectRoot, '.cursor', 'rules'));
  removeEmptyDirIfExists(path.join(projectRoot, '.cursor'));
  removeIfExists(path.join(projectRoot, LEGACY_AI_CONTEXT_GITHUB_PATH));
  removeIfExists(path.join(projectRoot, AGENTS_FILE_PATH));
  removeIfExists(path.join(projectRoot, AGENTS_INSTRUCTIONS_DIR));
  removeIfExists(path.join(projectRoot, AGENTS_SKILLS_DIR));
  removeEmptyDirIfExists(path.join(projectRoot, '.agents'));
}

function copyForce(sourcePath: string, targetPath: string): void {
  mkdirSync(path.dirname(targetPath), { recursive: true });
  cpSync(sourcePath, targetPath, { force: true });
}

/**
 * Instala contexto para agentes de IA (AGENTS.md + .agents/).
 * Sempre faz purge da estrutura anterior e sobrescreve os arquivos gerados.
 */
export function installAgents(projectName: string): InstallAgentsResult {
  const projectRoot = resolveProjectPath(projectName);
  const assetsRoot = getAgentsAssetsPath();

  purgeAgentsContext(projectRoot);

  for (const relativePath of AGENTS_ASSET_RELATIVE_PATHS) {
    copyForce(
      path.join(assetsRoot, relativePath),
      path.join(projectRoot, relativePath),
    );
  }

  return {
    label: AGENTS_LABEL,
    installed: true,
  };
}
