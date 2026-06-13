import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'bun:test';
import { fixLintConfig } from '@cli/commands/new/fix-lint-config.ts';

describe('fixLintConfig', () => {
  let tempDir = '';

  afterEach(() => {
    if (tempDir) {
      rmSync(tempDir, { recursive: true, force: true });
      tempDir = '';
    }
  });

  it('adiciona alias @/* ao tsconfig do projeto', () => {
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'koala-nest-cli-'));
    mkdirSync(tempDir, { recursive: true });

    writeFileSync(
      path.join(tempDir, 'tsconfig.json'),
      `${JSON.stringify({ compilerOptions: {} }, null, 2)}\n`,
    );
    writeFileSync(
      path.join(tempDir, 'package.json'),
      `${JSON.stringify({ scripts: {} }, null, 2)}\n`,
    );
    writeFileSync(
      path.join(tempDir, 'eslint.config.mjs'),
      'export default [];\n',
    );

    const previousCwd = process.cwd();
    process.chdir(tempDir);

    try {
      fixLintConfig('.');
      const tsconfig = JSON.parse(
        readFileSync(path.join(tempDir, 'tsconfig.json'), 'utf8'),
      );

      expect(tsconfig.compilerOptions.baseUrl).toBe('./');
      expect(tsconfig.compilerOptions.paths['@/*']).toEqual(['./src/*']);
    } finally {
      process.chdir(previousCwd);
    }
  });
});
