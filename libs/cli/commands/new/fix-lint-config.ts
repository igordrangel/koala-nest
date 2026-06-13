import { cpSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { getSourceCodePath } from '@cli/utils/get-source-code-path';
import { resolveProjectPath } from '@cli/utils/resolve-project-path';

export function fixLintConfig(projectName: string) {
  const projectPath = resolveProjectPath(projectName);
  const tsconfigPath = path.join(projectPath, 'tsconfig.json');

  const tsconfigProjectContent = JSON.parse(
    readFileSync(tsconfigPath, 'utf8'),
  ) as {
    compilerOptions?: Record<string, unknown>;
  };

  tsconfigProjectContent.compilerOptions ??= {};
  tsconfigProjectContent.compilerOptions.baseUrl = './';
  tsconfigProjectContent.compilerOptions.paths = {
    ...((tsconfigProjectContent.compilerOptions.paths as
      | Record<string, string[]>
      | undefined) ?? {}),
    '@/*': ['./src/*'],
  };

  writeFileSync(
    tsconfigPath,
    `${JSON.stringify(tsconfigProjectContent, null, 2)}\n`,
  );

  const eslintKoalaNestConfig = path.join(
    getSourceCodePath(),
    'eslint.config.mjs',
  );
  const eslintProjectConfig = path.join(projectPath, 'eslint.config.mjs');

  cpSync(eslintKoalaNestConfig, eslintProjectConfig, { force: true });

  const packageJsonProjectContent = JSON.parse(
    readFileSync(path.join(projectPath, 'package.json'), 'utf8'),
  );

  packageJsonProjectContent.scripts.lint = 'eslint "src/**/*.ts" --fix';
  packageJsonProjectContent.scripts.format = 'prettier --write "src/**/*.ts"';

  writeFileSync(
    path.join(projectPath, 'package.json'),
    JSON.stringify(packageJsonProjectContent, null, 2),
  );
}
