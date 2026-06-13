import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const installCalls: unknown[][] = [];

const installModuleExports = await import('@cli/utils/install-module.ts');

mock.module('@cli/utils/install-module.ts', () => ({
  ...installModuleExports,
  installModule: async (...args: unknown[]) => {
    installCalls.push(args);
  },
}));

mock.module('@cli/utils/format-code.ts', () => ({
  formatCode: async () => {},
}));

const { applyOptionalFeatures } =
  await import('@cli/utils/apply-optional-features.ts');
const { resolveNewProjectOptions, Modules } = installModuleExports;

describe('applyOptionalFeatures', () => {
  let tempDir = '';
  let previousCwd = process.cwd();

  beforeEach(() => {
    installCalls.length = 0;
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'koala-apply-features-'));

    writeFileSync(
      path.join(tempDir, 'package.json'),
      `${JSON.stringify({ name: 'apply-test', packageManager: 'bun' }, null, 2)}\n`,
    );

    mkdirSync(path.join(tempDir, 'src/host'), { recursive: true });
    writeFileSync(
      path.join(tempDir, 'src/host/app.module.ts'),
      `import { Module } from '@nestjs/common';
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [
    JobsModule.register({
      eventHandlers: [],
      cronJobs: [],
    }),
  ],
})
export class AppModule {}
`,
    );

    mkdirSync(path.join(tempDir, 'src/host/controllers/person'), {
      recursive: true,
    });
    writeFileSync(
      path.join(tempDir, 'src/host/controllers/person/person.module.ts'),
      'export class PersonModule {}\n',
    );
    writeFileSync(
      path.join(
        tempDir,
        'src/host/controllers/person/delete-person.controller.ts',
      ),
      'export class DeletePersonController {}\n',
    );

    previousCwd = process.cwd();
    process.chdir(tempDir);
  });

  afterEach(() => {
    process.chdir(previousCwd);
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('instala cache, auth, cron e events no template CRUD bundled', async () => {
    const { auth, features } = resolveNewProjectOptions(
      'crudSample',
      ['jwt'],
      [],
    );

    await applyOptionalFeatures({
      template: 'crudSample',
      auth,
      features,
    });

    expect(installCalls.map((call) => call[0])).toEqual([
      Modules.CACHE,
      Modules.AUTH,
      Modules.INTERNAL_CRON_JOBS,
      Modules.INTERNAL_EVENT_JOBS,
    ]);
    expect(installCalls[0]?.[3]).toEqual({ withRedis: true });
    expect(installCalls[1]?.[3]).toEqual({ authStrategies: ['jwt'] });
  });

  it('instala auth oauth2 no template default', async () => {
    await applyOptionalFeatures({
      template: 'default',
      auth: ['oauth2'],
      features: [],
    });

    expect(installCalls.map((call) => call[0])).toEqual([
      Modules.CACHE,
      Modules.AUTH,
    ]);
    expect(installCalls[1]?.[3]).toEqual({ authStrategies: ['oauth2'] });
  });

  it('instala auth jwt e oauth2 no template default', async () => {
    await applyOptionalFeatures({
      template: 'default',
      auth: ['jwt', 'oauth2'],
      features: [],
    });

    expect(installCalls.map((call) => call[0])).toEqual([
      Modules.CACHE,
      Modules.AUTH,
    ]);
    expect(installCalls[1]?.[3]).toEqual({
      authStrategies: ['jwt', 'oauth2'],
    });
  });

  it('não instala auth quando template padrão sem autenticação', async () => {
    await applyOptionalFeatures({
      template: 'default',
      auth: [],
      features: ['health-check'],
    });

    expect(installCalls.map((call) => call[0])).toEqual([Modules.HEALTH]);
    expect(installCalls[0]?.[3]).toEqual({ withRedisIndicator: false });
  });
});
