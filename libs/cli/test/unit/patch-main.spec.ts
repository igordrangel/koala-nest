import { describe, expect, it } from 'bun:test';
import { patchMainForAuth } from '@cli/utils/patch-main';

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

describe('patchMainForAuth', () => {
  it('adiciona cookie parser quando main ainda não usa applyHttpMiddleware', () => {
    const patched = patchMainForAuth(fullMain);

    expect(patched).toContain('cookieParser()');
  });

  it('não altera main que já usa applyHttpMiddleware', () => {
    const withMiddleware =
      "import { applyHttpMiddleware } from '@/host/bootstrap/apply-http-middleware';\napplyHttpMiddleware(app);";

    expect(patchMainForAuth(withMiddleware)).toBe(withMiddleware);
  });
});
