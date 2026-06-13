import { afterEach, describe, expect, it } from 'bun:test';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { AuthStrategy } from '@cli/constants/domain';
import {
  assertAuthStrategyProject,
  listAuthStrategyViolations,
} from '@cli/utils/auth-strategy-validation.ts';

describe('auth-strategy-validation', () => {
  let tempDir = '';

  afterEach(() => {
    if (tempDir) {
      rmSync(tempDir, { recursive: true, force: true });
      tempDir = '';
    }
  });

  it('checklist none aceita projeto sem auth', () => {
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'koala-auth-none-'));
    mkdirSync(path.join(tempDir, 'src/core/constants'), { recursive: true });
    mkdirSync(path.join(tempDir, 'src/host/open-api'), { recursive: true });

    writeFileSync(
      path.join(tempDir, 'src/core/env.ts'),
      `export const envSchema = { parse: () => ({}) };`,
    );
    writeFileSync(path.join(tempDir, '.env.example'), 'PORT=3000\n');
    writeFileSync(
      path.join(tempDir, 'src/host/app.module.ts'),
      `import { InfraModule } from '@/infra/infra.module';
export class AppModule {}`,
    );
    writeFileSync(
      path.join(tempDir, 'src/host/open-api/define-documentation.ts'),
      `export async function defineDocumentation() { return 'apiReference'; }`,
    );
    writeFileSync(
      path.join(tempDir, 'src/core/constants/cache.constants.ts'),
      `export const CacheKeyPrefix = { RED_LOCK: 'x' };`,
    );

    expect(listAuthStrategyViolations(tempDir, false)).toEqual([]);
    expect(() => assertAuthStrategyProject(tempDir, false)).not.toThrow();
  });

  it('checklist jwt rejeita resquícios oauth2', () => {
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'koala-auth-jwt-dirty-'));
    mkdirSync(path.join(tempDir, 'src/core/auth'), { recursive: true });
    mkdirSync(path.join(tempDir, 'src/core/constants'), { recursive: true });
    mkdirSync(path.join(tempDir, 'src/host/open-api'), { recursive: true });
    mkdirSync(path.join(tempDir, 'src/host/controllers/auth'), { recursive: true });
    mkdirSync(path.join(tempDir, 'src/host/security'), { recursive: true });
    mkdirSync(path.join(tempDir, 'src/domain/auth/services'), { recursive: true });

    writeFileSync(
      path.join(tempDir, 'src/core/auth/parse-oauth2-provider-env.ts'),
      'export function parseOAuth2ProviderEnv() {}',
    );
    writeFileSync(path.join(tempDir, '.env.example'), 'JWT_PRIVATE_KEY=\n');
    writeFileSync(
      path.join(tempDir, 'src/core/env.ts'),
      'export const envSchema = { parse: () => ({ JWT_PRIVATE_KEY: "" }) };',
    );
    writeFileSync(
      path.join(tempDir, 'src/host/controllers/auth/auth.module.ts'),
      'export class AuthModule {}\nconst LoginController = 1;',
    );
    writeFileSync(
      path.join(tempDir, 'src/host/security/security.module.ts'),
      'export class SecurityModule {}\nconst IJwtTokenService = 1;',
    );
    writeFileSync(
      path.join(tempDir, 'src/domain/auth/services/iauth.service.ts'),
      'export class IJwtTokenService {}',
    );
    writeFileSync(
      path.join(tempDir, 'src/host/app.module.ts'),
      'export class AppModule {}\nSecurityModule\nAuthModule',
    );
    writeFileSync(
      path.join(tempDir, 'src/host/open-api/define-documentation.ts'),
      "export async function defineDocumentation() { return 'JWT isProviderRegistered'; }",
    );
    writeFileSync(
      path.join(tempDir, 'src/core/constants/cache.constants.ts'),
      'export const CacheKeyPrefix = { RED_LOCK: "x" };',
    );

    expect(() => assertAuthStrategyProject(tempDir, [AuthStrategy.JWT])).toThrow(
      /Checklist auth "jwt" falhou/,
    );
  });

  it('checklist oauth2 rejeita login por senha', () => {
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'koala-auth-oauth-dirty-'));
    mkdirSync(path.join(tempDir, 'src/application/auth/login'), { recursive: true });
    mkdirSync(path.join(tempDir, 'src/core/constants'), { recursive: true });
    mkdirSync(path.join(tempDir, 'src/core'), { recursive: true });
    mkdirSync(path.join(tempDir, 'src/host/controllers/auth'), { recursive: true });
    mkdirSync(path.join(tempDir, 'src/host/security'), { recursive: true });
    mkdirSync(path.join(tempDir, 'src/domain/auth/services'), { recursive: true });
    mkdirSync(path.join(tempDir, 'src/host/open-api'), { recursive: true });

    writeFileSync(
      path.join(tempDir, 'src/host/controllers/auth/login.controller.ts'),
      'export class LoginController {}',
    );
    writeFileSync(
      path.join(tempDir, 'src/host/controllers/auth/auth.module.ts'),
      'export class AuthModule {}\nOAuthAuthLinkController\nLoginController',
    );
    writeFileSync(
      path.join(tempDir, 'src/host/security/security.module.ts'),
      'IJwtTokenService\nIOAuth2Service\nOAuthProviderRegistry',
    );
    writeFileSync(
      path.join(tempDir, 'src/domain/auth/services/iauth.service.ts'),
      'IJwtTokenService\nIOAuth2Service',
    );
    writeFileSync(
      path.join(tempDir, 'src/host/app.module.ts'),
      'SecurityModule\nAuthModule',
    );
    writeFileSync(
      path.join(tempDir, '.env.example'),
      'JWT_PRIVATE_KEY=\nOAUTH2_PROVIDERS=\n',
    );
    writeFileSync(
      path.join(tempDir, 'src/core/env.ts'),
      'OAUTH2_PROVIDERS\nparse-oauth2-provider-env',
    );
    writeFileSync(
      path.join(tempDir, 'src/host/open-api/define-documentation.ts'),
      'buildDocAuthorizations\nIOAuth2Service',
    );
    writeFileSync(
      path.join(tempDir, 'src/core/constants/cache.constants.ts'),
      'OAUTH2_STATE',
    );

    expect(() =>
      assertAuthStrategyProject(tempDir, [AuthStrategy.OAUTH2]),
    ).toThrow(/Checklist auth "oauth2" falhou/);
  });
});
