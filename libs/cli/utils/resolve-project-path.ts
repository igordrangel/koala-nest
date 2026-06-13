import path from 'node:path';
import { existsSync } from 'node:fs';

export function resolveProjectPath(projectName: string): string {
  const cwd = process.cwd();

  if (!projectName || projectName === '.') {
    return cwd;
  }

  const nestedPath = path.join(cwd, projectName);

  if (existsSync(path.join(nestedPath, 'package.json'))) {
    return nestedPath;
  }

  if (
    path.basename(cwd) === projectName &&
    existsSync(path.join(cwd, 'package.json'))
  ) {
    return cwd;
  }

  return nestedPath;
}
