import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'bun:test';
import {
  buildDockerfile,
  writeDockerAssets,
} from '@cli/utils/write-docker-assets.ts';

describe('write-docker-assets', () => {
  let tempDir = '';

  afterEach(() => {
    if (tempDir) {
      rmSync(tempDir, { recursive: true, force: true });
      tempDir = '';
    }
  });

  it('gera Dockerfile por package manager', () => {
    expect(buildDockerfile('bun')).toContain('oven/bun:1.3.6-debian');
    expect(buildDockerfile('bun')).toContain('bun ci');
    expect(buildDockerfile('bun')).toContain('EXPOSE 3000');
    expect(buildDockerfile('bun')).toContain('chmod +x entrypoint.sh');
    expect(buildDockerfile('npm')).toContain('node:22-bookworm-slim');
    expect(buildDockerfile('npm')).toContain('npm ci');
    expect(buildDockerfile('npm')).toContain('chmod +x entrypoint.sh');
    expect(buildDockerfile('pnpm')).toContain('pnpm install --frozen-lockfile');
    expect(buildDockerfile('pnpm')).toContain('corepack enable');
    expect(buildDockerfile('pnpm')).toContain('chmod +x entrypoint.sh');
  });

  it('worker não expõe porta HTTP', () => {
    expect(buildDockerfile('bun', 'worker')).not.toContain('EXPOSE 3000');
    expect(buildDockerfile('npm', 'worker')).not.toContain('EXPOSE 3000');
  });

  it('escreve Dockerfile e entrypoint executável', () => {
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'koala-docker-'));
    const projectDir = path.join(tempDir, 'api');
    mkdirSync(projectDir, { recursive: true });

    const previousCwd = process.cwd();

    try {
      process.chdir(tempDir);
      writeDockerAssets('api', 'bun');
    } finally {
      process.chdir(previousCwd);
    }

    const dockerfile = readFileSync(path.join(projectDir, 'Dockerfile'), 'utf8');
    const entrypoint = readFileSync(
      path.join(projectDir, 'entrypoint.sh'),
      'utf8',
    );
    const mode = statSync(path.join(projectDir, 'entrypoint.sh')).mode & 0o111;

    expect(dockerfile).toContain('oven/bun');
    expect(entrypoint).toContain('exec node dist/host/main');
    expect(mode).toBeGreaterThan(0);
  });
});
