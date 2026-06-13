import { describe, expect, it } from 'bun:test';
import { parseNewArgs } from '@cli/utils/parse-new-args.ts';

describe('parseNewArgs', () => {
  it('entra em modo interativo sem argumentos', () => {
    expect(parseNewArgs([])).toEqual({
      projectName: undefined,
      packageManager: undefined,
      template: undefined,
      auth: undefined,
      features: [],
      interactive: true,
    });
  });

  it('parseia new default não interativo', () => {
    expect(
      parseNewArgs([
        'my-api',
        '--template',
        'default',
        '--pm',
        'bun',
        '--auth',
        'none',
      ]),
    ).toEqual({
      projectName: 'my-api',
      packageManager: 'bun',
      template: 'default',
      auth: 'none',
      features: [],
      interactive: false,
    });
  });

  it('aceita alias crud e example no template', () => {
    expect(
      parseNewArgs(['demo', '-t', 'example', '--auth', 'jwt']).template,
    ).toBe('crudSample');
  });

  it('parseia features separadas por vírgula', () => {
    expect(
      parseNewArgs([
        'demo',
        '--template',
        'default',
        '--auth',
        'jwt',
        '--features',
        'cache,health,cron',
      ]).features,
    ).toEqual(['cache', 'health-check', 'internal-cron-jobs']);
  });

  it('rejeita auth none no template crud', () => {
    expect(() =>
      parseNewArgs(['demo', '--template', 'crud', '--auth', 'none']),
    ).toThrow(/CRUD exige autenticação/);
  });

  it('rejeita opção desconhecida', () => {
    expect(() => parseNewArgs(['demo', '--unknown'])).toThrow(/desconhecida/);
  });
});
