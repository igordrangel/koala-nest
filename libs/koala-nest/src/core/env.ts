import 'dotenv/config';
import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['test', 'develop', 'staging', 'production']),
  DATABASE_URL: z.string(),
  REDIS_CONNECTION_STRING: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;
