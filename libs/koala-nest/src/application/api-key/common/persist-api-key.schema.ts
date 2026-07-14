import { ApiKeyType } from '@/domain/entities/api-key/enums/api-key-type.enum';
import { z } from 'zod';

export const persistApiKeySchema = z.object({
  origin: z.string().min(1),
  type: z.enum([ApiKeyType.domain, ApiKeyType.host, ApiKeyType.uri]),
});
