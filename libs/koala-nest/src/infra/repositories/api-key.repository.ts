import { ListResponse } from '@/core/types';
import { ApiKey } from '@/domain/entities/api-key/api-key';
import { IApiKeyRepository } from '@/domain/repositories/iapi-key.repository';
import { DATA_SOURCE_PROVIDER_TOKEN } from '@/infra/database/data-source-factory';
import { RepositoryBase } from '@/infra/repositories/repository.base';
import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class ApiKeyRepository
  extends RepositoryBase<ApiKey>
  implements IApiKeyRepository
{
  constructor(@Inject(DATA_SOURCE_PROVIDER_TOKEN) dataSource: DataSource) {
    super(dataSource, ApiKey);
  }

  findByIdForUser(id: string, userId: string): Promise<ApiKey | null> {
    return this.findOneNormalized({ where: { id, userId } });
  }

  findById(id: string): Promise<ApiKey | null> {
    return this.findOneNormalized({ where: { id } });
  }

  findManyByUserId(userId: string): Promise<ListResponse<ApiKey>> {
    return this.repository
      .findAndCount({
        where: { userId },
        order: { createdAt: 'DESC' },
      })
      .then(([items, count]) => ({
        items: this.normalizeEntities(items),
        count,
      }));
  }

  save(apiKey: ApiKey): Promise<ApiKey> {
    return this.repository.save(apiKey);
  }

  async delete(apiKey: ApiKey): Promise<void> {
    await this.repository.remove(apiKey);
  }
}
