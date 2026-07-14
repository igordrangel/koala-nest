import { describe, expect, it, mock } from 'bun:test';
import { matchApiKeyDomainOrigin } from '@/core/utils/match-api-key-domain-origin';

describe('matchApiKeyDomainOrigin', () => {
  it('aceita IP cadastrado igual ao cliente', async () => {
    expect(
      await matchApiKeyDomainOrigin('203.0.113.10', ['203.0.113.10']),
    ).toBe(true);
  });

  it('rejeita IP diferente', async () => {
    expect(
      await matchApiKeyDomainOrigin('203.0.113.10', ['198.51.100.1']),
    ).toBe(false);
  });
});
