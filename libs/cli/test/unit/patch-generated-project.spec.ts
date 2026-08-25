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
  patchBuildScript,
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

  it('ajusta entryFile, start:prod e build com tsc-alias', () => {
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'koala-nest-cli-'));
    mkdirSync(tempDir, { recursive: true });

    writeFileSync(
      path.join(tempDir, 'nest-cli.json'),
      `${JSON.stringify({ sourceRoot: 'src', entryFile: 'main' }, null, 2)}\n`,
    );
    writeFileSync(
      path.join(tempDir, 'package.json'),
      `${JSON.stringify(
        {
          scripts: {
            build: 'nest build',
            'start:prod': 'node dist/main',
          },
        },
        null,
        2,
      )}\n`,
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
    expect(packageJson.scripts.build).toBe(
      'nest build && tsc-alias -p tsconfig.build.json',
    );
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
    patchBuildScript(tempDir);

    const nestCli = JSON.parse(
      readFileSync(path.join(tempDir, 'nest-cli.json'), 'utf8'),
    );
    const packageJson = JSON.parse(
      readFileSync(path.join(tempDir, 'package.json'), 'utf8'),
    );

    expect(nestCli.entryFile).toBe('host/main');
    expect(packageJson.scripts['start:prod']).toBe('node dist/host/main');
    expect(packageJson.scripts.build).toBe(
      'nest build && tsc-alias -p tsconfig.build.json',
    );
  });
});
