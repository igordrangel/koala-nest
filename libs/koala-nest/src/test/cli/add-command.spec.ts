import { describe, expect, it } from 'bun:test';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  dedupeAddArgs,
  detectProjectState,
  parseAddArgs,
} from '@cli/utils/detect-project-state.ts';

function createMockProject(options: {
  auth?: 'jwt' | 'oauth2';
  cache?: 'memory' | 'redis';
  health?: boolean;
  cron?: boolean;
  events?: boolean;
  crud?: boolean;
}) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'koala-add-'));
  const write = (relativePath: string, content: string) => {
    const filePath = path.join(root, relativePath);
    mkdirSync(path.dirname(filePath), { recursive: true });
    writeFileSync(filePath, content);
  };

  writeFileSync(
    path.join(root, 'package.json'),
    `${JSON.stringify({ name: 'mock-api', packageManager: 'bun' }, null, 2)}\n`,
  );

  write('src/core/env.ts', 'export const envSchema = {};\n');

  const appImports = [
    options.crud
      ? "import { PersonModule } from './controllers/person/person.module';"
      : '',
    options.health
      ? "import { HealthCheckModule } from './controllers/health-check/health-check.module';"
      : '',
    options.auth
      ? "import { SecurityModule } from './security/security.module';"
      : '',
  ]
    .filter(Boolean)
    .join('\n');

  const moduleEntries = [
    'ConfigModule.forRoot({}),',
    options.auth ? 'SecurityModule,' : '',
    options.health ? 'HealthCheckModule,' : '',
    options.crud ? 'PersonModule,' : '',
  ]
    .filter(Boolean)
    .join('\n    ');

  write(
    'src/host/app.module.ts',
    `import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
${appImports}

@Module({
  imports: [
    ${moduleEntries}
  ],
})
export class AppModule {}
`,
  );

  if (options.auth) {
    write(
      'src/host/controllers/auth/auth.module.ts',
      options.auth === 'oauth2'
        ? 'export class AuthModule {}\nconst OAuthAuthLinkHandler = 1;\n'
        : 'export class AuthModule {}\n',
    );
  }

  if (options.cache) {
    write(
      'src/infra/infra.module.ts',
      'export class InfraModule {}\nconst CacheServiceProvider = 1;\n',
    );

    if (options.cache === 'redis') {
      write(
        'src/infra/common/redis-cache.service.ts',
        'export class RedisCacheService {}\n',
      );
    }
  } else {
    write('src/infra/infra.module.ts', 'export class InfraModule {}\n');
  }

  if (options.crud) {
    write(
      'src/host/controllers/person/person.module.ts',
      'export class PersonModule {}\n',
    );
  }

  if (options.cron) {
    write(
      'src/core/utils/cron-expression-to-boolean.ts',
      'export function cron() {}\n',
    );
  }

  if (options.events) {
    write(
      'src/core/background-services/event-service/event-handler.base.ts',
      'export class EventHandlerBase {}\n',
    );
  }

  return root;
}

describe('parseAddArgs', () => {
  it('aceita aliases de funcionalidades', () => {
    expect(parseAddArgs(['cache', 'health', 'cron', 'events'])).toEqual([
      { kind: 'feature', feature: 'cache' },
      { kind: 'feature', feature: 'health-check' },
      { kind: 'feature', feature: 'internal-cron-jobs' },
      { kind: 'feature', feature: 'internal-event-jobs' },
    ]);
  });

  it('aceita auth com estratégia', () => {
    expect(parseAddArgs(['auth', 'oauth2', 'cache'])).toEqual([
      { kind: 'auth', strategy: 'oauth2' },
      { kind: 'feature', feature: 'cache' },
    ]);
  });

  it('rejeita auth sem estratégia', () => {
    expect(() => parseAddArgs(['auth'])).toThrow(/auth jwt/);
  });
});

describe('dedupeAddArgs', () => {
  it('remove duplicatas', () => {
    expect(
      dedupeAddArgs([
        { kind: 'feature', feature: 'cache' },
        { kind: 'feature', feature: 'cache' },
        { kind: 'auth', strategy: 'jwt' },
        { kind: 'auth', strategy: 'oauth2' },
      ]),
    ).toEqual([
      { kind: 'feature', feature: 'cache' },
      { kind: 'auth', strategy: 'jwt' },
    ]);
  });
});

describe('detectProjectState', () => {
  it('detecta template CRUD e cache redis', () => {
    const root = createMockProject({
      crud: true,
      cache: 'redis',
      health: true,
      cron: true,
      events: true,
      auth: 'oauth2',
    });

    const previousCwd = process.cwd();
    process.chdir(root);

    try {
      expect(detectProjectState('.')).toEqual({
        template: 'crudSample',
        auth: 'oauth2',
        cache: 'redis',
        health: true,
        cronJobs: true,
        eventJobs: true,
      });
    } finally {
      process.chdir(previousCwd);
      rmSync(root, { recursive: true, force: true });
    }
  });
});
