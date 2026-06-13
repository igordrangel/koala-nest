import { envBooleanSchema } from '@/core/schemas';
import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['test', 'develop', 'staging', 'production']),
  DATABASE_URL: z.string(),
  REDIS_CONNECTION_STRING: z.string().optional(),
  CACHE_KEY_PREFIX: z.string().optional(),
  CRON_JOBS_ENABLED: envBooleanSchema(false),
  BOOTSTRAP_DELAY_MS: z.coerce.number().default(0),
  JWT_PRIVATE_KEY: z.string().optional(),
  JWT_PUBLIC_KEY: z.string().optional(),
  JWT_ACCESS_TOKEN_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
  API_HOST: z.string().optional(),
  OAUTH2_PROVIDERS: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;
