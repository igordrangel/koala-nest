import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import {
  applyWorkerProfile,
  WORKER_HTTP_PATHS_TO_REMOVE,
} from '@cli/utils/apply-worker-profile.ts';
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';

describe('apply-worker-profile', () => {
  let tempDir = '';
  let previousCwd = '';

  beforeEach(() => {
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'koala-worker-profile-'));
    previousCwd = process.cwd();
    writeFileSync(path.join(tempDir, 'package.json'), '{}\n');

    for (const relativePath of WORKER_HTTP_PATHS_TO_REMOVE) {
      const fullPath = path.join(tempDir, relativePath);

      if (relativePath.endsWith('.ts')) {
        mkdirSync(path.dirname(fullPath), { recursive: true });
        writeFileSync(fullPath, '// stub\n');
      } else {
        mkdirSync(fullPath, { recursive: true });
        writeFileSync(path.join(fullPath, '.keep'), '');
      }
    }

    mkdirSync(path.join(tempDir, 'src/host'), { recursive: true });
    writeFileSync(
      path.join(tempDir, 'src/host/main.ts'),
      "import { NestFactory } from '@nestjs/core';\n",
    );

    process.chdir(tempDir);
  });

  afterEach(() => {
    process.chdir(previousCwd);
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('remove controllers, decorators, filters e superfície HTTP', () => {
    applyWorkerProfile('');

    expect(existsSync(path.join(tempDir, 'src/host/controllers'))).toBe(false);
    expect(existsSync(path.join(tempDir, 'src/host/decorators'))).toBe(false);
    expect(existsSync(path.join(tempDir, 'src/host/filters'))).toBe(false);
    expect(existsSync(path.join(tempDir, 'src/host/open-api'))).toBe(false);
    expect(existsSync(path.join(tempDir, 'src/host/bootstrap'))).toBe(false);

    const main = readFileSync(path.join(tempDir, 'src/host/main.ts'), 'utf8');
    expect(main).toContain('createApplicationContext');
    expect(main).not.toContain('app.listen');
  });
});
