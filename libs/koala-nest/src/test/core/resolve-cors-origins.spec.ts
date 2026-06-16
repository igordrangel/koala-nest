import { describe, expect, it } from 'bun:test';
import { resolveCorsOrigin } from '@/core/utils/resolve-cors-origins';

describe('resolveCorsOrigin', () => {
  it('permite qualquer origin quando CORS_ORIGINS não está definido', () => {
    expect(resolveCorsOrigin(undefined)).toBe(true);
    expect(resolveCorsOrigin('')).toBe(true);
    expect(resolveCorsOrigin('   ')).toBe(true);
  });

  it('aceita lista de origens separadas por vírgula', () => {
    expect(
      resolveCorsOrigin('http://localhost:4200, https://app.example.com'),
    ).toEqual(['http://localhost:4200', 'https://app.example.com']);
  });

  it('retorna string única quando há uma origem', () => {
    expect(resolveCorsOrigin('https://app.example.com')).toBe(
      'https://app.example.com',
    );
  });
});
