import { afterEach, describe, expect, it } from 'bun:test';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { AuthStrategy } from '@cli/constants/domain';
import {
  ensureJwtKeysInEnv,
  patchEnvForAuthStrategies,
} from '@cli/utils/patch-env.ts';

describe('patchEnvForAuthStrategies', () => {
  let tempDir = '';

  afterEach(() => {
    if (tempDir) {
      rmSync(tempDir, { recursive: true, force: true });
      tempDir = '';
    }
  });

  it('JWT-only expõe chaves JWT no .env.example sem OAUTH2_PROVIDERS', () => {
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'koala-patch-env-jwt-'));
    patchEnvForAuthStrategies(tempDir, [AuthStrategy.JWT]);

    const envSource = readFileSync(
      path.join(tempDir, 'src/core/env.ts'),
      'utf8',
    );
    const envExample = readFileSync(
      path.join(tempDir, '.env.example'),
      'utf8',
    );

    expect(envSource).toContain('JWT_PRIVATE_KEY');
    expect(envExample).toContain('JWT_PRIVATE_KEY');
    expect(envExample).not.toContain('OAUTH2_PROVIDERS');
    expect(envSource).not.toContain('parse-oauth2-provider-env');
    expect(envSource).not.toContain('OAUTH2_PROVIDERS');
  });

  it('OAuth2-only restaura env completo com OAUTH2_PROVIDERS', () => {
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'koala-patch-env-oauth-'));
    patchEnvForAuthStrategies(tempDir, [AuthStrategy.OAUTH2]);

    const envExample = readFileSync(
      path.join(tempDir, '.env.example'),
      'utf8',
    );

    expect(envExample).toContain('OAUTH2_PROVIDERS');
    expect(envExample).toContain('JWT_PRIVATE_KEY');
  });

  it('JWT + OAuth2 restaura env completo', () => {
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'koala-patch-env-both-'));
    patchEnvForAuthStrategies(tempDir, [
      AuthStrategy.JWT,
      AuthStrategy.OAUTH2,
    ]);

    const envExample = readFileSync(
      path.join(tempDir, '.env.example'),
      'utf8',
    );

    expect(envExample).toContain('JWT_PRIVATE_KEY');
    expect(envExample).toContain('OAUTH2_PROVIDERS');
  });

  it('gera JWT_PRIVATE_KEY e JWT_PUBLIC_KEY no .env quando vazias', () => {
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'koala-patch-env-keys-'));
    writeFileSync(
      path.join(tempDir, '.env'),
      'PORT=3000\nJWT_PRIVATE_KEY=\nJWT_PUBLIC_KEY=\n',
    );

    patchEnvForAuthStrategies(tempDir, [AuthStrategy.JWT]);

    const env = readFileSync(path.join(tempDir, '.env'), 'utf8');
    const envExample = readFileSync(
      path.join(tempDir, '.env.example'),
      'utf8',
    );
    const privateMatch = env.match(/^JWT_PRIVATE_KEY=(.+)$/m);
    const publicMatch = env.match(/^JWT_PUBLIC_KEY=(.+)$/m);

    expect(privateMatch?.[1]?.length).toBeGreaterThan(100);
    expect(publicMatch?.[1]?.length).toBeGreaterThan(100);
    expect(envExample).toMatch(/^JWT_PRIVATE_KEY=$/m);
    expect(envExample).toMatch(/^JWT_PUBLIC_KEY=$/m);
  });

  it('não sobrescreve chaves JWT já preenchidas no .env', () => {
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'koala-patch-env-keep-'));
    writeFileSync(
      path.join(tempDir, '.env'),
      'JWT_PRIVATE_KEY=existing-private\nJWT_PUBLIC_KEY=existing-public\n',
    );

    patchEnvForAuthStrategies(tempDir, [AuthStrategy.JWT]);

    const env = readFileSync(path.join(tempDir, '.env'), 'utf8');

    expect(env).toContain('JWT_PRIVATE_KEY=existing-private');
    expect(env).toContain('JWT_PUBLIC_KEY=existing-public');
  });

  it('com API Key adiciona e gera chaves JWT no .env se ausentes', () => {
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'koala-patch-env-apikey-'));
    writeFileSync(path.join(tempDir, '.env'), 'PORT=3000\n');

    patchEnvForAuthStrategies(tempDir, [
      AuthStrategy.JWT,
      AuthStrategy.API_KEY,
    ]);

    const env = readFileSync(path.join(tempDir, '.env'), 'utf8');
    const privateMatch = env.match(/^JWT_PRIVATE_KEY=(.+)$/m);
    const publicMatch = env.match(/^JWT_PUBLIC_KEY=(.+)$/m);

    expect(privateMatch?.[1]?.length).toBeGreaterThan(100);
    expect(publicMatch?.[1]?.length).toBeGreaterThan(100);
  });
});

describe('ensureJwtKeysInEnv', () => {
  let tempDir = '';

  afterEach(() => {
    if (tempDir) {
      rmSync(tempDir, { recursive: true, force: true });
      tempDir = '';
    }
  });

  it('sem addIfMissing não cria chaves quando o .env não tem JWT_*', () => {
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'koala-ensure-jwt-skip-'));
    writeFileSync(path.join(tempDir, '.env'), 'PORT=3000\n');

    expect(ensureJwtKeysInEnv(tempDir)).toBe(false);
    expect(readFileSync(path.join(tempDir, '.env'), 'utf8')).toBe('PORT=3000\n');
  });

  it('preenche chaves vazias sem alterar .env.example', () => {
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'koala-ensure-jwt-fill-'));
    writeFileSync(
      path.join(tempDir, '.env'),
      'JWT_PRIVATE_KEY=\nJWT_PUBLIC_KEY=\n',
    );
    writeFileSync(
      path.join(tempDir, '.env.example'),
      'JWT_PRIVATE_KEY=\nJWT_PUBLIC_KEY=\n',
    );

    expect(ensureJwtKeysInEnv(tempDir)).toBe(true);

    const env = readFileSync(path.join(tempDir, '.env'), 'utf8');
    const example = readFileSync(path.join(tempDir, '.env.example'), 'utf8');

    expect(env.match(/^JWT_PRIVATE_KEY=(.+)$/m)?.[1]?.length).toBeGreaterThan(
      100,
    );
    expect(example).toBe('JWT_PRIVATE_KEY=\nJWT_PUBLIC_KEY=\n');
  });
});
