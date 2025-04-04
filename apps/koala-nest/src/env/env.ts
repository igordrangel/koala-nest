import 'dotenv/config'
import { z } from 'zod'

export const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['test', 'develop', 'staging', 'production']),
  PRISMA_QUERY_LOG: z.coerce.boolean(),
  SWAGGER_USERNAME: z.string().optional(),
  SWAGGER_PASSWORD: z.string().optional(),
  REDIS_CONNECTION_STRING: z.string(),
})

export type Env = z.infer<typeof envSchema>
