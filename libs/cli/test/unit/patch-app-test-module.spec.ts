import { mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'bun:test';
import { patchAppTestModuleForDefault } from '@cli/utils/patch-app-test-module.ts';

describe('patchAppTestModuleForDefault', () => {
  let tempDir = '';

  afterEach(() => {
    if (tempDir) {
      rmSync(tempDir, { recursive: true, force: true });
      tempDir = '';
    }
  });

  it('usa InfraModule no AppTestModule do template padrão', () => {
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'koala-app-test-'));
    mkdirSync(path.join(tempDir, 'src/test'), { recursive: true });

    const previousCwd = process.cwd();

    try {
      process.chdir(tempDir);
      patchAppTestModuleForDefault('.');
    } finally {
      process.chdir(previousCwd);
    }

    const content = readFileSync(
      path.join(tempDir, 'src/test/app-test.module.ts'),
      'utf8',
    );

    expect(content).toContain('InfraModule');
    expect(content).not.toContain('PersonModule');
    expect(content).toContain('e2eDatabaseUrl');
  });
});
