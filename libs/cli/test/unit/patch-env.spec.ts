import { afterEach, describe, expect, it } from 'bun:test';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { AuthStrategy } from '@cli/constants/domain';
import { patchEnvForAuthStrategies } from '@cli/utils/patch-env.ts';

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
});
