import { RequestHandlerBase } from '@/application/common/request-handler.base';
import { AutoMapper } from '@/core/tools/mapping';
import { ApiKey } from '@/domain/entities/api-key/api-key';
import { IApiKeyRepository } from '@/domain/repositories/iapi-key.repository';
import { ILoggedUserInfoService } from '@/domain/services/ilogged-user-info.service';
import { Injectable } from '@nestjs/common';
import {
  ReadManyApiKeyResponse,
  ReadManyApiKeyResponseItem,
} from './read-many-api-key.response';

@Injectable()
export class ReadManyApiKeyHandler extends RequestHandlerBase<
  void,
  ReadManyApiKeyResponse
> {
  constructor(
    private readonly repository: IApiKeyRepository,
    private readonly loggedUser: ILoggedUserInfoService,
  ) {
    super();
  }

  async handle(): Promise<ReadManyApiKeyResponse> {
    const result = await this.repository.findManyByUserId(
      this.loggedUser.getUser().sub,
    );

    return ReadManyApiKeyResponse.from({
      items: result.items.map((item) =>
        AutoMapper.map(item, ApiKey, ReadManyApiKeyResponseItem),
      ),
      count: result.count,
    });
  }
}
