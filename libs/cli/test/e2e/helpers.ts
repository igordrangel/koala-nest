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
import {
  assertCliProject,
  assertCliProjectFromSelection,
  buildProjectExpectation,
} from '@cli/utils/cli-project-validation.ts';
import {
  AuthStrategy,
  ExtraFeature,
  Template,
} from '@cli/constants/domain';

export const repoRoot = path.resolve(import.meta.dir, '../../../..');
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
      '-y',
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

export function assertDefaultProjectWithoutAuth(
  projectDir: string,
  options: { health?: boolean } = {},
) {
  assertCliProjectFromSelection(
    projectDir,
    Template.DEFAULT,
    [],
    options.health ? [ExtraFeature.HEALTH_CHECK] : [],
  );
}

export function assertCrudProjectWithJwt(projectDir: string) {
  assertCliProjectFromSelection(
    projectDir,
    Template.CRUD_SAMPLE,
    [AuthStrategy.JWT],
    [],
  );
}

export function assertCrudProjectWithOAuth2(projectDir: string) {
  assertCliProjectFromSelection(
    projectDir,
    Template.CRUD_SAMPLE,
    [AuthStrategy.OAUTH2],
    [],
  );
}

export function assertCrudProjectWithJwtAndOAuth2(projectDir: string) {
  assertCliProjectFromSelection(
    projectDir,
    Template.CRUD_SAMPLE,
    [AuthStrategy.JWT, AuthStrategy.OAUTH2],
    [],
  );
}

export function assertCacheRedis(projectDir: string) {
  assertCliProjectFromSelection(projectDir, Template.DEFAULT, [], [
    ExtraFeature.CACHE,
  ]);
}

export function assertAuthJwt(projectDir: string) {
  assertCliProjectFromSelection(projectDir, Template.DEFAULT, [
    AuthStrategy.JWT,
  ], []);
}

export function assertAuthOAuth2(projectDir: string) {
  assertCliProjectFromSelection(projectDir, Template.DEFAULT, [
    AuthStrategy.OAUTH2,
  ], []);
}

export function assertAuthJwtAndOAuth2(projectDir: string) {
  assertCliProjectFromSelection(
    projectDir,
    Template.DEFAULT,
    [AuthStrategy.JWT, AuthStrategy.OAUTH2],
    [],
  );
}

export function assertHealthCheck(
  projectDir: string,
  options: { withRedis: boolean },
) {
  const features = options.withRedis
    ? [ExtraFeature.CACHE, ExtraFeature.HEALTH_CHECK]
    : [ExtraFeature.HEALTH_CHECK];

  assertCliProjectFromSelection(projectDir, Template.DEFAULT, [], features);
}

export function assertCronJobs(projectDir: string) {
  assertCliProjectFromSelection(projectDir, Template.DEFAULT, [], [
    ExtraFeature.INTERNAL_CRON_JOBS,
  ]);
}

export function assertEventJobs(projectDir: string) {
  assertCliProjectFromSelection(projectDir, Template.DEFAULT, [], [
    ExtraFeature.INTERNAL_EVENT_JOBS,
  ]);
}

export function assertDefaultWithAllFeatures(projectDir: string) {
  assertCliProjectFromSelection(projectDir, Template.DEFAULT, [], [
    ExtraFeature.CACHE,
    ExtraFeature.HEALTH_CHECK,
    ExtraFeature.INTERNAL_CRON_JOBS,
    ExtraFeature.INTERNAL_EVENT_JOBS,
  ]);
}

export function assertDefaultWithJwtCacheAndHealth(projectDir: string) {
  assertCliProject(
    projectDir,
    buildProjectExpectation(
      Template.DEFAULT,
      [AuthStrategy.JWT],
      [ExtraFeature.CACHE, ExtraFeature.HEALTH_CHECK],
    ),
  );
}

export function resetE2eFixtures() {
  if (defaultProjectFixture) {
    cleanupWorkspace(defaultProjectFixture.workspace);
    defaultProjectFixture = null;
  }
}

/** @deprecated use ensureCliBuilt */
export const buildCli = ensureCliBuilt;
