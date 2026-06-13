import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import type { PackageManager } from '@cli/types';
import { PackageManagerRunner } from '@cli/constants/package-manager';
import { runCommand } from '@cli/utils/run-command';

function updatePackageName(projectDir: string, projectName: string) {
  const packageJsonPath = path.join(projectDir, 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
    name: string;
  };

  packageJson.name = projectName;
  writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
}

function copyScaffoldFromCache(
  scaffoldCache: string,
  projectName: string,
  cwd: string,
) {
  const projectDir = path.join(cwd, projectName);
  cpSync(scaffoldCache, projectDir, { recursive: true });
  updatePackageName(projectDir, projectName);
}

function persistScaffoldCache(projectDir: string, scaffoldCache: string) {
  rmSync(scaffoldCache, { recursive: true, force: true });
  mkdirSync(scaffoldCache, { recursive: true });
  cpSync(projectDir, scaffoldCache, { recursive: true });
}

export async function createEmptyNestProject(
  projectName: string,
  packageManager: PackageManager,
): Promise<void> {
  const cwd = process.cwd();
  const projectDir = path.join(cwd, projectName);
  const scaffoldCache = process.env.KOALA_NEST_SCAFFOLD_CACHE;

  if (
    scaffoldCache &&
    packageManager === 'bun' &&
    existsSync(path.join(scaffoldCache, 'node_modules'))
  ) {
    copyScaffoldFromCache(scaffoldCache, projectName, cwd);
    return;
  }

  const command = PackageManagerRunner[packageManager];

  await runCommand([
    command,
    '@nestjs/cli',
    'new',
    projectName,
    '--package-manager',
    'npm',
    '--skip-git',
  ]);

  if (packageManager !== 'npm') {
    rmSync(path.join(cwd, projectName, 'package-lock.json'));
    rmSync(path.join(cwd, projectName, 'node_modules'), {
      recursive: true,
    });
  }

  await runCommand([packageManager, 'install'], projectDir);

  const scaffoldCacheBuild = process.env.KOALA_NEST_SCAFFOLD_CACHE_BUILD;

  if (scaffoldCacheBuild && packageManager === 'bun') {
    persistScaffoldCache(projectDir, scaffoldCacheBuild);
  }
}
