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
import { AGENTS_LABEL } from '@cli/constants/agents';
import { installAgents } from '@cli/utils/install-agents.ts';

describe('installAgents', () => {
  let tempDir = '';

  afterEach(() => {
    if (tempDir) {
      rmSync(tempDir, { recursive: true, force: true });
      tempDir = '';
    }
  });

  function createProject() {
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'koala-agents-'));
    const projectDir = path.join(tempDir, 'my-api');
    mkdirSync(projectDir, { recursive: true });
    return projectDir;
  }

  it('instala AGENTS.md, instructions e skill code-review', () => {
    const projectDir = createProject();
    const previousCwd = process.cwd();

    try {
      process.chdir(tempDir);
      const result = installAgents('my-api');

      expect(result).toEqual({
        label: AGENTS_LABEL,
        installed: true,
      });
      expect(existsSync(path.join(projectDir, 'AGENTS.md'))).toBe(true);
      expect(
        existsSync(
          path.join(projectDir, '.agents/instructions/hard-constraints.md'),
        ),
      ).toBe(true);
      expect(
        existsSync(path.join(projectDir, '.agents/skills/code-review.md')),
      ).toBe(true);
      expect(
        existsSync(path.join(projectDir, '.cursor/rules/koala-layers.mdc')),
      ).toBe(false);
      expect(
        existsSync(path.join(projectDir, '.github/copilot-instructions.md')),
      ).toBe(false);
    } finally {
      process.chdir(previousCwd);
    }
  });

  it('remove estrutura legada de ai-context e sobrescreve AGENTS.md', () => {
    const projectDir = createProject();
    mkdirSync(path.join(projectDir, '.cursor/rules'), { recursive: true });
    writeFileSync(
      path.join(projectDir, '.cursor/rules/koala-layers.mdc'),
      'legacy',
    );
    mkdirSync(path.join(projectDir, '.github'), { recursive: true });
    writeFileSync(
      path.join(projectDir, '.github/copilot-instructions.md'),
      'legacy copilot',
    );
    writeFileSync(path.join(projectDir, 'AGENTS.md'), '# custom\n');
    const previousCwd = process.cwd();

    try {
      process.chdir(tempDir);
      installAgents('my-api');

      expect(readFileSync(path.join(projectDir, 'AGENTS.md'), 'utf8')).not.toBe(
        '# custom\n',
      );
      expect(
        existsSync(path.join(projectDir, '.cursor/rules/koala-layers.mdc')),
      ).toBe(false);
      expect(
        existsSync(path.join(projectDir, '.github/copilot-instructions.md')),
      ).toBe(false);
      expect(
        existsSync(path.join(projectDir, '.agents/skills/code-review.md')),
      ).toBe(true);
    } finally {
      process.chdir(previousCwd);
    }
  });

  it('recria por completo em segunda instalação', () => {
    const projectDir = createProject();
    const previousCwd = process.cwd();

    try {
      process.chdir(tempDir);
      installAgents('my-api');
      writeFileSync(
        path.join(projectDir, '.agents/skills/code-review.md'),
        '# mutated\n',
      );
      const second = installAgents('my-api');

      expect(second.installed).toBe(true);
      expect(
        readFileSync(
          path.join(projectDir, '.agents/skills/code-review.md'),
          'utf8',
        ),
      ).not.toBe('# mutated\n');
      expect(
        readFileSync(
          path.join(projectDir, '.agents/skills/code-review.md'),
          'utf8',
        ),
      ).toContain('Faça uma revisão completa utilizando os padrões Koala');
    } finally {
      process.chdir(previousCwd);
    }
  });
});
