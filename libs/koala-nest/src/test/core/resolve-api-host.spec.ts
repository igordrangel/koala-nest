import { describe, expect, it } from 'bun:test';
import { resolveApiHost } from '@/core/utils/resolve-api-host';

describe('resolveApiHost', () => {
  it('usa localhost com porta quando API_HOST não está definido', () => {
    expect(resolveApiHost(undefined, 3000)).toBe('http://localhost:3000');
  });

  it('normaliza host sem protocolo', () => {
    expect(resolveApiHost('api.example.com', 3000)).toBe(
      'http://api.example.com',
    );
  });

  it('remove barra final do host', () => {
    expect(resolveApiHost('https://api.example.com/', 3000)).toBe(
      'https://api.example.com',
    );
  });
});
