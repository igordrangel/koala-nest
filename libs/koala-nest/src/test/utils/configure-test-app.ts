import { ErrorsFilter } from '@/host/filters/errors.filter';
import { INestApplication } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

export function setupTestApp(app: INestApplication) {
  app.enableCors({
    credentials: true,
    origin: true,
    optionsSuccessStatus: 200,
  });

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new ErrorsFilter(httpAdapter));
}

export async function initTestApp(app: INestApplication) {
  await app.init();
  return app;
}
