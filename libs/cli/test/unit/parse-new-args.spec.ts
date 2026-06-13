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
      yes: false,
      interactive: true,
    });
  });

  it('permanece interativo mesmo com nome do projeto sem -y', () => {
    expect(parseNewArgs(['my-api', '--template', 'default'])).toEqual({
      projectName: 'my-api',
      packageManager: undefined,
      template: 'default',
      auth: undefined,
      features: [],
      yes: false,
      interactive: true,
    });
  });

  it('parseia new não interativo com -y', () => {
    expect(
      parseNewArgs([
        'my-api',
        '-y',
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
      yes: true,
      interactive: false,
    });
  });

  it('aceita alias --yes', () => {
    expect(parseNewArgs(['demo', '--yes']).yes).toBe(true);
    expect(parseNewArgs(['demo', '--yes']).interactive).toBe(false);
  });

  it('aceita alias crud e example no template', () => {
    expect(
      parseNewArgs(['demo', '-y', '-t', 'example', '--auth', 'jwt']).template,
    ).toBe('crudSample');
  });

  it('parseia features separadas por vírgula', () => {
    expect(
      parseNewArgs([
        'demo',
        '-y',
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
      parseNewArgs(['demo', '-y', '--template', 'crud', '--auth', 'none']),
    ).toThrow(/CRUD exige autenticação/);
  });

  it('rejeita opção desconhecida', () => {
    expect(() => parseNewArgs(['demo', '--unknown'])).toThrow(/desconhecida/);
  });
});
