import { ErrorsFilter } from '@/host/filters/errors.filter';
import { ILoggingService } from '@/domain/common/ilogging.service';
import { INestApplication } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import cookieParser from 'cookie-parser';

export function setupTestApp(app: INestApplication) {
  app.use(cookieParser());

  app.enableCors({
    credentials: true,
    origin: true,
    optionsSuccessStatus: 200,
  });

  const { httpAdapter } = app.get(HttpAdapterHost);
  const loggingService = app.get(ILoggingService);
  app.useGlobalFilters(new ErrorsFilter(httpAdapter, loggingService));
}

export async function initTestApp(app: INestApplication) {
  await app.init();
  return app;
}
