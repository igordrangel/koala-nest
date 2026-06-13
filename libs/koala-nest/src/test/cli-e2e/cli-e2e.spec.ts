import { mkdtempSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, it } from 'bun:test';
import {
  assertAuthJwt,
  assertCacheRedis,
  assertCrudProjectWithJwt,
  assertCronJobs,
  assertDefaultProjectWithoutAuth,
  assertEventJobs,
  assertHealthCheck,
  cleanupWorkspace,
  cloneDefaultProject,
  createDefaultProjectFixture,
  ensureCliBuilt,
  ensureNestScaffoldCache,
  expectCliSuccess,
  expectProjectBuilds,
  expectProjectState,
  resetE2eFixtures,
  runCli,
} from './helpers.ts';

beforeAll(async () => {
  ensureCliBuilt();
  await ensureNestScaffoldCache();
}, 180_000);

afterAll(() => {
  resetE2eFixtures();
});

describe('CLI e2e — new', () => {
  const workspaces: string[] = [];

  afterAll(() => {
    for (const workspace of workspaces) {
      cleanupWorkspace(workspace);
    }
  });

  it('default sem auth com health-check aplica estrutura mínima e compila', () => {
    const workspace = mkdtempSync(path.join(os.tmpdir(), 'koala-cli-e2e-'));
    workspaces.push(workspace);

    const result = runCli(
      [
        'new',
        'my-api',
        '--template',
        'default',
        '--pm',
        'bun',
        '--auth',
        'none',
        '--features',
        'health',
      ],
      workspace,
    );

    expectCliSuccess(result);

    const projectDir = path.join(workspace, 'my-api');
    assertDefaultProjectWithoutAuth(projectDir, { health: true });
    expectProjectBuilds(projectDir);
  }, 120_000);

  it('template example (CRUD) com jwt inclui Person, cache Redis, cron e events', () => {
    const workspace = mkdtempSync(path.join(os.tmpdir(), 'koala-cli-e2e-'));
    workspaces.push(workspace);

    const result = runCli(
      [
        'new',
        'my-crud',
        '--template',
        'example',
        '--pm',
        'bun',
        '--auth',
        'jwt',
      ],
      workspace,
    );

    expectCliSuccess(result);

    const projectDir = path.join(workspace, 'my-crud');
    assertCrudProjectWithJwt(projectDir);
  }, 120_000);
});

describe('CLI e2e — add', () => {
  const workspaces: string[] = [];

  beforeAll(() => {
    createDefaultProjectFixture();
  }, 120_000);

  afterAll(() => {
    for (const workspace of workspaces) {
      cleanupWorkspace(workspace);
    }
  });

  function trackClone(projectName: string) {
    const cloned = cloneDefaultProject(projectName);
    workspaces.push(cloned.workspace);
    return cloned.projectDir;
  }

  it('add cache instala Redis e registra ICacheService', () => {
    const projectDir = trackClone('add-cache');

    expectCliSuccess(runCli(['add', 'cache'], projectDir));
    assertCacheRedis(projectDir);
  }, 60_000);

  it('add auth jwt restaura módulos e Scalar após default sem auth', () => {
    const projectDir = trackClone('add-auth');

    expectCliSuccess(runCli(['add', 'auth', 'jwt'], projectDir));
    assertAuthJwt(projectDir);
    expectProjectState(projectDir, { cache: 'memory' });
  }, 60_000);

  it('add health-check sem cache omite RedisIndicator', () => {
    const projectDir = trackClone('add-health');

    expectCliSuccess(runCli(['add', 'health'], projectDir));
    assertHealthCheck(projectDir, { withRedis: false });
  }, 60_000);

  it('add health-check após cache inclui RedisIndicator', () => {
    const projectDir = trackClone('add-health-redis');

    expectCliSuccess(runCli(['add', 'cache'], projectDir));
    expectCliSuccess(runCli(['add', 'health'], projectDir));

    assertCacheRedis(projectDir);
    assertHealthCheck(projectDir, { withRedis: true });
  }, 60_000);

  it('add cron instala bootstrap e dependência cron-parser', () => {
    const projectDir = trackClone('add-cron');

    expectCliSuccess(runCli(['add', 'cron'], projectDir));
    assertCronJobs(projectDir);
    expectProjectState(projectDir, { cache: 'memory' });
  }, 60_000);

  it('add events instala event-service', () => {
    const projectDir = trackClone('add-events');

    expectCliSuccess(runCli(['add', 'events'], projectDir));
    assertEventJobs(projectDir);
  }, 60_000);

  it('add múltiplos recursos normaliza ordem cache → auth → health e compila', () => {
    const projectDir = trackClone('multi-add');

    expectCliSuccess(
      runCli(['add', 'health', 'auth', 'jwt', 'cache'], projectDir),
    );

    assertCacheRedis(projectDir);
    assertAuthJwt(projectDir);
    assertHealthCheck(projectDir, { withRedis: true });
    expectProjectBuilds(projectDir);
  }, 90_000);
});
