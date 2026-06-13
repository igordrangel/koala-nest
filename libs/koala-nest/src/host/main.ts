import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { bootstrapKoalaJobs } from './bootstrap/koala-bootstrap';
import { defineDocumentation } from './open-api/define-documentation';
import { ErrorsFilter } from './filters/errors.filter';
import { HttpAdapterHost } from '@nestjs/core';
import { ILoggingService } from '@/domain/common/ilogging.service';
import { KoalaGlobalVars } from '@/core/koala-global-vars';
import { Env } from '@/core/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  KoalaGlobalVars.appName = 'koala-nest';
  KoalaGlobalVars.internalUserName = 'integration.bot';

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

  const config = app.get(ConfigService<Env, true>);

  await bootstrapKoalaJobs(app, {
    cronJobsEnabled: config.get('CRON_JOBS_ENABLED', { infer: true }),
    bootstrapDelayMs: config.get('BOOTSTRAP_DELAY_MS', { infer: true }),
  });

  await app.listen(process.env.PORT || 3000);

  console.log(`Server is running on port ${process.env.PORT || 3000}`);
  console.log(
    `Documentation is available at http://localhost:${process.env.PORT || 3000}/doc`,
  );
}

bootstrap();
