import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import {
  isCliVerbose,
  parseCliArgs,
  resetCliVerbose,
} from '@cli/utils/cli-options.ts';

describe('parseCliArgs', () => {
  beforeEach(() => {
    resetCliVerbose();
  });

  afterEach(() => {
    resetCliVerbose();
  });

  it('ativa verbose e remove a flag dos argumentos', () => {
    const parsed = parseCliArgs(['new', '--verbose']);

    expect(parsed.command).toBe('new');
    expect(parsed.commandArgs).toEqual([]);
    expect(parsed.verbose).toBe(true);
    expect(isCliVerbose()).toBe(true);
  });

  it('aceita --verbose em qualquer posição', () => {
    const parsed = parseCliArgs(['add', 'cache', '--verbose', 'health']);

    expect(parsed.command).toBe('add');
    expect(parsed.commandArgs).toEqual(['cache', 'health']);
    expect(isCliVerbose()).toBe(true);
  });

  it('mantém silent como padrão', () => {
    const parsed = parseCliArgs(['add', 'cache']);

    expect(parsed.verbose).toBe(false);
    expect(isCliVerbose()).toBe(false);
  });
});
