import {
  cpSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync, type SpawnSyncReturns } from 'node:child_process';
import { expect } from 'bun:test';
import {
  detectProjectState,
  type ProjectState,
} from '@cli/utils/detect-project-state.ts';

export const repoRoot = path.resolve(import.meta.dir, '../../../../..');
export const cliEntry = path.join(repoRoot, 'dist/cli/index.js');
export const cliBuildScript = path.join(repoRoot, 'scripts/build-cli.mjs');
export const koalaNestBuildScript = path.join(
  repoRoot,
  'scripts/build-koala-nest.mjs',
);
export const koalaNestTemplate = path.join(repoRoot, 'dist/koala-nest');
export const nestScaffoldCacheDir = path.join(
  os.tmpdir(),
  'koala-nest-empty-scaffold-bun-v1',
);

let cliBuilt = false;
let nestScaffoldReady = false;
let defaultProjectFixture: { workspace: string; projectDir: string } | null =
  null;

export function ensureCliBuilt() {
  if (cliBuilt && existsSync(cliEntry) && existsSync(koalaNestTemplate)) {
    return;
  }

  if (!existsSync(cliEntry)) {
    const cliResult = spawnSync('bun', [cliBuildScript], {
      cwd: repoRoot,
      encoding: 'utf8',
    });

    expect(cliResult.status).toBe(0);
  }

  if (!existsSync(koalaNestTemplate)) {
    const templateResult = spawnSync('bun', [koalaNestBuildScript], {
      cwd: repoRoot,
      encoding: 'utf8',
    });

    expect(templateResult.status).toBe(0);
  }

  cliBuilt = true;
}

export async function ensureNestScaffoldCache() {
  if (
    nestScaffoldReady &&
    existsSync(path.join(nestScaffoldCacheDir, 'node_modules'))
  ) {
    return;
  }

  if (existsSync(path.join(nestScaffoldCacheDir, 'node_modules'))) {
    nestScaffoldReady = true;
    return;
  }

  const workspace = mkdtempSync(
    path.join(os.tmpdir(), 'koala-scaffold-build-'),
  );
  const previousCwd = process.cwd();

  try {
    process.chdir(workspace);
    process.env.KOALA_NEST_SCAFFOLD_CACHE_BUILD = nestScaffoldCacheDir;

    const { createEmptyNestProject } =
      await import('@cli/commands/new/create-empty-nest-project.ts');

    await createEmptyNestProject('_scaffold', 'bun');
    nestScaffoldReady = true;
  } finally {
    delete process.env.KOALA_NEST_SCAFFOLD_CACHE_BUILD;
    process.chdir(previousCwd);
    rmSync(workspace, { recursive: true, force: true });
  }
}

function cliEnv() {
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    CI: '1',
  };

  if (existsSync(path.join(nestScaffoldCacheDir, 'node_modules'))) {
    env.KOALA_NEST_SCAFFOLD_CACHE = nestScaffoldCacheDir;
  }

  return env;
}

export function runCli(args: string[], cwd: string): SpawnSyncReturns<string> {
  return spawnSync('node', [cliEntry, ...args], {
    cwd,
    encoding: 'utf8',
    env: cliEnv(),
  });
}

export function createDefaultProjectFixture() {
  if (defaultProjectFixture) {
    return defaultProjectFixture;
  }

  const workspace = mkdtempSync(path.join(os.tmpdir(), 'koala-cli-fixture-'));
  const result = runCli(
    [
      'new',
      'fixture',
      '--template',
      'default',
      '--pm',
      'bun',
      '--auth',
      'none',
    ],
    workspace,
  );

  expectCliSuccess(result);

  const projectDir = path.join(workspace, 'fixture');
  assertDefaultProjectWithoutAuth(projectDir);

  defaultProjectFixture = { workspace, projectDir };
  return defaultProjectFixture;
}

export function cloneDefaultProject(projectName: string) {
  if (!defaultProjectFixture) {
    throw new Error('Fixture default não inicializado.');
  }

  const fixture = defaultProjectFixture;
  const workspace = mkdtempSync(path.join(os.tmpdir(), 'koala-cli-e2e-add-'));
  const projectDir = path.join(workspace, projectName);

  cpSync(fixture.projectDir, projectDir, { recursive: true });

  const packageJsonPath = path.join(projectDir, 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
    name: string;
  };

  packageJson.name = projectName;
  writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);

  return { workspace, projectDir };
}

export function cleanupWorkspace(workspace: string) {
  if (workspace && existsSync(workspace)) {
    rmSync(workspace, { recursive: true, force: true });
  }
}

export function readProjectFile(projectDir: string, relativePath: string) {
  return readFileSync(path.join(projectDir, relativePath), 'utf8');
}

export function projectPath(projectDir: string, relativePath: string) {
  return path.join(projectDir, relativePath);
}

export function expectCliSuccess(result: SpawnSyncReturns<string>) {
  expect(result.status).toBe(0);
  if (result.status !== 0) {
    console.error(result.stderr || result.stdout);
  }
}

export function expectProjectBuilds(projectDir: string) {
  const build = spawnSync('bun', ['run', 'build'], {
    cwd: projectDir,
    encoding: 'utf8',
  });

  if (build.status !== 0) {
    console.error(build.stderr || build.stdout);
  }

  expect(build.status).toBe(0);
}

export function withProjectCwd<T>(projectDir: string, fn: () => T): T {
  const previousCwd = process.cwd();

  try {
    process.chdir(projectDir);
    return fn();
  } finally {
    process.chdir(previousCwd);
  }
}

export function expectProjectState(
  projectDir: string,
  expected: Partial<ProjectState>,
) {
  withProjectCwd(projectDir, () => {
    expect(detectProjectState('.')).toMatchObject(expected);
  });
}

export function expectPathsExist(projectDir: string, paths: string[]) {
  for (const relativePath of paths) {
    expect(existsSync(projectPath(projectDir, relativePath))).toBe(true);
  }
}

export function expectPathsMissing(projectDir: string, paths: string[]) {
  for (const relativePath of paths) {
    expect(existsSync(projectPath(projectDir, relativePath))).toBe(false);
  }
}

export function expectPackageDependencies(
  projectDir: string,
  dependencies: string[],
) {
  const packageJson = JSON.parse(
    readProjectFile(projectDir, 'package.json'),
  ) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };

  const installed = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  for (const dependency of dependencies) {
    expect(installed[dependency]).toBeDefined();
  }
}

export function expectNestEntryHostMain(projectDir: string) {
  const nestCli = JSON.parse(readProjectFile(projectDir, 'nest-cli.json')) as {
    entryFile: string;
  };
  const packageJson = JSON.parse(
    readProjectFile(projectDir, 'package.json'),
  ) as {
    scripts: Record<string, string>;
  };

  expect(nestCli.entryFile).toBe('host/main');
  expect(packageJson.scripts['start:prod']).toBe('node dist/host/main');
}

export function assertDefaultProjectCore(projectDir: string) {
  expectPathsExist(projectDir, [
    'src/core/env.ts',
    'src/host/main.ts',
    'src/host/app.module.ts',
    'src/infra/infra.module.ts',
    'src/host/open-api/define-documentation.ts',
    'bunfig.toml',
  ]);

  expectPathsMissing(projectDir, [
    'src/host/controllers/person/person.module.ts',
    'src/infra/repositories/person.repository.ts',
  ]);

  expectNestEntryHostMain(projectDir);
  expectPackageDependencies(projectDir, [
    '@koalarx/utils',
    'zod',
    'typeorm',
    '@scalar/nestjs-api-reference',
  ]);

  const appModule = readProjectFile(projectDir, 'src/host/app.module.ts');
  expect(appModule).not.toContain('PersonModule');

  const repositoryModule = readProjectFile(
    projectDir,
    'src/infra/repositories/repository.module.ts',
  );
  expect(repositoryModule).not.toContain('PersonRepository');
  expect(repositoryModule).not.toContain('IPersonRepository');

  const dataSourceFactory = readProjectFile(
    projectDir,
    'src/infra/database/data-source-factory.ts',
  );
  expect(dataSourceFactory).toContain('entities: []');
}

export function assertDefaultProjectWithoutAuth(
  projectDir: string,
  options: { health?: boolean } = {},
) {
  assertDefaultProjectCore(projectDir);

  expectPathsMissing(projectDir, [
    'src/host/decorators/scalar-token-endpoint.decorator.ts',
    'src/host/decorators/logged-user.decorator.ts',
    'src/host/decorators/restriction-by-profile.decorator.ts',
    'src/application/auth',
    'src/infra/auth',
  ]);

  const scalarAuth = readProjectFile(
    projectDir,
    'src/host/open-api/scalar-authentication.ts',
  );
  expect(scalarAuth).toContain('return undefined');
  expect(scalarAuth).not.toContain('IJwtTokenService');

  expectProjectState(projectDir, {
    template: 'default',
    auth: false,
    cache: false,
    cronJobs: false,
    eventJobs: false,
    health: options.health ?? false,
  });

  if (options.health) {
    assertHealthCheck(projectDir, { withRedis: false });
  } else {
    expectPathsMissing(projectDir, [
      'src/host/controllers/health-check/health-check.controller.ts',
    ]);
  }
}

export function assertCrudProjectWithJwt(projectDir: string) {
  expectPathsExist(projectDir, [
    'src/host/controllers/person/person.module.ts',
    'src/host/controllers/person/delete-person.controller.ts',
    'src/host/controllers/auth/auth.module.ts',
    'src/host/security/security.module.ts',
    'src/infra/common/redis-cache.service.ts',
    'src/core/utils/cron-expression-to-boolean.ts',
    'src/core/background-services/event-service/event-handler.base.ts',
    'src/host/decorators/scalar-token-endpoint.decorator.ts',
    'src/application/person/jobs/create-person.job.ts',
  ]);

  const appModule = readProjectFile(projectDir, 'src/host/app.module.ts');
  expect(appModule).toContain('PersonModule');
  expect(appModule).toContain('SecurityModule');
  expect(appModule).toContain('AuthModule');

  const deletePerson = readProjectFile(
    projectDir,
    'src/host/controllers/person/delete-person.controller.ts',
  );
  expect(deletePerson).toContain('RestrictionByProfile');

  const scalarAuth = readProjectFile(
    projectDir,
    'src/host/open-api/scalar-authentication.ts',
  );
  expect(scalarAuth).toContain('buildScalarAuthentication');
  expect(scalarAuth).toContain('IJwtTokenService');

  expectProjectState(projectDir, {
    template: 'crudSample',
    auth: 'jwt',
    cache: 'redis',
    cronJobs: true,
    eventJobs: true,
    health: false,
  });

  expectPackageDependencies(projectDir, [
    'ioredis',
    '@nestjs/jwt',
    'passport-jwt',
    'cron-parser',
  ]);
}

export function assertCacheRedis(projectDir: string) {
  expectPathsExist(projectDir, ['src/infra/common/redis-cache.service.ts']);

  const infraModule = readProjectFile(projectDir, 'src/infra/infra.module.ts');
  expect(infraModule).toContain('ICacheService');
  expect(infraModule).toContain('CacheServiceProvider');

  expectPackageDependencies(projectDir, ['ioredis']);
  expectProjectState(projectDir, { cache: 'redis' });
}

export function assertAuthJwt(projectDir: string) {
  expectPathsExist(projectDir, [
    'src/host/controllers/auth/auth.module.ts',
    'src/host/security/security.module.ts',
    'src/host/decorators/scalar-token-endpoint.decorator.ts',
    'src/application/auth/issue-token/issue-token.handler.ts',
  ]);

  const appModule = readProjectFile(projectDir, 'src/host/app.module.ts');
  expect(appModule).toContain('SecurityModule');
  expect(appModule).toContain('AuthModule');

  const scalarAuth = readProjectFile(
    projectDir,
    'src/host/open-api/scalar-authentication.ts',
  );
  expect(scalarAuth).toContain('IJwtTokenService');
  expect(scalarAuth).toContain('isProviderRegistered');

  expectProjectState(projectDir, { auth: 'jwt' });
  expectPackageDependencies(projectDir, ['@nestjs/jwt', 'passport-jwt']);
}

export function assertHealthCheck(
  projectDir: string,
  options: { withRedis: boolean },
) {
  expectPathsExist(projectDir, [
    'src/host/controllers/health-check/health-check.controller.ts',
    'src/infra/services/database.indicator.service.ts',
  ]);

  const appModule = readProjectFile(projectDir, 'src/host/app.module.ts');
  expect(appModule).toContain('HealthCheckModule');

  const controller = readProjectFile(
    projectDir,
    'src/host/controllers/health-check/health-check.controller.ts',
  );

  if (options.withRedis) {
    expectPathsExist(projectDir, [
      'src/infra/services/redis.indicator.service.ts',
    ]);
    expect(controller).toContain('RedisIndicator');
  } else {
    expectPathsMissing(projectDir, [
      'src/infra/services/redis.indicator.service.ts',
    ]);
    expect(controller).not.toContain('RedisIndicator');
  }

  expectProjectState(projectDir, { health: true });
  expectPackageDependencies(projectDir, ['@nestjs/terminus', '@nestjs/axios']);
}

export function assertCronJobs(projectDir: string) {
  expectPathsExist(projectDir, [
    'src/core/utils/cron-expression-to-boolean.ts',
    'src/host/bootstrap/koala-bootstrap.ts',
  ]);

  const main = readProjectFile(projectDir, 'src/host/main.ts');
  expect(main).toContain('bootstrapKoalaJobs');

  expectProjectState(projectDir, { cronJobs: true });
  expectPackageDependencies(projectDir, ['cron-parser']);
}

export function assertEventJobs(projectDir: string) {
  expectPathsExist(projectDir, [
    'src/core/background-services/event-service/event-handler.base.ts',
  ]);

  expectProjectState(projectDir, { eventJobs: true });
}

export function resetE2eFixtures() {
  if (defaultProjectFixture) {
    cleanupWorkspace(defaultProjectFixture.workspace);
    defaultProjectFixture = null;
  }
}

/** @deprecated use ensureCliBuilt */
export const buildCli = ensureCliBuilt;
