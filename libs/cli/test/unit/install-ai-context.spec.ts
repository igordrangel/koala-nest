import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'bun:test';
import { AiContextTarget } from '@cli/constants/ai-context';
import { installAiContext } from '@cli/utils/install-ai-context.ts';

describe('installAiContext', () => {
  let tempDir = '';

  afterEach(() => {
    if (tempDir) {
      rmSync(tempDir, { recursive: true, force: true });
      tempDir = '';
    }
  });

  function createProject() {
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'koala-ai-context-'));
    const projectDir = path.join(tempDir, 'my-api');
    mkdirSync(projectDir, { recursive: true });
    return projectDir;
  }

  it('instala cursor com AGENTS.md e regras .cursor', () => {
    const projectDir = createProject();
    const previousCwd = process.cwd();

    try {
      process.chdir(tempDir);
      const results = installAiContext('my-api', [AiContextTarget.CURSOR]);

      expect(results).toEqual([
        {
          label: 'Cursor (.cursor/rules + AGENTS.md)',
          installed: true,
          reason: undefined,
        },
      ]);
      expect(existsSync(path.join(projectDir, 'AGENTS.md'))).toBe(true);
      expect(
        existsSync(path.join(projectDir, '.cursor/rules/koala-layers.mdc')),
      ).toBe(true);
      expect(
        existsSync(path.join(projectDir, '.github/copilot-instructions.md')),
      ).toBe(false);
    } finally {
      process.chdir(previousCwd);
    }
  });

  it('instala github com AGENTS.md e copilot-instructions', () => {
    const projectDir = createProject();
    const previousCwd = process.cwd();

    try {
      process.chdir(tempDir);
      installAiContext('my-api', [AiContextTarget.GITHUB]);

      expect(existsSync(path.join(projectDir, 'AGENTS.md'))).toBe(true);
      expect(
        existsSync(path.join(projectDir, '.github/copilot-instructions.md')),
      ).toBe(true);
      expect(
        existsSync(path.join(projectDir, '.cursor/rules/koala-layers.mdc')),
      ).toBe(false);
    } finally {
      process.chdir(previousCwd);
    }
  });

  it('não sobrescreve AGENTS.md existente', () => {
    const projectDir = createProject();
    writeFileSync(path.join(projectDir, 'AGENTS.md'), '# custom\n');
    const previousCwd = process.cwd();

    try {
      process.chdir(tempDir);
      installAiContext('my-api', [AiContextTarget.CURSOR]);

      expect(readFileSync(path.join(projectDir, 'AGENTS.md'), 'utf8')).toBe(
        '# custom\n',
      );
    } finally {
      process.chdir(previousCwd);
    }
  });

  it('é idempotente quando regras já existem', () => {
    createProject();
    const previousCwd = process.cwd();

    try {
      process.chdir(tempDir);
      installAiContext('my-api', [AiContextTarget.CURSOR]);
      const second = installAiContext('my-api', [AiContextTarget.CURSOR]);

      expect(second[0]?.installed).toBe(false);
      expect(second[0]?.reason).toMatch(/já estão instaladas/);
    } finally {
      process.chdir(previousCwd);
    }
  });
});
