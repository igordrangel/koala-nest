import { describe, expect, it } from 'bun:test';
import { z } from 'zod';
import { formatZodError } from '@/core/utils/format-zod-error';

describe('formatZodError', () => {
  it('formata erro de campo obrigatório', () => {
    const schema = z.object({ name: z.string() });
    const result = schema.safeParse({});

    if (result.success) {
      throw new Error('Esperava falha de validação');
    }

    const formatted = formatZodError(result.error);

    expect(formatted.message).toBe('O campo name é obrigatório.');
    expect(formatted.errors).toEqual([
      { field: 'name', message: 'O campo name é obrigatório.' },
    ]);
  });

  it('resume múltiplos erros em uma mensagem', () => {
    const schema = z.object({
      name: z.string(),
      email: z.string(),
    });
    const result = schema.safeParse({});

    if (result.success) {
      throw new Error('Esperava falha de validação');
    }

    const formatted = formatZodError(result.error);

    expect(formatted.message).toBe(
      'Foram encontrados 2 erros de validação.',
    );
    expect(formatted.errors).toHaveLength(2);
  });
});
