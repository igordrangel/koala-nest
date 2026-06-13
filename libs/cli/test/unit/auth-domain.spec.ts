import { describe, expect, it } from 'bun:test';
import {
  AuthStrategy,
  listMissingAuthStrategies,
  mergeAuthStrategies,
  parseAuthStrategies,
  resolveAuthStrategiesFromModule,
  Template,
} from '@cli/constants/domain';

describe('parseAuthStrategies', () => {
  it('retorna vazio para none no template default', () => {
    expect(parseAuthStrategies('none', Template.DEFAULT)).toEqual([]);
    expect(parseAuthStrategies('', Template.DEFAULT)).toEqual([]);
  });

  it('aceita jwt, oauth2 e combinações deduplicadas', () => {
    expect(parseAuthStrategies('jwt')).toEqual([AuthStrategy.JWT]);
    expect(parseAuthStrategies('oauth2')).toEqual([AuthStrategy.OAUTH2]);
    expect(parseAuthStrategies('jwt,oauth2')).toEqual([
      AuthStrategy.JWT,
      AuthStrategy.OAUTH2,
    ]);
    expect(parseAuthStrategies('oauth2,jwt,oauth2')).toEqual([
      AuthStrategy.OAUTH2,
      AuthStrategy.JWT,
    ]);
  });

  it('rejeita auth none no template CRUD', () => {
    expect(() => parseAuthStrategies('none', Template.CRUD_SAMPLE)).toThrow(
      /CRUD exige autenticação/,
    );
  });

  it('rejeita estratégia desconhecida', () => {
    expect(() => parseAuthStrategies('saml')).toThrow(/desconhecida/);
  });
});

describe('mergeAuthStrategies', () => {
  it('une estratégias sem duplicar', () => {
    expect(
      mergeAuthStrategies([AuthStrategy.JWT], [AuthStrategy.OAUTH2]),
    ).toEqual([AuthStrategy.JWT, AuthStrategy.OAUTH2]);
    expect(
      mergeAuthStrategies(
        [AuthStrategy.JWT],
        [AuthStrategy.JWT, AuthStrategy.OAUTH2],
      ),
    ).toEqual([AuthStrategy.JWT, AuthStrategy.OAUTH2]);
  });
});

describe('listMissingAuthStrategies', () => {
  it('lista todas quando auth não está instalada', () => {
    expect(listMissingAuthStrategies(false)).toEqual([
      AuthStrategy.JWT,
      AuthStrategy.OAUTH2,
    ]);
  });

  it('lista apenas oauth2 quando jwt já está instalado', () => {
    expect(listMissingAuthStrategies([AuthStrategy.JWT])).toEqual([
      AuthStrategy.OAUTH2,
    ]);
  });

  it('lista apenas jwt quando oauth2 já está instalado', () => {
    expect(listMissingAuthStrategies([AuthStrategy.OAUTH2])).toEqual([
      AuthStrategy.JWT,
    ]);
  });

  it('retorna vazio quando ambas estão instaladas', () => {
    expect(
      listMissingAuthStrategies([AuthStrategy.JWT, AuthStrategy.OAUTH2]),
    ).toEqual([]);
  });
});

describe('resolveAuthStrategiesFromModule', () => {
  it('detecta jwt, oauth2 ou ambos pelo auth.module.ts', () => {
    expect(
      resolveAuthStrategiesFromModule('export class LoginController {}'),
    ).toEqual([AuthStrategy.JWT]);
    expect(
      resolveAuthStrategiesFromModule(
        'const OAuthAuthLinkHandler = class {}',
      ),
    ).toEqual([AuthStrategy.OAUTH2]);
    expect(
      resolveAuthStrategiesFromModule(
        'LoginController\nOAuthAuthLinkHandler',
      ),
    ).toEqual([AuthStrategy.JWT, AuthStrategy.OAUTH2]);
    expect(resolveAuthStrategiesFromModule('export class AuthModule {}')).toEqual(
      [],
    );
  });
});
