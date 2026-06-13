import { rmSync } from 'node:fs';
import path from 'node:path';
import { resolveProjectPath } from './resolve-project-path';

export function pruneCoreAuthForSlimTemplate(projectName: string) {
  const projectRoot = resolveProjectPath(projectName);

  rmSync(path.join(projectRoot, 'src/core/auth'), {
    recursive: true,
    force: true,
  });

  for (const relativePath of [
    'src/core/utils/hash-password.ts',
    'src/core/utils/name-to-login.ts',
    'src/core/types/auth-provider-config-response.type.ts',
  ]) {
    rmSync(path.join(projectRoot, relativePath), { force: true });
  }
}
