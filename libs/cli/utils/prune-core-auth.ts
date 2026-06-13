import { existsSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { resolveProjectPath } from './resolve-project-path';

const CORE_AUTH_KEEP = new Set(['jwt-claims.ts', 'auth-profile.enum.ts']);

export function pruneCoreAuthForSlimTemplate(projectName: string) {
  const projectRoot = resolveProjectPath(projectName);
  const authDir = path.join(projectRoot, 'src/core/auth');

  if (existsSync(authDir)) {
    for (const entry of readdirSync(authDir)) {
      if (!CORE_AUTH_KEEP.has(entry)) {
        rmSync(path.join(authDir, entry), { force: true });
      }
    }
  }

  for (const relativePath of [
    'src/core/utils/hash-password.ts',
    'src/core/utils/name-to-login.ts',
    'src/core/types/auth-provider-config-response.type.ts',
  ]) {
    rmSync(path.join(projectRoot, relativePath), { force: true });
  }
}
