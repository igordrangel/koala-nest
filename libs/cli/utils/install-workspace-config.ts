import { cpSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { PackageManager } from '@cli/types';
import { getSourceCodePath } from './get-source-code-path';
import { resolveProjectPath } from './resolve-project-path';

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

  const gitignoreSource = path.join(getSourceCodePath(), '.gitignore');

  if (existsSync(gitignoreSource)) {
    cpSync(gitignoreSource, path.join(projectRoot, '.gitignore'), {
      force: true,
    });
  }
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
}

export function finalizeNewProjectSetup(
  projectName: string,
  packageManager: PackageManager,
): void {
  installWorkspaceConfig(projectName, packageManager);
  createEnvFromExample(projectName);
}
