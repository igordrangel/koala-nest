import { ApiKey } from '@/domain/entities/api-key/api-key';
import { IApiKeyRepository } from '@/domain/repositories/iapi-key.repository';
import { NotFoundException } from '@nestjs/common';

export async function findApiKeyOrThrow(
  repository: IApiKeyRepository,
  id: string,
  userId: string,
): Promise<ApiKey> {
  const apiKey = await repository.findByIdForUser(id, userId);

  if (!apiKey) {
    throw new NotFoundException('API Key não encontrada');
  }

  return apiKey;
}
