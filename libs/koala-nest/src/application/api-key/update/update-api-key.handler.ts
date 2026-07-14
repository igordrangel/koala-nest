import { findApiKeyOrThrow } from '@/application/api-key/find-api-key-or-throw';
import { RequestHandlerBase } from '@/application/common/request-handler.base';
import { IApiKeyRepository } from '@/domain/repositories/iapi-key.repository';
import { ILoggedUserInfoService } from '@/domain/services/ilogged-user-info.service';
import { Injectable } from '@nestjs/common';
import { UpdateApiKeyRequest } from './update-api-key.request';
import { UpdateApiKeyValidator } from './update-api-key.validator';

@Injectable()
export class UpdateApiKeyHandler extends RequestHandlerBase<
  UpdateApiKeyRequest,
  void
> {
  constructor(
    private readonly repository: IApiKeyRepository,
    private readonly loggedUser: ILoggedUserInfoService,
  ) {
    super();
  }

  async handle(request: UpdateApiKeyRequest): Promise<void> {
    const validated = new UpdateApiKeyValidator(request).validate();
    const apiKey = await findApiKeyOrThrow(
      this.repository,
      validated.id,
      this.loggedUser.getUser().sub,
    );

    apiKey.origin = validated.origin;
    apiKey.type = validated.type;

    await this.repository.save(apiKey);
  }
}
