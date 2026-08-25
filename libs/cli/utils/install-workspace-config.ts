import { cpSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { PackageManager } from '@cli/types';
import type { AiContextTarget } from '@cli/constants/ai-context';
import { AppType } from '@cli/constants/domain';
import { getSourceCodePath } from './get-source-code-path';
import { installAiContext } from './install-ai-context';
import { ensureJwtKeysInEnv } from './patch-env';
import { resolveProjectPath } from './resolve-project-path';
import { writeDockerAssets } from './write-docker-assets';

const PACKAGE_MANAGER_COMMAND: Record<PackageManager, string> = {
  bun: 'bun',
  npm: 'npm',
  pnpm: 'pnpm',
};

export function projectNameToSnakeCase(projectName: string): string {
  const baseName = path.isAbsolute(projectName)
    ? path.basename(projectName)
    : projectName;

  return baseName
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .replace(/__+/g, '_')
    .toLowerCase()
    .replace(/^_+|_+$/g, '');
}

function patchDatabaseUrl(content: string, databaseName: string): string {
  if (!/^DATABASE_URL=/m.test(content)) {
    return content;
  }

  return content.replace(
    /^(DATABASE_URL=.+\/)([^/\r\n]+)(\s*)$/m,
    `$1${databaseName}$3`,
  );
}

function patchJsonFile<T>(
  filePath: string,
  patch: (value: T) => void,
): void {
  const content = readFileSync(filePath, 'utf8');
  const json = JSON.parse(content) as T;

  patch(json);

  writeFileSync(filePath, `${JSON.stringify(json, null, 2)}\n`);
}

function runScriptCommand(
  packageManager: PackageManager,
  script: string,
): string {
  return `${PACKAGE_MANAGER_COMMAND[packageManager]} run ${script}`;
}

/** `.gitignore` some do npm pack; o build publica também como `gitignore`. */
function resolveTemplateGitignore(): string | null {
  const sourceRoot = getSourceCodePath();

  for (const name of ['.gitignore', 'gitignore'] as const) {
    const candidate = path.join(sourceRoot, name);

    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

export function installWorkspaceConfig(
  projectName: string,
  packageManager: PackageManager,
): void {
  const projectRoot = resolveProjectPath(projectName);
  const sourceVscode = path.join(getSourceCodePath(), '.vscode');
  const targetVscode = path.join(projectRoot, '.vscode');

  cpSync(sourceVscode, targetVscode, { recursive: true });

  const pmCommand = PACKAGE_MANAGER_COMMAND[packageManager];

  patchJsonFile<{
    configurations: Array<{
      runtimeExecutable: string;
      runtimeArgs: string[];
      cwd: string;
    }>;
  }>(path.join(targetVscode, 'launch.json'), (launch) => {
    const config = launch.configurations[0];

    config.runtimeExecutable = pmCommand;
    config.runtimeArgs = ['run', 'start:debug'];
    config.cwd = '${workspaceFolder}';
  });

  patchJsonFile<{
    tasks: Array<{
      command: string;
      options?: { cwd?: string };
    }>;
  }>(path.join(targetVscode, 'tasks.json'), (tasks) => {
    for (const task of tasks.tasks) {
      if (task.command.includes('start:dev')) {
        task.command = runScriptCommand(packageManager, 'start:dev');
      } else if (task.command.includes('test')) {
        task.command = runScriptCommand(packageManager, 'test');
      } else if (task.command.includes('test:e2e')) {
        task.command = runScriptCommand(packageManager, 'test:e2e');
      } else if (task.command.includes('migration:run')) {
        task.command = runScriptCommand(packageManager, 'migration:run');
      }

      task.options = { cwd: '${workspaceFolder}' };
    }
  });

  patchJsonFile<{ 'npm.packageManager': PackageManager }>(
    path.join(targetVscode, 'settings.json'),
    (settings) => {
      settings['npm.packageManager'] = packageManager;
    },
  );

  const gitignoreSource = resolveTemplateGitignore();

  if (!gitignoreSource) {
    throw new Error(
      'Template .gitignore não encontrado (esperado .gitignore ou gitignore em koala-nest).',
    );
  }

  cpSync(gitignoreSource, path.join(projectRoot, '.gitignore'), {
    force: true,
  });
}

export function createEnvFromExample(projectName: string): void {
  const projectRoot = resolveProjectPath(projectName);
  const examplePath = path.join(projectRoot, '.env.example');
  const envPath = path.join(projectRoot, '.env');

  if (!existsSync(examplePath)) {
    return;
  }

  const databaseName = projectNameToSnakeCase(projectName);
  const envContent = patchDatabaseUrl(
    readFileSync(examplePath, 'utf8'),
    databaseName,
  );

  writeFileSync(examplePath, envContent);
  writeFileSync(envPath, envContent);
  ensureJwtKeysInEnv(projectName);
}

export function finalizeNewProjectSetup(
  projectName: string,
  packageManager: PackageManager,
  aiContext: readonly AiContextTarget[] = [],
  appType: AppType = AppType.API,
): void {
  installWorkspaceConfig(projectName, packageManager);
  createEnvFromExample(projectName);
  writeDockerAssets(projectName, packageManager, appType);

  if (aiContext.length > 0) {
    installAiContext(projectName, aiContext);
  }
}
