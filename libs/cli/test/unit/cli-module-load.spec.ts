import { describe, expect, it } from 'bun:test';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { repoRoot } from '../e2e/helpers.ts';

const cliRoot = path.join(repoRoot, 'libs/cli');

function listCliSourceFiles(dir: string, relativeDir = ''): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const relativePath = path.join(relativeDir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === 'test' || entry.name === 'tmp') {
        continue;
      }

      files.push(
        ...listCliSourceFiles(path.join(dir, entry.name), relativePath),
      );
      continue;
    }

    if (!entry.name.endsWith('.ts') || entry.name.endsWith('.d.ts')) {
      continue;
    }

    if (entry.name === 'index.ts') {
      continue;
    }

    files.push(relativePath);
  }

  return files.sort();
}

describe('CLI module load', () => {
  const cliFiles = listCliSourceFiles(cliRoot);

  it('index.ts da CLI existe (smoke separado no build)', () => {
    expect(cliFiles.length).toBeGreaterThan(20);
  });

  for (const file of cliFiles) {
    it(`carrega ${file} sem erro de módulo`, async () => {
      const modulePath = path.join(cliRoot, file);

      await expect(import(modulePath)).resolves.toBeDefined();
    });
  }
});
