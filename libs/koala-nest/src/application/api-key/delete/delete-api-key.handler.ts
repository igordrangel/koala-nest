import { findApiKeyOrThrow } from '@/application/api-key/find-api-key-or-throw';
import { RequestHandlerBase } from '@/application/common/request-handler.base';
import { IApiKeyRepository } from '@/domain/repositories/iapi-key.repository';
import { ILoggedUserInfoService } from '@/domain/services/ilogged-user-info.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DeleteApiKeyHandler extends RequestHandlerBase<string, void> {
  constructor(
    private readonly repository: IApiKeyRepository,
    private readonly loggedUser: ILoggedUserInfoService,
  ) {
    super();
  }

  async handle(id: string): Promise<void> {
    const apiKey = await findApiKeyOrThrow(
      this.repository,
      id,
      this.loggedUser.getUser().sub,
    );

    await this.repository.delete(apiKey);
  }
}
