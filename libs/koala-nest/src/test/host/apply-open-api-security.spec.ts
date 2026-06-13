import { describe, expect, it } from 'bun:test';
import { buildOpenApiPath } from '@/host/open-api/apply-open-api-security';

describe('apply-open-api-security', () => {
  it('normaliza rotas Nest para paths OpenAPI', () => {
    expect(buildOpenApiPath('/person', '')).toBe('/person');
    expect(buildOpenApiPath('/person', ':id')).toBe('/person/{id}');
    expect(buildOpenApiPath('/auth', 'token')).toBe('/auth/token');
  });
});
