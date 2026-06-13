import { beforeAll, describe, expect, it } from 'bun:test';
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import {
  cliBuildScript,
  cliEntry,
  ensureCliBuilt,
  repoRoot,
} from '../cli-e2e/helpers.ts';

describe('CLI build', () => {
  beforeAll(() => {
    ensureCliBuilt();
  });

  it('transpila todos os arquivos da CLI para dist/cli', () => {
    expect(existsSync(cliEntry)).toBe(true);
  });

  it('executa kl-nest --help após o build', () => {
    const result = spawnSync('node', [cliEntry, '--help'], {
      cwd: repoRoot,
      encoding: 'utf8',
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('kl-nest');
    expect(result.stdout).toContain('add');
    expect(result.stdout).toContain('new');
  });

  it('build-cli.mjs é idempotente', () => {
    const result = spawnSync('bun', [cliBuildScript], {
      cwd: repoRoot,
      encoding: 'utf8',
    });

    expect(result.status).toBe(0);
    expect(existsSync(cliEntry)).toBe(true);
  });
});
