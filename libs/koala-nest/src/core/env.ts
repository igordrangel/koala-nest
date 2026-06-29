import {
  oauth2ProviderEnvEntrySchema,
  parseOAuth2ProviderEnv,
  type OAuth2ProviderEnvEntry,
} from '@/core/auth/parse-oauth2-provider-env';
import { envBooleanSchema } from '@/core/schemas';
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
  OAUTH2_PROVIDERS: z.string().optional(),
});

export type Env = z.infer<typeof envSchema> & {
  OAUTH2_PROVIDER_ENV: Record<string, OAuth2ProviderEnvEntry>;
};

export function validateEnvConfig(config: Record<string, unknown>): Env {
  const parsed = envSchema.parse(config);
  const rawProviders = parseOAuth2ProviderEnv(config);
  const OAUTH2_PROVIDER_ENV: Record<string, OAuth2ProviderEnvEntry> = {};

  for (const [key, entry] of Object.entries(rawProviders)) {
    OAUTH2_PROVIDER_ENV[key] = oauth2ProviderEnvEntrySchema.parse(entry);
  }

  return {
    ...parsed,
    OAUTH2_PROVIDER_ENV,
  };
}
