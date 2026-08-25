import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { resolveProjectPath } from './resolve-project-path';

const WORKER_MAIN = `import 'dotenv/config';
import '@koalarx/utils/prototypes';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const shutdown = async () => {
    await app.close();
  };

  process.once('SIGINT', () => {
    void shutdown();
  });
  process.once('SIGTERM', () => {
    void shutdown();
  });
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
`;

const WORKER_CREATE_E2E = `import { AppTestModule } from '@/test/app-test.module';
import { INestApplicationContext } from '@nestjs/common';
import { Test } from '@nestjs/testing';

export async function createE2ETestApp(): Promise<INestApplicationContext> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppTestModule],
  }).compile();

  return moduleRef.createNestApplicationContext();
}
`;

const WORKER_APP_E2E = `/// <reference types="bun-types/test-globals" />

import { createE2ETestApp } from '@/test/create-e2e-test-app';
import type { INestApplicationContext } from '@nestjs/common';

/**
 * Bootstrap mínimo de E2E para Worker (ApplicationContext — sem HTTP).
 */
describe('App (E2E)', () => {
  let app: INestApplicationContext;

  beforeAll(async () => {
    app = await createE2ETestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should bootstrap the application context', () => {
    expect(app).toBeDefined();
  });
});
`;

/** Paths HTTP/OpenAPI removidos no perfil Worker. */
export const WORKER_HTTP_PATHS_TO_REMOVE = [
  'src/host/bootstrap',
  'src/host/open-api',
  'src/host/controllers/common',
  'src/host/controllers/health-check',
  'src/host/controllers/person',
  'src/host/controllers/auth',
  'src/host/controllers/oauth2',
  'src/host/controllers/api-key',
  'src/core/http',
  'src/core/utils/resolve-cors-origins.ts',
  'src/core/utils/resolve-api-host.ts',
  'src/test/core/http',
  'src/test/core/resolve-cors-origins.spec.ts',
  'src/test/core/resolve-api-host.spec.ts',
  'src/test/utils/configure-test-app.ts',
] as const;

/**
 * Ajusta o scaffold para perfil Worker: ApplicationContext, sem superfície HTTP.
 * Chamar após install CORE + removeSampleParts / cleanDefaultTemplateWithoutAuth.
 */
export function applyWorkerProfile(projectName: string): void {
  const projectRoot = resolveProjectPath(projectName);

  for (const relativePath of WORKER_HTTP_PATHS_TO_REMOVE) {
    rmSync(path.join(projectRoot, relativePath), {
      recursive: true,
      force: true,
    });
  }

  writeFileSync(path.join(projectRoot, 'src/host/main.ts'), WORKER_MAIN);

  mkdirSync(path.join(projectRoot, 'src/test/host/controllers/app'), {
    recursive: true,
  });
  writeFileSync(
    path.join(projectRoot, 'src/test/create-e2e-test-app.ts'),
    WORKER_CREATE_E2E,
  );
  writeFileSync(
    path.join(projectRoot, 'src/test/host/controllers/app/app.e2e.spec.ts'),
    WORKER_APP_E2E,
  );
}
