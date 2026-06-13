import { describe, expect, it } from 'bun:test';
import { formatCode } from '@cli/utils/format-code.ts';

describe('formatCode', () => {
  it('expõe função de formatação', () => {
    expect(typeof formatCode).toBe('function');
  });
});
