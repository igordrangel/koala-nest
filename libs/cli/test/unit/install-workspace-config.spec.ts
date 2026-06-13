import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'bun:test';
import { getSourceCodePath } from '@cli/utils/get-source-code-path.ts';
import {
  createEnvFromExample,
  installWorkspaceConfig,
  projectNameToSnakeCase,
} from '@cli/utils/install-workspace-config.ts';

describe('install-workspace-config', () => {
  let tempDir = '';

  afterEach(() => {
    if (tempDir) {
      rmSync(tempDir, { recursive: true, force: true });
      tempDir = '';
    }
  });

  it('copia .vscode e ajusta gerenciador de pacotes', () => {
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'koala-workspace-'));
    const projectDir = path.join(tempDir, 'my-api');
    mkdirSync(projectDir, { recursive: true });

    cpSync(
      path.join(getSourceCodePath(), '.vscode'),
      path.join(projectDir, '.vscode'),
      { recursive: true },
    );

    const previousCwd = process.cwd();

    try {
      process.chdir(tempDir);
      installWorkspaceConfig('my-api', 'pnpm');
    } finally {
      process.chdir(previousCwd);
    }

    const launch = JSON.parse(
      readFileSync(path.join(projectDir, '.vscode/launch.json'), 'utf8'),
    );
    const tasks = JSON.parse(
      readFileSync(path.join(projectDir, '.vscode/tasks.json'), 'utf8'),
    );
    const settings = JSON.parse(
      readFileSync(path.join(projectDir, '.vscode/settings.json'), 'utf8'),
    );

    expect(launch.configurations[0].runtimeExecutable).toBe('pnpm');
    expect(launch.configurations[0].cwd).toBe('${workspaceFolder}');
    expect(tasks.tasks[0].command).toBe('pnpm run start:dev');
    expect(settings['npm.packageManager']).toBe('pnpm');
    expect(existsSync(path.join(projectDir, '.gitignore'))).toBe(true);
  });

  it('converte nome do projeto para snake_case no banco', () => {
    expect(projectNameToSnakeCase('my-api')).toBe('my_api');
    expect(projectNameToSnakeCase('MyCoolApi')).toBe('my_cool_api');
    expect(projectNameToSnakeCase('already_snake')).toBe('already_snake');
  });

  it('cria .env a partir do .env.example com DATABASE_URL do projeto', () => {
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'koala-workspace-'));
    const projectDir = path.join(tempDir, 'my-api');
    mkdirSync(projectDir, { recursive: true });

    const example =
      'PORT=3000\nNODE_ENV=develop\nDATABASE_URL=postgresql://postgres:root@localhost:5432/koala_nest\n';
    writeFileSync(path.join(projectDir, '.env.example'), example);

    const previousCwd = process.cwd();

    try {
      process.chdir(tempDir);
      createEnvFromExample('my-api');
    } finally {
      process.chdir(previousCwd);
    }

    const expected =
      'PORT=3000\nNODE_ENV=develop\nDATABASE_URL=postgresql://postgres:root@localhost:5432/my_api\n';

    expect(readFileSync(path.join(projectDir, '.env'), 'utf8')).toBe(expected);
    expect(readFileSync(path.join(projectDir, '.env.example'), 'utf8')).toBe(
      expected,
    );
  });
});
