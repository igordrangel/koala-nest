import { applyHttpMiddleware } from '@/host/bootstrap/apply-http-middleware';
import { ErrorsFilter } from '@/host/filters/errors.filter';
import { ILoggingService } from '@/domain/common/ilogging.service';
import { INestApplication } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

export function setupTestApp(app: INestApplication) {
  applyHttpMiddleware(app);

  const { httpAdapter } = app.get(HttpAdapterHost);
  const loggingService = app.get(ILoggingService);
  app.useGlobalFilters(new ErrorsFilter(httpAdapter, loggingService));
}

export async function initTestApp(app: INestApplication) {
  await app.init();
  return app;
}
