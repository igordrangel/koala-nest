import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import {
  buildJobsRegisterBlock,
  patchAppModuleJobs,
} from '@cli/utils/patch-jobs-module.ts';
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const appModuleTemplate = `import { envSchema } from '@/core/env';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => envSchema.parse(config),
    }),
    JobsModule.register({
      eventHandlers: [InactivePersonHandler],
      cronJobs: [CreatePersonJob, DeleteInactiveJob],
    }),
  ],
})
export class AppModule {}
`;

describe('patch-jobs-module', () => {
  let tempDir = '';

  beforeEach(() => {
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'koala-jobs-patch-'));
    writeFileSync(path.join(tempDir, 'package.json'), '{}\n');

    mkdirSync(path.join(tempDir, 'src/host'), { recursive: true });
    writeFileSync(
      path.join(tempDir, 'src/host/app.module.ts'),
      appModuleTemplate,
    );
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('monta bloco vazio para template default', () => {
    expect(buildJobsRegisterBlock({ eventHandlers: [], cronJobs: [] }))
      .toBe(`JobsModule.register({
      eventHandlers: [],
      cronJobs: [],
    })`);
  });

  it('monta bloco com imports para handlers de exemplo', () => {
    expect(
      buildJobsRegisterBlock({
        eventHandlers: ['InactivePersonHandler'],
        cronJobs: ['CreatePersonJob'],
      }),
    ).toBe(`JobsModule.register({
      imports: [PersonModule],
      eventHandlers: [InactivePersonHandler],
      cronJobs: [CreatePersonJob],
    })`);
  });

  it('limpa handlers de exemplo no app.module', () => {
    const previousCwd = process.cwd();

    try {
      process.chdir(tempDir);
      patchAppModuleJobs('', { eventHandlers: [], cronJobs: [] });
    } finally {
      process.chdir(previousCwd);
    }

    const content = readFileSync(
      path.join(tempDir, 'src/host/app.module.ts'),
      'utf8',
    );

    expect(content).toContain('eventHandlers: []');
    expect(content).toContain('cronJobs: []');
    expect(content).not.toContain('InactivePersonHandler');
    expect(content).not.toContain('CreatePersonJob');
  });

  it('mantém PersonModule no AppModule ao remover handlers em projeto CRUD', () => {
    const previousCwd = process.cwd();

    mkdirSync(path.join(tempDir, 'src/host/controllers/person'), {
      recursive: true,
    });
    writeFileSync(
      path.join(tempDir, 'src/host/controllers/person/person.module.ts'),
      'export class PersonModule {}\n',
    );

    try {
      process.chdir(tempDir);
      patchAppModuleJobs('', { eventHandlers: [], cronJobs: [] });
    } finally {
      process.chdir(previousCwd);
    }

    const content = readFileSync(
      path.join(tempDir, 'src/host/app.module.ts'),
      'utf8',
    );

    expect(content).toContain('PersonModule,');
    expect(content).not.toMatch(
      /JobsModule\.register\(\{[\s\S]*imports: \[PersonModule\]/,
    );
  });
});
