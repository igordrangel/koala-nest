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
import {
  patchGeneratedProjectConfig,
  patchNestCliEntry,
  patchStartProdScript,
} from '@cli/utils/patch-generated-project.ts';

describe('patchGeneratedProjectConfig', () => {
  let tempDir = '';

  afterEach(() => {
    if (tempDir) {
      rmSync(tempDir, { recursive: true, force: true });
      tempDir = '';
    }
  });

  it('ajusta entryFile e start:prod para src/host/main.ts', () => {
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'koala-nest-cli-'));
    mkdirSync(tempDir, { recursive: true });

    writeFileSync(
      path.join(tempDir, 'nest-cli.json'),
      `${JSON.stringify({ sourceRoot: 'src', entryFile: 'main' }, null, 2)}\n`,
    );
    writeFileSync(
      path.join(tempDir, 'package.json'),
      `${JSON.stringify({ scripts: { 'start:prod': 'node dist/main' } }, null, 2)}\n`,
    );

    patchGeneratedProjectConfig(tempDir);

    const nestCli = JSON.parse(
      readFileSync(path.join(tempDir, 'nest-cli.json'), 'utf8'),
    );
    const packageJson = JSON.parse(
      readFileSync(path.join(tempDir, 'package.json'), 'utf8'),
    );

    expect(nestCli.entryFile).toBe('host/main');
    expect(packageJson.scripts['start:prod']).toBe('node dist/host/main');
  });

  it('expõe funções individuais de patch', () => {
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'koala-nest-cli-'));
    mkdirSync(tempDir, { recursive: true });

    writeFileSync(
      path.join(tempDir, 'nest-cli.json'),
      `${JSON.stringify({ entryFile: 'main' }, null, 2)}\n`,
    );
    writeFileSync(
      path.join(tempDir, 'package.json'),
      `${JSON.stringify({}, null, 2)}\n`,
    );

    patchNestCliEntry(tempDir);
    patchStartProdScript(tempDir);

    const nestCli = JSON.parse(
      readFileSync(path.join(tempDir, 'nest-cli.json'), 'utf8'),
    );
    const packageJson = JSON.parse(
      readFileSync(path.join(tempDir, 'package.json'), 'utf8'),
    );

    expect(nestCli.entryFile).toBe('host/main');
    expect(packageJson.scripts['start:prod']).toBe('node dist/host/main');
  });
});
