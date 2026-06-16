/// <reference types="bun-types/test-globals" />

import {
  cronExpressionToBoolean,
  getCronExecutionKey,
} from '@/core/utils/cron-expression-to-boolean';
import { describe, expect, it } from 'bun:test';

describe('getCronExecutionKey', () => {
  it('retorna ISO do tick quando o instante coincide com a expressão', () => {
    const at = new Date(2024, 5, 12, 12, 0, 0, 1);

    expect(getCronExecutionKey('0 0 12 * * *', at)).toBe(
      new Date(2024, 5, 12, 12, 0, 0).toISOString(),
    );
  });

  it('retorna null quando o instante não coincide', () => {
    const at = new Date(2024, 5, 12, 12, 0, 1);

    expect(getCronExecutionKey('0 0 12 * * *', at)).toBeNull();
  });
});

describe('cronExpressionToBoolean', () => {
  it('retorna true quando o instante atual coincide com o tick da expressão', () => {
    const at = new Date(2024, 5, 12, 12, 0, 0, 1);

    expect(cronExpressionToBoolean('0 0 12 * * *', at)).toBe(true);
  });

  it('retorna false quando o instante atual não coincide com o tick da expressão', () => {
    const at = new Date(2024, 5, 12, 12, 0, 1);

    expect(cronExpressionToBoolean('0 0 12 * * *', at)).toBe(false);
  });

  it('retorna false para expressão inválida', () => {
    expect(cronExpressionToBoolean('not a cron')).toBe(false);
  });
});
