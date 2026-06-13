import { describe, expect, it } from 'bun:test';
import {
  patchInfraModuleForAuth,
  patchInfraModuleForCache,
  SLIM_INFRA_MODULE,
  stripInfraModuleCache,
} from '@cli/utils/patch-infra-module.ts';
import {
  patchMainForAuth,
  stripMainOptionalFeatures,
} from '@cli/utils/patch-main.ts';

const fullMain = `import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { defineDocumentation } from './open-api/define-documentation';
import { ErrorsFilter } from './filters/errors.filter';
import { HttpAdapterHost } from '@nestjs/core';
import { ILoggingService } from '@/domain/common/ilogging.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    credentials: true,
    origin: true,
    optionsSuccessStatus: 200,
  });

  await defineDocumentation(app);

  const { httpAdapter } = app.get(HttpAdapterHost);
  const loggingService = app.get(ILoggingService);
  app.useGlobalFilters(new ErrorsFilter(httpAdapter, loggingService));

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
`;

describe('patch-main', () => {
  it('remove cookie parser do template completo', () => {
    const stripped = stripMainOptionalFeatures(fullMain);

    expect(stripped).not.toContain('cookieParser');
  });

  it('adiciona cookie parser para autenticação', () => {
    const slim = stripMainOptionalFeatures(fullMain);
    const patched = patchMainForAuth(slim);

    expect(patched).toContain('cookieParser()');
  });
});

describe('patch-infra-module', () => {
  it('gera infra module enxuto sem cache', () => {
    expect(stripInfraModuleCache('anything')).toBe(SLIM_INFRA_MODULE);
    expect(SLIM_INFRA_MODULE).not.toContain('ILoggedUserInfoService');
  });

  it('adiciona providers de cache ao infra slim', () => {
    const patched = patchInfraModuleForCache(SLIM_INFRA_MODULE);

    expect(patched).toMatch(
      /providers:\s*\[[\s\S]*CacheServiceProvider[\s\S]*\]/,
    );
    expect(patched).toContain('{ provide: ICacheService, useExisting: CacheServiceProvider }');
    expect(patched).not.toContain('ILoggedUserInfoService');
  });

  it('adiciona LoggedUserInfo ao infra slim', () => {
    const patched = patchInfraModuleForAuth(SLIM_INFRA_MODULE);

    expect(patched).toMatch(
      /providers:\s*\[[\s\S]*LoggedUserInfoService[\s\S]*\]/,
    );
    expect(patched).toContain('ILoggedUserInfoService');
  });

  it('adiciona cache e mantém LoggedUserInfo quando auth já está instalado', () => {
    const withAuth = patchInfraModuleForAuth(SLIM_INFRA_MODULE);
    const patched = patchInfraModuleForCache(withAuth);

    expect(patched).toMatch(
      /providers:\s*\[[\s\S]*CacheServiceProvider[\s\S]*LoggedUserInfoService[\s\S]*\]/,
    );
  });

  it('adiciona auth e mantém cache quando cache já está instalado', () => {
    const withCache = patchInfraModuleForCache(SLIM_INFRA_MODULE);
    const patched = patchInfraModuleForAuth(withCache);

    expect(patched).toMatch(
      /providers:\s*\[[\s\S]*CacheServiceProvider[\s\S]*LoggedUserInfoService[\s\S]*\]/,
    );
  });
});
