import { createMap } from '@/core/tools/mapping';
import { CreateApiKeyRequest } from '@/application/api-key/create/create-api-key.request';
import { CreateApiKeyResponse } from '@/application/api-key/create/create-api-key.response';
import { ReadApiKeyResponse } from '@/application/api-key/read/read-api-key.response';
import { ReadManyApiKeyResponseItem } from '@/application/api-key/read-many/read-many-api-key.response';
import { ApiKey } from '@/domain/entities/api-key/api-key';

export class ApiKeyMapper {
  static createMap() {
    createMap(CreateApiKeyRequest, ApiKey);
    createMap(ApiKey, CreateApiKeyResponse);
    createMap(ApiKey, ReadApiKeyResponse);
    createMap(ApiKey, ReadManyApiKeyResponseItem);
  }
}
