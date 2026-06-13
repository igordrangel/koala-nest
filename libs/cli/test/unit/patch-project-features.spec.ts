import { describe, expect, it } from 'bun:test';
import {
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
  });

  it('adiciona providers de cache ao infra slim', () => {
    const patched = patchInfraModuleForCache(SLIM_INFRA_MODULE);

    expect(patched).toContain('CacheServiceProvider');
    expect(patched).toContain('IRedLockService');
  });
});
