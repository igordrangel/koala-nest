import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { DDD_LAYER_FOLDERS } from '@cli/constants/domain';
import { patchGeneratedProjectConfig } from '@cli/utils/patch-generated-project.ts';
import { runCommand } from '@cli/utils/run-command';
import type { PackageManager } from '@cli/types';
import { configureE2ETestRunner, configureTestRunner } from './configure-test-runner.ts';

export async function createDDDStructure(
  projectName: string,
  packageManager: PackageManager,
): Promise<void> {
  const folders = [...DDD_LAYER_FOLDERS];

  for (const folder of folders) {
    mkdirSync(path.join(process.cwd(), projectName, folder), {
      recursive: true,
    });
  }

  rmSync(path.join(process.cwd(), projectName, 'test'), {
    recursive: true,
    force: true,
  });
  rmSync(path.join(process.cwd(), projectName, 'src/app.controller.spec.ts'), {
    force: true,
  });
  rmSync(path.join(process.cwd(), projectName, 'src/app.controller.ts'), {
    force: true,
  });
  rmSync(path.join(process.cwd(), projectName, 'src/app.module.ts'), {
    force: true,
  });
  rmSync(path.join(process.cwd(), projectName, 'src/app.service.ts'), {
    force: true,
  });
  rmSync(path.join(process.cwd(), projectName, 'src/main.ts'), { force: true });

  const packageJson = JSON.parse(
    readFileSync(path.join(process.cwd(), projectName, 'package.json'), 'utf8'),
  );

  packageJson.packageManager = packageManager;

  const migrationDatasource =
    '-d ./src/infra/database/migrations/migration-datasource.ts';
  const typeormCli = './node_modules/typeorm/cli.js';

  const migrationRunner =
    packageManager === 'bun'
      ? 'bun'
      : 'node --import ts-node/register/transpile-only';

  packageJson.scripts['migration:generate'] =
    packageManager === 'bun'
      ? 'bun ./src/infra/database/migrations/generate-migration.ts'
      : 'node --import ts-node/register/transpile-only ./src/infra/database/migrations/generate-migration.ts';
  packageJson.scripts['migration:run'] =
    `${migrationRunner} ${typeormCli} migration:run ${migrationDatasource}`;
  packageJson.scripts['migration:revert'] =
    `${migrationRunner} ${typeormCli} migration:revert ${migrationDatasource}`;

  packageJson.devDependencies ??= {};

  configureTestRunner(packageJson, packageManager);
  configureE2ETestRunner(packageJson, packageManager);

  delete packageJson.scripts['test:cov'];
  delete packageJson.scripts['test:debug'];
  delete packageJson.jest;

  delete packageJson.devDependencies['@types/jest'];
  delete packageJson.devDependencies['ts-jest'];

  writeFileSync(
    path.join(process.cwd(), projectName, 'package.json'),
    JSON.stringify(packageJson, null, 2),
  );

  patchGeneratedProjectConfig(path.join(process.cwd(), projectName));

  await runCommand(
    [packageManager, 'install'],
    path.join(process.cwd(), projectName),
  );
}
