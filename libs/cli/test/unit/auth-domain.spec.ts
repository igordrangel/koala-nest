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

  it('aceita jwt, oauth2, api-key aditiva e combinações deduplicadas', () => {
    expect(parseAuthStrategies('jwt')).toEqual([AuthStrategy.JWT]);
    expect(parseAuthStrategies('oauth2')).toEqual([AuthStrategy.OAUTH2]);
    expect(parseAuthStrategies('jwt,oauth2')).toEqual([
      AuthStrategy.JWT,
      AuthStrategy.OAUTH2,
    ]);
    expect(parseAuthStrategies('jwt,api-key')).toEqual([
      AuthStrategy.JWT,
      AuthStrategy.API_KEY,
    ]);
    expect(parseAuthStrategies('oauth2,jwt,oauth2')).toEqual([
      AuthStrategy.OAUTH2,
      AuthStrategy.JWT,
    ]);
  });

  it('rejeita api-key sozinha', () => {
    expect(() => parseAuthStrategies('api-key')).toThrow(/aditiva/);
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
      AuthStrategy.API_KEY,
    ]);
  });

  it('lista oauth2 e api-key quando jwt já está instalado', () => {
    expect(listMissingAuthStrategies([AuthStrategy.JWT])).toEqual([
      AuthStrategy.OAUTH2,
      AuthStrategy.API_KEY,
    ]);
  });

  it('lista jwt e api-key quando oauth2 já está instalado', () => {
    expect(listMissingAuthStrategies([AuthStrategy.OAUTH2])).toEqual([
      AuthStrategy.JWT,
      AuthStrategy.API_KEY,
    ]);
  });

  it('lista apenas api-key quando jwt e oauth2 estão instalados', () => {
    expect(
      listMissingAuthStrategies([AuthStrategy.JWT, AuthStrategy.OAUTH2]),
    ).toEqual([AuthStrategy.API_KEY]);
  });

  it('retorna vazio quando todas estão instaladas', () => {
    expect(
      listMissingAuthStrategies([
        AuthStrategy.JWT,
        AuthStrategy.OAUTH2,
        AuthStrategy.API_KEY,
      ]),
    ).toEqual([]);
  });
});

describe('resolveAuthStrategiesFromModule', () => {
  it('detecta jwt, oauth2, api-key ou combinações', () => {
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
    expect(
      resolveAuthStrategiesFromModule('LoginController', {
        appModuleSource: 'ApiKeyModule',
      }),
    ).toEqual([AuthStrategy.JWT, AuthStrategy.API_KEY]);
    expect(resolveAuthStrategiesFromModule('export class AuthModule {}')).toEqual(
      [],
    );
  });
});
