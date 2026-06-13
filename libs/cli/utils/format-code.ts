import { getPackageManager } from './get-package-manager';
import { resolveProjectPath } from './resolve-project-path';
import { runCommand } from './run-command';

export async function formatCode(projectName: string) {
  if (process.env.CI === '1' || process.env.KOALA_SKIP_FORMAT === '1') {
    return;
  }

  await runCommand(
    [getPackageManager(projectName), 'run', 'format'],
    resolveProjectPath(projectName),
  );
}
