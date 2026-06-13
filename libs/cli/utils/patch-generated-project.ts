import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export function patchNestCliEntry(projectPath: string): void {
  const nestCliPath = path.join(projectPath, 'nest-cli.json');
  const nestCli = JSON.parse(readFileSync(nestCliPath, 'utf8')) as {
    entryFile?: string;
    [key: string]: unknown;
  };

  nestCli.entryFile = 'host/main';

  writeFileSync(nestCliPath, `${JSON.stringify(nestCli, null, 2)}\n`);
}

export function patchStartProdScript(projectPath: string): void {
  const packageJsonPath = path.join(projectPath, 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
    scripts?: Record<string, string>;
    [key: string]: unknown;
  };

  packageJson.scripts ??= {};
  packageJson.scripts['start:prod'] = 'node dist/host/main';

  writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
}

export function patchGeneratedProjectConfig(projectPath: string): void {
  patchNestCliEntry(projectPath);
  patchStartProdScript(projectPath);
}
