import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { AuthStrategy } from '@cli/constants/domain';
import { generateJwtKeyPairBase64 } from './generate-jwt-keys';
import { getSourceCodePath } from './get-source-code-path';
import { resolveProjectPath } from './resolve-project-path';

const JWT_PRIVATE_KEY = 'JWT_PRIVATE_KEY';
const JWT_PUBLIC_KEY = 'JWT_PUBLIC_KEY';

function readEnvAssignment(
  content: string,
  key: string,
): { exists: boolean; value: string } {
  const match = content.match(new RegExp(`^${key}=(.*)$`, 'm'));

  if (!match) {
    return { exists: false, value: '' };
  }

  return { exists: true, value: match[1] ?? '' };
}

function writeJwtKeysInEnvContent(
  content: string,
  privateKey: string,
  publicKey: string,
): string {
  let next = content;
  const hasPrivate = new RegExp(`^${JWT_PRIVATE_KEY}=`, 'm').test(next);
  const hasPublic = new RegExp(`^${JWT_PUBLIC_KEY}=`, 'm').test(next);

  if (hasPrivate) {
    next = next.replace(
      new RegExp(`^${JWT_PRIVATE_KEY}=.*$`, 'm'),
      `${JWT_PRIVATE_KEY}=${privateKey}`,
    );
  }

  if (hasPublic) {
    next = next.replace(
      new RegExp(`^${JWT_PUBLIC_KEY}=.*$`, 'm'),
      `${JWT_PUBLIC_KEY}=${publicKey}`,
    );
  }

  if (hasPrivate && hasPublic) {
    return next;
  }

  if (!hasPrivate && !hasPublic) {
    return `${next.trimEnd()}\n\n# JWT (RS256 — chaves em base64)\n${JWT_PRIVATE_KEY}=${privateKey}\n${JWT_PUBLIC_KEY}=${publicKey}\n`;
  }

  if (!hasPrivate) {
    return next.replace(
      new RegExp(`^${JWT_PUBLIC_KEY}=`, 'm'),
      `${JWT_PRIVATE_KEY}=${privateKey}\n${JWT_PUBLIC_KEY}=`,
    );
  }

  return next.replace(
    new RegExp(`^${JWT_PRIVATE_KEY}=.*$`, 'm'),
    `${JWT_PRIVATE_KEY}=${privateKey}\n${JWT_PUBLIC_KEY}=${publicKey}`,
  );
}

/**
 * Preenche JWT_PRIVATE_KEY / JWT_PUBLIC_KEY no `.env` com um par RS256 gerado.
 * Não sobrescreve quando ambas já têm valor. `.env.example` permanece vazio (template).
 */
export function ensureJwtKeysInEnv(
  projectName: string,
  options: { addIfMissing?: boolean } = {},
): boolean {
  const envPath = path.join(resolveProjectPath(projectName), '.env');

  if (!existsSync(envPath)) {
    return false;
  }

  const content = readFileSync(envPath, 'utf8');
  const privateKey = readEnvAssignment(content, JWT_PRIVATE_KEY);
  const publicKey = readEnvAssignment(content, JWT_PUBLIC_KEY);

  if (!privateKey.exists && !publicKey.exists && !options.addIfMissing) {
    return false;
  }

  if (privateKey.value.trim() && publicKey.value.trim()) {
    return false;
  }

  const keys = generateJwtKeyPairBase64();
  writeFileSync(
    envPath,
    writeJwtKeysInEnvContent(content, keys.privateKey, keys.publicKey),
  );

  return true;
}

function authNeedsJwtKeys(strategies: AuthStrategy[]): boolean {
  return (
    strategies.includes(AuthStrategy.JWT) ||
    strategies.includes(AuthStrategy.OAUTH2) ||
    strategies.includes(AuthStrategy.API_KEY)
  );
}

const envWithoutAuth = `import { envBooleanSchema } from '@/core/schemas';
import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['test', 'develop', 'staging', 'production']),
  DATABASE_URL: z.string(),
  DATABASE_SCHEMA: z.string().optional(),
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

  if (projectHasQueueFeature(projectName)) {
    patchEnvForQueue(projectName);
  }
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
  DATABASE_SCHEMA: z.string().optional(),
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
  } else {
    restoreEnvWithAuth(projectName);
  }

  if (authNeedsJwtKeys(strategies)) {
    ensureJwtKeysInEnv(projectName, { addIfMissing: true });
  }

  if (projectHasQueueFeature(projectName)) {
    patchEnvForQueue(projectName);
  }
}

const QUEUE_ENV_SCHEMA_SNIPPET = `  QUEUE_MAX_CONCURRENCY: z.coerce.number().int().min(1).max(100).default(10),
  QUEUE_CAPACITY_DELAY_MS: z.coerce.number().int().min(0).default(200),
  QUEUE_IDLE_DELAY_MS: z.coerce.number().int().min(0).default(1000),
  QUEUE_ERROR_DELAY_MS: z.coerce.number().int().min(0).default(2000),`;

const QUEUE_ENV_EXAMPLE_SNIPPET = `
# Queue jobs (mensageria) — opcional; defaults no schema Zod se omitidos
QUEUE_MAX_CONCURRENCY=10
QUEUE_CAPACITY_DELAY_MS=200
QUEUE_IDLE_DELAY_MS=1000
QUEUE_ERROR_DELAY_MS=2000
`;

function projectHasQueueFeature(projectName: string): boolean {
  return existsSync(
    path.join(
      resolveProjectPath(projectName),
      'src/core/background-services/queue-service/queue.base.ts',
    ),
  );
}

function injectQueueEnvSchema(content: string): string {
  if (content.includes('QUEUE_MAX_CONCURRENCY')) {
    return content;
  }

  if (content.includes('BOOTSTRAP_DELAY_MS:')) {
    return content.replace(
      /(BOOTSTRAP_DELAY_MS:[^\n]+\n)/,
      `$1${QUEUE_ENV_SCHEMA_SNIPPET}\n`,
    );
  }

  return content.replace(
    /(export const envSchema = z\.object\(\{\n)/,
    `$1${QUEUE_ENV_SCHEMA_SNIPPET}\n`,
  );
}

function injectQueueEnvExample(content: string): string {
  if (content.includes('QUEUE_MAX_CONCURRENCY=')) {
    return content;
  }

  return `${content.trimEnd()}\n${QUEUE_ENV_EXAMPLE_SNIPPET}`;
}

/** Injeta vars abstratas do QueueBase em env.ts / .env.example / .env (idempotente). */
export function patchEnvForQueue(projectName: string): void {
  const projectRoot = resolveProjectPath(projectName);
  const envTsPath = path.join(projectRoot, 'src/core/env.ts');
  const envExamplePath = path.join(projectRoot, '.env.example');
  const envPath = path.join(projectRoot, '.env');

  if (existsSync(envTsPath)) {
    writeFileSync(
      envTsPath,
      injectQueueEnvSchema(readFileSync(envTsPath, 'utf8')),
    );
  }

  if (existsSync(envExamplePath)) {
    writeFileSync(
      envExamplePath,
      injectQueueEnvExample(readFileSync(envExamplePath, 'utf8')),
    );
  }

  if (existsSync(envPath)) {
    writeFileSync(
      envPath,
      injectQueueEnvExample(readFileSync(envPath, 'utf8')),
    );
  }
}
