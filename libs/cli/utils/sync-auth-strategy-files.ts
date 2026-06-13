import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { AuthStrategy } from '@cli/constants/domain';
import { getSourceCodePath } from './get-source-code-path';
import { resolveProjectPath } from './resolve-project-path';

const envSpecJwtOnly = `import { describe, expect, it } from 'bun:test';
import { envSchema } from '@/core/env';

describe('envSchema', () => {
  it('interpreta CRON_JOBS_ENABLED=false como desabilitado', () => {
    const env = envSchema.parse({
      NODE_ENV: 'test',
      DATABASE_URL: 'postgres://localhost/test',
      CRON_JOBS_ENABLED: 'false',
    });

    expect(env.CRON_JOBS_ENABLED).toBe(false);
  });
});
`;

const cacheConstantsJwtOnly = `/** Prefixos e chaves do cache distribuído / em memória. */
export const CacheKeyPrefix = {
  RED_LOCK: 'redLock:',
} as const;

/** TTLs em segundos para entradas de cache. */
export const CacheTtlSeconds = {
  /** Listagem paginada de Person (2 minutos). */
  PERSON_LIST: 120,
} as const;

/** TTL padrão do RedLock quando não derivado do cron (segundos). */
export const DEFAULT_RED_LOCK_TTL_SECONDS = 30;
`;

function writeCacheConstantsWithoutOAuth(projectName: string) {
  writeProjectFile(
    projectName,
    'src/core/constants/cache.constants.ts',
    cacheConstantsJwtOnly,
  );
}

function writeProjectFile(
  projectName: string,
  relativePath: string,
  content: string,
) {
  const filePath = path.join(resolveProjectPath(projectName), relativePath);

  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, content);
}

function restoreProjectFile(projectName: string, relativePath: string) {
  cpSync(
    path.join(getSourceCodePath(), relativePath),
    path.join(resolveProjectPath(projectName), relativePath),
    { force: true },
  );
}

export function syncAuthStrategySupportFiles(
  projectName: string,
  strategies: AuthStrategy[],
) {
  const hasJwt = strategies.includes(AuthStrategy.JWT);
  const hasOauth = strategies.includes(AuthStrategy.OAUTH2);

  if (hasJwt && !hasOauth) {
    writeProjectFile(
      projectName,
      'src/test/core/env.spec.ts',
      envSpecJwtOnly,
    );
    writeCacheConstantsWithoutOAuth(projectName);
    return;
  }

  for (const relativePath of [
    'src/test/core/env.spec.ts',
    'src/core/constants/cache.constants.ts',
  ]) {
    restoreProjectFile(projectName, relativePath);
  }
}

/** Remove chaves OAuth2 do cache quando auth não está instalada. */
export function syncCacheConstantsWithoutOAuth(projectName: string) {
  writeCacheConstantsWithoutOAuth(projectName);
}
