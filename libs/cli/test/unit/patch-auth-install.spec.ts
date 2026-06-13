import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  patchAppModuleForAuth,
  patchAuthInstall,
} from '@cli/utils/patch-auth-install.ts';

const crudAppModule = `import { envSchema } from '@/core/env';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PersonModule } from './controllers/person/person.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => envSchema.parse(config),
    }),
    PersonModule,
  ],
})
export class AppModule {}
`;

const defaultAppModule = `import { envSchema } from '@/core/env';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => envSchema.parse(config),
    }),
  ],
})
export class AppModule {}
`;

describe('patchAppModuleForAuth', () => {
  it('registra SecurityModule e AuthModule no template CRUD', () => {
    const patched = patchAppModuleForAuth(crudAppModule);

    expect(patched).toContain('import { AuthModule }');
    expect(patched).toContain('import { SecurityModule }');
    expect(patched.indexOf('SecurityModule')).toBeLessThan(
      patched.indexOf('PersonModule,'),
    );
    expect(patched.indexOf('AuthModule')).toBeLessThan(
      patched.indexOf('PersonModule,'),
    );
  });

  it('registra SecurityModule e AuthModule no template padrão sem PersonModule', () => {
    const patched = patchAppModuleForAuth(defaultAppModule);

    expect(patched).toContain('SecurityModule,');
    expect(patched).toContain('AuthModule,');
    expect(patched).not.toContain('PersonModule');
  });

  it('não duplica módulos quando patch é aplicado novamente', () => {
    const once = patchAppModuleForAuth(defaultAppModule);
    const twice = patchAppModuleForAuth(once);

    expect(twice.match(/import \{ SecurityModule \}/g)?.length).toBe(1);
    expect(twice.match(/^\s+SecurityModule,$/gm)?.length).toBe(1);
  });
});

describe('patch-auth-install module', () => {
  it('exporta patchAuthInstall sem conflito de bindings ESM', async () => {
    const module = await import('@cli/utils/patch-auth-install.ts');

    expect(typeof module.patchAuthInstall).toBe('function');
    expect(typeof module.patchAppModuleForAuth).toBe('function');
  });
});

describe('patchAuthInstall', () => {
  let tempDir = '';
  let previousCwd = process.cwd();

  const slimMain = `import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { defineDocumentation } from './open-api/define-documentation';
import { ErrorsFilter } from './filters/errors.filter';
import { HttpAdapterHost } from '@nestjs/core';
import { ILoggingService } from '@/domain/common/ilogging.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ credentials: true, origin: true, optionsSuccessStatus: 200 });

  await defineDocumentation(app);

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new ErrorsFilter(httpAdapter, app.get(ILoggingService)));

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
`;

  const oauthAuthModule = `import { Module } from '@nestjs/common';
import { OAuthAuthLinkHandler } from '@/application/auth/oauth2/auth-link/auth-link.handler';
import { OAuthExchangeCodeHandler } from '@/application/auth/oauth2/exchange-code/exchange-code.handler';
import { ScalarOAuthTokenHandler } from '@/application/auth/oauth2/scalar-token/scalar-oauth-token.handler';
import { OAuthAuthLinkController } from '../oauth2/auth-link.controller';
import { OAuthExchangeCodeController } from '../oauth2/exchange-code.controller';
import { ScalarOAuthTokenController } from '../oauth2/scalar-token.controller';

@Module({
  controllers: [
    OAuthAuthLinkController,
    OAuthExchangeCodeController,
    ScalarOAuthTokenController,
  ],
  providers: [
    OAuthAuthLinkHandler,
    OAuthExchangeCodeHandler,
    ScalarOAuthTokenHandler,
  ],
})
export class AuthModule {}
`;

  const repositoryModule = `import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/infra/database/database.module';

@Module({
  imports: [DatabaseModule],
  exports: [DatabaseModule],
})
export class RepositoryModule {}
`;

  const dataSourceFactory = `import { DataSource } from 'typeorm';
import { EnvService } from '@/infra/common/env.service';

export const DATA_SOURCE_PROVIDER_TOKEN = 'DATA_SOURCE';

export async function dataSourceFactory(env: EnvService) {
  const dataSource = new DataSource({
    type: 'postgres',
    url: env.get('DATABASE_URL'),
    entities: [],
  });

  await dataSource.initialize();

  return dataSource;
}
`;

  beforeEach(() => {
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'koala-patch-auth-'));
    mkdirSync(path.join(tempDir, 'src/host/controllers/auth'), {
      recursive: true,
    });
    mkdirSync(path.join(tempDir, 'src/infra/repositories'), {
      recursive: true,
    });
    mkdirSync(path.join(tempDir, 'src/infra/database'), { recursive: true });

    writeFileSync(
      path.join(tempDir, 'package.json'),
      `${JSON.stringify({ name: 'patch-auth', packageManager: 'bun' }, null, 2)}\n`,
    );
    writeFileSync(
      path.join(tempDir, 'src/host/app.module.ts'),
      defaultAppModule,
    );
    writeFileSync(path.join(tempDir, 'src/host/main.ts'), slimMain);
    writeFileSync(
      path.join(tempDir, 'src/host/controllers/auth/auth.module.ts'),
      oauthAuthModule,
    );
    writeFileSync(
      path.join(tempDir, 'src/infra/repositories/repository.module.ts'),
      repositoryModule,
    );
    writeFileSync(
      path.join(tempDir, 'src/infra/database/data-source-factory.ts'),
      dataSourceFactory,
    );

    previousCwd = process.cwd();
    process.chdir(tempDir);
  });

  afterEach(() => {
    process.chdir(previousCwd);
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('aplica guards globais, cookie parser e limpa OAuth2 no modo jwt', async () => {
    await patchAuthInstall('.', ['jwt']);

    const appModule = readFileSync(
      path.join(tempDir, 'src/host/app.module.ts'),
      'utf8',
    );
    const main = readFileSync(path.join(tempDir, 'src/host/main.ts'), 'utf8');
    const authModule = readFileSync(
      path.join(tempDir, 'src/host/controllers/auth/auth.module.ts'),
      'utf8',
    );

    expect(appModule).toContain('SecurityModule');
    expect(main).toContain('cookieParser()');
    expect(main).toContain('AuthGuard');
    expect(main).toContain('ProfilesGuard');
    expect(authModule).not.toContain('OAuthAuthLinkHandler');

    const securityModule = readFileSync(
      path.join(tempDir, 'src/host/security/security.module.ts'),
      'utf8',
    );
    expect(securityModule).not.toContain('IOAuth2Service');
    expect(securityModule).not.toContain('OAuthProviderRegistry');

    const iauthService = readFileSync(
      path.join(tempDir, 'src/domain/auth/services/iauth.service.ts'),
      'utf8',
    );
    expect(iauthService).toContain('IJwtTokenService');
    expect(iauthService).not.toContain('IOAuth2Service');

    const repositoryModuleContent = readFileSync(
      path.join(tempDir, 'src/infra/repositories/repository.module.ts'),
      'utf8',
    );
    expect(repositoryModuleContent).toContain('IUserRepository');
  });
});
