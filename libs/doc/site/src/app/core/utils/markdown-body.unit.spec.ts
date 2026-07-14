import { describe, expect, it } from 'vitest';
import { stripFrontmatter } from './markdown-body';

describe('stripFrontmatter', () => {
  it('remove YAML frontmatter e retorna o body', () => {
    const raw = `---
title: Guia
---

# Guia

Corpo.`;
    expect(stripFrontmatter(raw)).toBe('# Guia\n\nCorpo.');
  });

  it('retorna o conteúdo inteiro quando não há frontmatter', () => {
    expect(stripFrontmatter('# Só body')).toBe('# Só body');
  });
});
