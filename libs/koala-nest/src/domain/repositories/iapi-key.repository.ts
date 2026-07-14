import { ListResponse } from '@/core/types';
import { ApiKey } from '../entities/api-key/api-key';

export abstract class IApiKeyRepository {
  abstract findByIdForUser(id: string, userId: string): Promise<ApiKey | null>;
  abstract findById(id: string): Promise<ApiKey | null>;
  abstract findManyByUserId(userId: string): Promise<ListResponse<ApiKey>>;
  abstract save(apiKey: ApiKey): Promise<ApiKey>;
  abstract delete(apiKey: ApiKey): Promise<void>;
}
