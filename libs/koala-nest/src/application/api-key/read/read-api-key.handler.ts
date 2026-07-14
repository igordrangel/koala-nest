import { RequestHandlerBase } from '@/application/common/request-handler.base';
import { findApiKeyOrThrow } from '@/application/api-key/find-api-key-or-throw';
import { AutoMapper } from '@/core/tools/mapping';
import { ApiKey } from '@/domain/entities/api-key/api-key';
import { IApiKeyRepository } from '@/domain/repositories/iapi-key.repository';
import { ILoggedUserInfoService } from '@/domain/services/ilogged-user-info.service';
import { Injectable } from '@nestjs/common';
import { ReadApiKeyResponse } from './read-api-key.response';

@Injectable()
export class ReadApiKeyHandler extends RequestHandlerBase<
  string,
  ReadApiKeyResponse
> {
  constructor(
    private readonly repository: IApiKeyRepository,
    private readonly loggedUser: ILoggedUserInfoService,
  ) {
    super();
  }

  async handle(id: string): Promise<ReadApiKeyResponse> {
    const apiKey = await findApiKeyOrThrow(
      this.repository,
      id,
      this.loggedUser.getUser().sub,
    );

    return AutoMapper.map(apiKey, ApiKey, ReadApiKeyResponse);
  }
}
