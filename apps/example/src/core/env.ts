import { envSchema } from '@koalarx/nest/env/env'
import { z } from 'zod'

export const env = envSchema.merge(z.object({}))

export type EnvType = z.infer<typeof env>
