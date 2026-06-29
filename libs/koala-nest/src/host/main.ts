import 'dotenv/config';

import { applyHttpMiddleware } from '@/host/bootstrap/apply-http-middleware';
import { resolveApiHost } from '@/core/utils/resolve-api-host';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { defineDocumentation } from './open-api/define-documentation';
import { ErrorsFilter } from './filters/errors.filter';
import { HttpAdapterHost } from '@nestjs/core';
import { AuthGuard } from './security/guards/auth.guard';
import { ProfilesGuard } from './security/guards/profiles.guard';
import { ILoggingService } from '@/domain/common/ilogging.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  applyHttpMiddleware(app);

  await defineDocumentation(app);

  const { httpAdapter } = app.get(HttpAdapterHost);
  const loggingService = app.get(ILoggingService);
  app.useGlobalFilters(new ErrorsFilter(httpAdapter, loggingService));

  app.useGlobalGuards(
    await app.resolve(AuthGuard),
    await app.resolve(ProfilesGuard),
  );

  const port = Number(process.env.PORT) || 3000;
  const bindHost = process.env.HOST ?? '0.0.0.0';
  const publicHost = resolveApiHost(process.env.API_HOST, port);

  await app.listen(port, bindHost);

  console.log(`Server is running on ${publicHost}`);
  console.log(`Documentation is available at ${publicHost}/doc`);
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
