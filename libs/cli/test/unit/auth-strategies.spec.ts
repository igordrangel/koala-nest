import { afterEach, describe, expect, it } from 'bun:test';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { AuthStrategy } from '@cli/constants/domain';
import {
  applyAuthModuleStrategies,
  patchAuthInstall,
  patchSecurityModuleForJwt,
  syncDomainAuthServiceForProject,
} from '@cli/utils/patch-auth-install.ts';
import {
  assertAuthStrategyPaths,
  installAuthArtifactsForStrategies,
  pruneAuthArtifactsForStrategies,
} from '@cli/utils/prune-auth-strategies.ts';
import { getSourceCodePath } from '@cli/utils/get-source-code-path.ts';

const fullAuthModule = readFileSync(
  path.join(
    getSourceCodePath(),
    'src/host/controllers/auth/auth.module.ts',
  ),
  'utf8',
);

const fullSecurityModule = readFileSync(
  path.join(getSourceCodePath(), 'src/host/security/security.module.ts'),
  'utf8',
);

describe('applyAuthModuleStrategies', () => {
  it('mantém login e OAuth2 quando ambas estratégias estão ativas', () => {
    const content = applyAuthModuleStrategies(fullAuthModule, [
      AuthStrategy.JWT,
      AuthStrategy.OAUTH2,
    ]);

    expect(content).toContain('LoginController');
    expect(content).toContain('OAuthAuthLinkController');
  });

  it('remove OAuth2 quando apenas JWT está ativo', () => {
    const content = applyAuthModuleStrategies(fullAuthModule, [
      AuthStrategy.JWT,
    ]);

    expect(content).toContain('LoginController');
    expect(content).not.toContain('OAuthAuthLinkController');
    expect(content).not.toContain('OAuthCallbackController');
  });

  it('remove login quando apenas OAuth2 está ativo', () => {
    const content = applyAuthModuleStrategies(fullAuthModule, [
      AuthStrategy.OAUTH2,
    ]);

    expect(content).not.toContain('LoginController');
    expect(content).toContain('OAuthAuthLinkController');
  });
});

describe('patchSecurityModuleForJwt', () => {
  it('remove OAuth2 do SecurityModule no modo JWT', () => {
    const content = patchSecurityModuleForJwt(fullSecurityModule);

    expect(content).toContain('IJwtTokenService');
    expect(content).not.toContain('IOAuth2Service');
    expect(content).not.toContain('OAuthProviderRegistry');
    expect(content).not.toContain('OAuth2AuthService');
  });
});

describe('pruneAuthArtifactsForStrategies', () => {
  let tempDir = '';
  let previousCwd = process.cwd();

  afterEach(() => {
    process.chdir(previousCwd);
    if (tempDir) {
      rmSync(tempDir, { recursive: true, force: true });
      tempDir = '';
    }
  });

  it('remove artefatos OAuth2 no modo JWT', () => {
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'koala-auth-prune-'));
    mkdirSync(path.join(tempDir, 'src/host/controllers/oauth2'), {
      recursive: true,
    });
    mkdirSync(path.join(tempDir, 'src/application/auth/oauth2/auth-link'), {
      recursive: true,
    });
    mkdirSync(path.join(tempDir, 'src/host/controllers/auth'), {
      recursive: true,
    });
    mkdirSync(path.join(tempDir, 'src/application/auth/login'), {
      recursive: true,
    });
    writeFileSync(
      path.join(tempDir, 'src/host/controllers/auth/login.controller.ts'),
      'export class LoginController {}\n',
    );
    writeFileSync(
      path.join(tempDir, 'src/application/auth/login/login.handler.ts'),
      'export class LoginHandler {}\n',
    );
    writeFileSync(
      path.join(tempDir, 'src/host/controllers/oauth2/auth-link.controller.ts'),
      'export class OAuthAuthLinkController {}\n',
    );
    writeFileSync(
      path.join(
        tempDir,
        'src/application/auth/oauth2/auth-link/auth-link.handler.ts',
      ),
      'export class OAuthAuthLinkHandler {}\n',
    );
    mkdirSync(path.join(tempDir, 'src/domain/auth/dtos'), { recursive: true });
    mkdirSync(path.join(tempDir, 'src/infra/auth'), { recursive: true });
    writeFileSync(
      path.join(tempDir, 'src/domain/auth/dtos/oauth-user-info.dto.ts'),
      'export class OAuthUserInfoDto {}\n',
    );
    writeFileSync(
      path.join(tempDir, 'src/infra/auth/oauth2-auth.service.ts'),
      'export class OAuth2AuthService {}\n',
    );
    mkdirSync(path.join(tempDir, 'src/core/auth'), { recursive: true });
    writeFileSync(
      path.join(tempDir, 'src/core/auth/parse-oauth2-provider-env.ts'),
      'export function parseOAuth2ProviderEnv() {}\n',
    );
    writeFileSync(
      path.join(tempDir, 'src/core/auth/oauth-provider.registry.ts'),
      'export class OAuthProviderRegistry {}\n',
    );
    mkdirSync(path.join(tempDir, 'src/domain/auth/services'), {
      recursive: true,
    });
    writeFileSync(
      path.join(tempDir, 'src/domain/auth/services/iauth.service.ts'),
      'export class IOAuth2Service {}\nexport class IJwtTokenService {}\n',
    );

    process.chdir(tempDir);
    pruneAuthArtifactsForStrategies('.', [AuthStrategy.JWT]);
    syncDomainAuthServiceForProject('.', [AuthStrategy.JWT]);
    assertAuthStrategyPaths('.', [AuthStrategy.JWT]);
  });

  it('remove login no modo OAuth2', () => {
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'koala-auth-prune-'));
    mkdirSync(path.join(tempDir, 'src/host/controllers/oauth2'), {
      recursive: true,
    });
    mkdirSync(path.join(tempDir, 'src/host/controllers/auth'), {
      recursive: true,
    });
    mkdirSync(path.join(tempDir, 'src/application/auth/login'), {
      recursive: true,
    });
    mkdirSync(path.join(tempDir, 'src/application/auth/oauth2/auth-link'), {
      recursive: true,
    });
    writeFileSync(
      path.join(tempDir, 'src/host/controllers/auth/login.controller.ts'),
      'export class LoginController {}\n',
    );
    writeFileSync(
      path.join(tempDir, 'src/application/auth/login/login.handler.ts'),
      'export class LoginHandler {}\n',
    );
    writeFileSync(
      path.join(tempDir, 'src/host/controllers/oauth2/auth-link.controller.ts'),
      'export class OAuthAuthLinkController {}\n',
    );
    writeFileSync(
      path.join(
        tempDir,
        'src/application/auth/oauth2/auth-link/auth-link.handler.ts',
      ),
      'export class OAuthAuthLinkHandler {}\n',
    );
    mkdirSync(path.join(tempDir, 'src/domain/auth/dtos'), { recursive: true });
    mkdirSync(path.join(tempDir, 'src/infra/auth'), { recursive: true });
    writeFileSync(
      path.join(tempDir, 'src/domain/auth/dtos/oauth-user-info.dto.ts'),
      'export class OAuthUserInfoDto {}\n',
    );
    writeFileSync(
      path.join(tempDir, 'src/infra/auth/oauth2-auth.service.ts'),
      'export class OAuth2AuthService {}\n',
    );
    mkdirSync(path.join(tempDir, 'src/core/auth'), { recursive: true });
    writeFileSync(
      path.join(tempDir, 'src/core/auth/parse-oauth2-provider-env.ts'),
      'export function parseOAuth2ProviderEnv() {}\n',
    );
    writeFileSync(
      path.join(tempDir, 'src/core/auth/oauth-provider.registry.ts'),
      'export class OAuthProviderRegistry {}\n',
    );
    mkdirSync(path.join(tempDir, 'src/domain/auth/services'), {
      recursive: true,
    });
    writeFileSync(
      path.join(tempDir, 'src/domain/auth/services/iauth.service.ts'),
      'export class IOAuth2Service {}\nexport class IJwtTokenService {}\n',
    );

    process.chdir(tempDir);
    pruneAuthArtifactsForStrategies('.', [AuthStrategy.OAUTH2]);
    assertAuthStrategyPaths('.', [AuthStrategy.OAUTH2]);
  });

  it('não remove artefatos quando jwt e oauth2 estão ativos', () => {
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'koala-auth-prune-both-'));
    mkdirSync(path.join(tempDir, 'src/host/controllers/oauth2'), {
      recursive: true,
    });
    mkdirSync(path.join(tempDir, 'src/host/controllers/auth'), {
      recursive: true,
    });
    mkdirSync(path.join(tempDir, 'src/application/auth/login'), {
      recursive: true,
    });
    mkdirSync(path.join(tempDir, 'src/application/auth/oauth2/auth-link'), {
      recursive: true,
    });
    writeFileSync(
      path.join(tempDir, 'src/host/controllers/auth/login.controller.ts'),
      'export class LoginController {}\n',
    );
    writeFileSync(
      path.join(tempDir, 'src/application/auth/login/login.handler.ts'),
      'export class LoginHandler {}\n',
    );
    writeFileSync(
      path.join(tempDir, 'src/host/controllers/oauth2/auth-link.controller.ts'),
      'export class OAuthAuthLinkController {}\n',
    );
    writeFileSync(
      path.join(
        tempDir,
        'src/application/auth/oauth2/auth-link/auth-link.handler.ts',
      ),
      'export class OAuthAuthLinkHandler {}\n',
    );
    mkdirSync(path.join(tempDir, 'src/domain/auth/dtos'), { recursive: true });
    mkdirSync(path.join(tempDir, 'src/infra/auth'), { recursive: true });
    writeFileSync(
      path.join(tempDir, 'src/domain/auth/dtos/oauth-user-info.dto.ts'),
      'export class OAuthUserInfoDto {}\n',
    );
    writeFileSync(
      path.join(tempDir, 'src/infra/auth/oauth2-auth.service.ts'),
      'export class OAuth2AuthService {}\n',
    );
    mkdirSync(path.join(tempDir, 'src/core/auth'), { recursive: true });
    writeFileSync(
      path.join(tempDir, 'src/core/auth/parse-oauth2-provider-env.ts'),
      'export function parseOAuth2ProviderEnv() {}\n',
    );
    writeFileSync(
      path.join(tempDir, 'src/core/auth/oauth-provider.registry.ts'),
      'export class OAuthProviderRegistry {}\n',
    );
    mkdirSync(path.join(tempDir, 'src/domain/auth/services'), {
      recursive: true,
    });
    writeFileSync(
      path.join(tempDir, 'src/domain/auth/services/iauth.service.ts'),
      'export class IOAuth2Service {}\nexport class IJwtTokenService {}\n',
    );

    process.chdir(tempDir);
    pruneAuthArtifactsForStrategies('.', [
      AuthStrategy.JWT,
      AuthStrategy.OAUTH2,
    ]);
    assertAuthStrategyPaths('.', [AuthStrategy.JWT, AuthStrategy.OAUTH2]);
  });
});

describe('installAuthArtifactsForStrategies', () => {
  let tempDir = '';
  let previousCwd = process.cwd();

  afterEach(() => {
    process.chdir(previousCwd);
    if (tempDir) {
      rmSync(tempDir, { recursive: true, force: true });
      tempDir = '';
    }
  });

  it('instala apenas login no modo JWT', () => {
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'koala-auth-install-jwt-'));
    process.chdir(tempDir);

    installAuthArtifactsForStrategies('.', [AuthStrategy.JWT]);
    assertAuthStrategyPaths('.', [AuthStrategy.JWT]);
    expect(
      existsSync(path.join(tempDir, 'src/host/controllers/oauth2')),
    ).toBe(false);
  });

  it('instala apenas OAuth2 no modo oauth2', () => {
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'koala-auth-install-oauth-'));
    process.chdir(tempDir);

    installAuthArtifactsForStrategies('.', [AuthStrategy.OAUTH2]);
    assertAuthStrategyPaths('.', [AuthStrategy.OAUTH2]);
    expect(
      existsSync(
        path.join(tempDir, 'src/host/controllers/auth/login.controller.ts'),
      ),
    ).toBe(false);
  });
});

describe('patchAuthInstall', () => {
  let tempDir = '';
  let previousCwd = process.cwd();

  afterEach(() => {
    process.chdir(previousCwd);
    if (tempDir) {
      rmSync(tempDir, { recursive: true, force: true });
      tempDir = '';
    }
  });

  it('gera projeto JWT sem pastas OAuth2', async () => {
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'koala-auth-jwt-only-'));
    mkdirSync(path.join(tempDir, 'src/host'), { recursive: true });
    mkdirSync(path.join(tempDir, 'src/infra/repositories'), { recursive: true });
    mkdirSync(path.join(tempDir, 'src/infra/database'), { recursive: true });
    writeFileSync(
      path.join(tempDir, 'package.json'),
      `${JSON.stringify({ name: 'jwt-only', packageManager: 'bun' }, null, 2)}\n`,
    );
    writeFileSync(
      path.join(tempDir, 'src/host/app.module.ts'),
      `import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
@Module({ imports: [ConfigModule.forRoot({})] })
export class AppModule {}`,
    );
    writeFileSync(
      path.join(tempDir, 'src/host/main.ts'),
      `import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();`,
    );
    writeFileSync(
      path.join(tempDir, 'src/infra/repositories/repository.module.ts'),
      `import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/infra/database/database.module';
@Module({ imports: [DatabaseModule], exports: [DatabaseModule] })
export class RepositoryModule {}`,
    );
    writeFileSync(
      path.join(tempDir, 'src/infra/database/data-source-factory.ts'),
      `export async function dataSourceFactory() { return { entities: [] }; }`,
    );

    process.chdir(tempDir);

    await patchAuthInstall('.', [AuthStrategy.JWT]);

    assertAuthStrategyPaths('.', [AuthStrategy.JWT]);
    expect(
      existsSync(path.join(tempDir, 'src/host/controllers/oauth2')),
    ).toBe(false);
    expect(
      readFileSync(
        path.join(tempDir, 'src/domain/auth/services/iauth.service.ts'),
        'utf8',
      ),
    ).not.toContain('IOAuth2Service');
    expect(readFileSync(path.join(tempDir, '.env.example'), 'utf8')).not.toContain(
      'OAUTH2_PROVIDERS',
    );
  });

  it('gera projeto OAuth2 sem login por senha', async () => {
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'koala-auth-oauth-only-'));
    mkdirSync(path.join(tempDir, 'src/host'), { recursive: true });
    mkdirSync(path.join(tempDir, 'src/infra/repositories'), { recursive: true });
    mkdirSync(path.join(tempDir, 'src/infra/database'), { recursive: true });
    writeFileSync(
      path.join(tempDir, 'package.json'),
      `${JSON.stringify({ name: 'oauth-only', packageManager: 'bun' }, null, 2)}\n`,
    );
    writeFileSync(
      path.join(tempDir, 'src/host/app.module.ts'),
      `import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
@Module({ imports: [ConfigModule.forRoot({})] })
export class AppModule {}`,
    );
    writeFileSync(
      path.join(tempDir, 'src/host/main.ts'),
      `import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();`,
    );
    writeFileSync(
      path.join(tempDir, 'src/infra/repositories/repository.module.ts'),
      `import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/infra/database/database.module';
@Module({ imports: [DatabaseModule], exports: [DatabaseModule] })
export class RepositoryModule {}`,
    );
    writeFileSync(
      path.join(tempDir, 'src/infra/database/data-source-factory.ts'),
      `export async function dataSourceFactory() { return { entities: [] }; }`,
    );

    process.chdir(tempDir);

    await patchAuthInstall('.', [AuthStrategy.OAUTH2]);

    assertAuthStrategyPaths('.', [AuthStrategy.OAUTH2]);
    expect(
      existsSync(
        path.join(tempDir, 'src/host/controllers/auth/login.controller.ts'),
      ),
    ).toBe(false);
    expect(readFileSync(path.join(tempDir, '.env.example'), 'utf8')).toContain(
      'OAUTH2_PROVIDERS',
    );
  });

  it('gera projeto com jwt e oauth2 sem podar nenhum fluxo', async () => {
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'koala-auth-both-'));
    mkdirSync(path.join(tempDir, 'src/host'), { recursive: true });
    mkdirSync(path.join(tempDir, 'src/infra/repositories'), { recursive: true });
    mkdirSync(path.join(tempDir, 'src/infra/database'), { recursive: true });
    writeFileSync(
      path.join(tempDir, 'package.json'),
      `${JSON.stringify({ name: 'auth-both', packageManager: 'bun' }, null, 2)}\n`,
    );
    writeFileSync(
      path.join(tempDir, 'src/host/app.module.ts'),
      `import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
@Module({ imports: [ConfigModule.forRoot({})] })
export class AppModule {}`,
    );
    writeFileSync(
      path.join(tempDir, 'src/host/main.ts'),
      `import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();`,
    );
    writeFileSync(
      path.join(tempDir, 'src/infra/repositories/repository.module.ts'),
      `import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/infra/database/database.module';
@Module({ imports: [DatabaseModule], exports: [DatabaseModule] })
export class RepositoryModule {}`,
    );
    writeFileSync(
      path.join(tempDir, 'src/infra/database/data-source-factory.ts'),
      `export async function dataSourceFactory() { return { entities: [] }; }`,
    );

    process.chdir(tempDir);

    await patchAuthInstall('.', [AuthStrategy.JWT, AuthStrategy.OAUTH2]);

    assertAuthStrategyPaths('.', [AuthStrategy.JWT, AuthStrategy.OAUTH2]);
    expect(readFileSync(path.join(tempDir, '.env.example'), 'utf8')).toContain(
      'OAUTH2_PROVIDERS',
    );
  });
});
