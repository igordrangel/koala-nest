import { describe, expect, it } from "bun:test";
import {
  patchInfraModuleForCache,
  SLIM_INFRA_MODULE,
  stripInfraModuleCache,
} from "../../../../cli/utils/patch-infra-module.ts";
import {
  patchMainForAuth,
  patchMainForCronJobs,
  stripMainOptionalFeatures,
} from "../../../../cli/utils/patch-main.ts";

const fullMain = `import { NestFactory } from '@nestjs/core';
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
}

bootstrap();
`;

describe("patch-main", () => {
  it("remove cookie parser e bootstrap do template completo", () => {
    const stripped = stripMainOptionalFeatures(fullMain);

    expect(stripped).not.toContain("cookieParser");
    expect(stripped).not.toContain("bootstrapKoalaJobs");
    expect(stripped).not.toContain("ConfigService");
  });

  it("adiciona cookie parser para autenticação", () => {
    const slim = stripMainOptionalFeatures(fullMain);
    const patched = patchMainForAuth(slim);

    expect(patched).toContain("cookieParser()");
    expect(patched).not.toContain("bootstrapKoalaJobs");
  });

  it("adiciona bootstrap de cron jobs", () => {
    const slim = stripMainOptionalFeatures(fullMain);
    const patched = patchMainForCronJobs(slim);

    expect(patched).toContain("bootstrapKoalaJobs");
    expect(patched).toContain("CRON_JOBS_ENABLED");
  });
});

describe("patch-infra-module", () => {
  it("gera infra module enxuto sem cache", () => {
    expect(stripInfraModuleCache("anything")).toBe(SLIM_INFRA_MODULE);
  });

  it("adiciona providers de cache ao infra slim", () => {
    const patched = patchInfraModuleForCache(SLIM_INFRA_MODULE);

    expect(patched).toContain("CacheServiceProvider");
    expect(patched).toContain("IRedLockService");
  });
});
