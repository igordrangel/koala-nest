import { mkdtempSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, it } from 'bun:test';
import {
  assertAuthJwt,
  assertAuthJwtAndOAuth2,
  assertAuthOAuth2,
  assertCacheRedis,
  assertCrudProjectWithJwt,
  assertCrudProjectWithJwtAndOAuth2,
  assertCrudProjectWithOAuth2,
  assertCronJobs,
  assertDefaultProjectWithoutAuth,
  assertDefaultWithAllFeatures,
  assertDefaultWithJwtCacheAndHealth,
  assertEventJobs,
  assertHealthCheck,
  cleanupWorkspace,
  cloneDefaultProject,
  createDefaultProjectFixture,
  ensureCliBuilt,
  ensureNestScaffoldCache,
  expectCliSuccess,
  expectProjectBuilds,
  resetE2eFixtures,
  runCli,
} from './helpers.ts';

beforeAll(async () => {
  ensureCliBuilt();
  await ensureNestScaffoldCache();
}, 180_000);

afterAll(() => {
  resetE2eFixtures();
}, 120_000);

describe('CLI e2e — new', () => {
  const workspaces: string[] = [];

  afterAll(() => {
    for (const workspace of workspaces) {
      cleanupWorkspace(workspace);
    }
  }, 120_000);

  it('default sem auth com health-check aplica estrutura mínima e compila', () => {
    const workspace = mkdtempSync(path.join(os.tmpdir(), 'koala-cli-e2e-'));
    workspaces.push(workspace);

    const result = runCli(
      [
        'new',
        'my-api',
        '-y',
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

  it('default sem auth mínimo compila', () => {
    const workspace = mkdtempSync(path.join(os.tmpdir(), 'koala-cli-e2e-'));
    workspaces.push(workspace);

    const result = runCli(
      [
        'new',
        'bare-api',
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

    const projectDir = path.join(workspace, 'bare-api');
    assertDefaultProjectWithoutAuth(projectDir);
    expectProjectBuilds(projectDir);
  }, 120_000);

  it('template example (CRUD) com jwt inclui Person, cache Redis, cron e events', () => {
    const workspace = mkdtempSync(path.join(os.tmpdir(), 'koala-cli-e2e-'));
    workspaces.push(workspace);

    const result = runCli(
      [
        'new',
        'my-crud',
        '-y',
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
    expectProjectBuilds(projectDir);
  }, 120_000);

  it('template example (CRUD) com oauth2 não inclui login por senha', () => {
    const workspace = mkdtempSync(path.join(os.tmpdir(), 'koala-cli-e2e-'));
    workspaces.push(workspace);

    const result = runCli(
      [
        'new',
        'crud-oauth',
        '-y',
        '--template',
        'example',
        '--pm',
        'bun',
        '--auth',
        'oauth2',
      ],
      workspace,
    );

    expectCliSuccess(result);

    const projectDir = path.join(workspace, 'crud-oauth');
    assertCrudProjectWithOAuth2(projectDir);
    expectProjectBuilds(projectDir);
  }, 120_000);

  it('template example (CRUD) com jwt e oauth2 inclui ambos os fluxos', () => {
    const workspace = mkdtempSync(path.join(os.tmpdir(), 'koala-cli-e2e-'));
    workspaces.push(workspace);

    const result = runCli(
      [
        'new',
        'crud-both',
        '-y',
        '--template',
        'example',
        '--pm',
        'bun',
        '--auth',
        'jwt,oauth2',
      ],
      workspace,
    );

    expectCliSuccess(result);

    const projectDir = path.join(workspace, 'crud-both');
    assertCrudProjectWithJwtAndOAuth2(projectDir);
    expectProjectBuilds(projectDir);
  }, 120_000);

  it('default com jwt não inclui artefatos OAuth2', () => {
    const workspace = mkdtempSync(path.join(os.tmpdir(), 'koala-cli-e2e-'));
    workspaces.push(workspace);

    const result = runCli(
      [
        'new',
        'jwt-only',
        '-y',
        '--template',
        'default',
        '--pm',
        'bun',
        '--auth',
        'jwt',
      ],
      workspace,
    );

    expectCliSuccess(result);
    assertAuthJwt(path.join(workspace, 'jwt-only'));
    expectProjectBuilds(path.join(workspace, 'jwt-only'));
  }, 120_000);

  it('default com oauth2 não inclui login por senha', () => {
    const workspace = mkdtempSync(path.join(os.tmpdir(), 'koala-cli-e2e-'));
    workspaces.push(workspace);

    const result = runCli(
      [
        'new',
        'oauth-only',
        '-y',
        '--template',
        'default',
        '--pm',
        'bun',
        '--auth',
        'oauth2',
      ],
      workspace,
    );

    expectCliSuccess(result);
    assertAuthOAuth2(path.join(workspace, 'oauth-only'));
    expectProjectBuilds(path.join(workspace, 'oauth-only'));
  }, 120_000);

  it('default com jwt e oauth2 inclui ambos os fluxos', () => {
    const workspace = mkdtempSync(path.join(os.tmpdir(), 'koala-cli-e2e-'));
    workspaces.push(workspace);

    const result = runCli(
      [
        'new',
        'auth-both',
        '-y',
        '--template',
        'default',
        '--pm',
        'bun',
        '--auth',
        'jwt,oauth2',
      ],
      workspace,
    );

    expectCliSuccess(result);
    assertAuthJwtAndOAuth2(path.join(workspace, 'auth-both'));
    expectProjectBuilds(path.join(workspace, 'auth-both'));
  }, 120_000);

  it('default sem auth com cache, health, cron e events compila', () => {
    const workspace = mkdtempSync(path.join(os.tmpdir(), 'koala-cli-e2e-'));
    workspaces.push(workspace);

    const result = runCli(
      [
        'new',
        'full-default',
        '-y',
        '--template',
        'default',
        '--pm',
        'bun',
        '--auth',
        'none',
        '--features',
        'cache,health,cron,events',
      ],
      workspace,
    );

    expectCliSuccess(result);

    const projectDir = path.join(workspace, 'full-default');
    assertDefaultWithAllFeatures(projectDir);
    expectProjectBuilds(projectDir);
  }, 120_000);

  it('default com jwt, cache e health compila', () => {
    const workspace = mkdtempSync(path.join(os.tmpdir(), 'koala-cli-e2e-'));
    workspaces.push(workspace);

    const result = runCli(
      [
        'new',
        'jwt-full',
        '-y',
        '--template',
        'default',
        '--pm',
        'bun',
        '--auth',
        'jwt',
        '--features',
        'cache,health',
      ],
      workspace,
    );

    expectCliSuccess(result);

    const projectDir = path.join(workspace, 'jwt-full');
    assertDefaultWithJwtCacheAndHealth(projectDir);
    expectProjectBuilds(projectDir);
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
  }, 120_000);

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
    expectProjectBuilds(projectDir);
  }, 90_000);

  it('add auth oauth2 isolado após default sem auth', () => {
    const projectDir = trackClone('add-oauth-only');

    expectCliSuccess(runCli(['add', 'auth', 'oauth2'], projectDir));
    assertAuthOAuth2(projectDir);
    expectProjectBuilds(projectDir);
  }, 90_000);

  it('add auth jwt e oauth2 juntos após default sem auth', () => {
    const projectDir = trackClone('add-auth-both');

    expectCliSuccess(runCli(['add', 'auth', 'jwt', 'oauth2'], projectDir));
    assertAuthJwtAndOAuth2(projectDir);
    expectProjectBuilds(projectDir);
  }, 90_000);

  it('add auth oauth2 após jwt inclui fluxo OAuth2 sem duplicar infra', () => {
    const projectDir = trackClone('add-oauth-after-jwt');

    expectCliSuccess(runCli(['add', 'auth', 'jwt'], projectDir));
    expectCliSuccess(runCli(['add', 'auth', 'oauth2'], projectDir));
    assertAuthJwtAndOAuth2(projectDir);
    expectProjectBuilds(projectDir);
  }, 120_000);

  it('add auth jwt após oauth2 inclui login sem duplicar infra', () => {
    const projectDir = trackClone('add-jwt-after-oauth');

    expectCliSuccess(runCli(['add', 'auth', 'oauth2'], projectDir));
    expectCliSuccess(runCli(['add', 'auth', 'jwt'], projectDir));
    assertAuthJwtAndOAuth2(projectDir);
    expectProjectBuilds(projectDir);
  }, 120_000);

  it('add health-check sem cache omite RedisIndicator', () => {
    const projectDir = trackClone('add-health');

    expectCliSuccess(runCli(['add', 'health'], projectDir));
    assertHealthCheck(projectDir, { withRedis: false });
  }, 60_000);

  it('add health-check após cache inclui RedisIndicator', () => {
    const projectDir = trackClone('add-health-redis');

    expectCliSuccess(runCli(['add', 'cache'], projectDir));
    expectCliSuccess(runCli(['add', 'health'], projectDir));

    assertHealthCheck(projectDir, { withRedis: true });
  }, 60_000);

  it('add cron instala infraestrutura de jobs e dependência cron-parser', () => {
    const projectDir = trackClone('add-cron');

    expectCliSuccess(runCli(['add', 'cron'], projectDir));
    assertCronJobs(projectDir);
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

    assertDefaultWithJwtCacheAndHealth(projectDir);
    expectProjectBuilds(projectDir);
  }, 90_000);
});
