import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { AuthStrategy } from '@cli/constants/domain';
import { getSourceCodePath } from './get-source-code-path';
import { resolveProjectPath } from './resolve-project-path';

const envWithoutAuth = `import { envBooleanSchema } from '@/core/schemas';
import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['test', 'develop', 'staging', 'production']),
  DATABASE_URL: z.string(),
  REDIS_CONNECTION_STRING: z.string().optional(),
  CACHE_KEY_PREFIX: z.string().optional(),
  CRON_JOBS_ENABLED: envBooleanSchema(false),
  BOOTSTRAP_DELAY_MS: z.coerce.number().default(0),
  RATE_LIMIT_MAX: z.coerce.number().default(0),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
  CORS_ORIGINS: z.string().optional(),
  BCRYPT_ROUNDS: z.coerce.number().min(4).max(15).default(10),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnvConfig(config: Record<string, unknown>): Env {
  return envSchema.parse(config);
}
`;

const envExampleWithoutAuth = `PORT=3000
# Endereço de bind do servidor (Docker/K8s). URLs públicas usam API_HOST.
HOST=0.0.0.0
NODE_ENV=develop
DATABASE_URL=postgresql://postgres:root@localhost:5432/koala_nest

# Redis (opcional)
# Instância única: pode omitir — usa memória local (cache, lock de CronJob em dev).
# Várias réplicas: recomendado para cache/lock consistentes entre processos.
# REDIS_CONNECTION_STRING=redis://localhost:6379
# CACHE_KEY_PREFIX=koala-nest

# Cron jobs internos. Ative com \`kl-nest add cron\`.
CRON_JOBS_ENABLED=false
BOOTSTRAP_DELAY_MS=0

# Rate limit (0 = desabilitado)
# RATE_LIMIT_MAX=300
# RATE_LIMIT_WINDOW_MS=60000

# CORS — aberto por padrão; restrinja com origens separadas por vírgula se necessário
# CORS_ORIGINS=http://localhost:4200,https://app.example.com

# Custo do bcrypt (padrão 10)
# BCRYPT_ROUNDS=10
`;

export function stripEnvAuth(projectName: string) {
  const projectRoot = resolveProjectPath(projectName);

  mkdirSync(path.join(projectRoot, 'src/core'), { recursive: true });
  writeFileSync(path.join(projectRoot, 'src/core/env.ts'), envWithoutAuth);
  writeFileSync(path.join(projectRoot, '.env.example'), envExampleWithoutAuth);
}

export function restoreEnvWithAuth(projectName: string) {
  const projectRoot = resolveProjectPath(projectName);

  for (const relativePath of ['src/core/env.ts', '.env.example']) {
    cpSync(
      path.join(getSourceCodePath(), relativePath),
      path.join(projectRoot, relativePath),
      { force: true },
    );
  }
}

const envJwtOnly = `import { envBooleanSchema } from '@/core/schemas';
import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['test', 'develop', 'staging', 'production']),
  DATABASE_URL: z.string(),
  REDIS_CONNECTION_STRING: z.string().optional(),
  CACHE_KEY_PREFIX: z.string().optional(),
  CRON_JOBS_ENABLED: envBooleanSchema(false),
  BOOTSTRAP_DELAY_MS: z.coerce.number().default(0),
  RATE_LIMIT_MAX: z.coerce.number().default(0),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
  CORS_ORIGINS: z.string().optional(),
  BCRYPT_ROUNDS: z.coerce.number().min(4).max(15).default(10),
  JWT_PRIVATE_KEY: z.string().optional(),
  JWT_PUBLIC_KEY: z.string().optional(),
  JWT_ACCESS_TOKEN_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
  API_HOST: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnvConfig(config: Record<string, unknown>): Env {
  return envSchema.parse(config);
}
`;

const envExampleJwtOnly = `PORT=3000
# Endereço de bind do servidor (Docker/K8s). URLs públicas usam API_HOST.
HOST=0.0.0.0
NODE_ENV=develop
DATABASE_URL=postgresql://postgres:root@localhost:5432/koala_nest

# Redis (opcional)
# REDIS_CONNECTION_STRING=redis://localhost:6379
# CACHE_KEY_PREFIX=koala-nest

CRON_JOBS_ENABLED=false
BOOTSTRAP_DELAY_MS=0

# Rate limit (0 = desabilitado)
# RATE_LIMIT_MAX=300
# RATE_LIMIT_WINDOW_MS=60000

# CORS — aberto por padrão; restrinja com origens separadas por vírgula se necessário
# CORS_ORIGINS=http://localhost:4200,https://app.example.com

# Custo do bcrypt (padrão 10)
# BCRYPT_ROUNDS=10

# JWT (RS256 — chaves em base64)
JWT_PRIVATE_KEY=
JWT_PUBLIC_KEY=
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_TOKEN_EXPIRES_IN=7d
API_HOST=http://localhost:3000

# Usuário demo (migration Init): admin@example.com / admin123
`;

export function patchEnvForAuthStrategies(
  projectName: string,
  strategies: AuthStrategy[],
) {
  const hasJwt = strategies.includes(AuthStrategy.JWT);
  const hasOauth = strategies.includes(AuthStrategy.OAUTH2);
  const projectRoot = resolveProjectPath(projectName);

  mkdirSync(path.join(projectRoot, 'src/core'), { recursive: true });

  if (hasJwt && !hasOauth) {
    writeFileSync(path.join(projectRoot, 'src/core/env.ts'), envJwtOnly);
    writeFileSync(
      path.join(projectRoot, '.env.example'),
      envExampleJwtOnly,
    );
    return;
  }

  restoreEnvWithAuth(projectName);
}
