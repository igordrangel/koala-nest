import { PersistApiKeyValidator } from '@/application/api-key/common/persist-api-key.validator';
import { RequestHandlerBase } from '@/application/common/request-handler.base';
import { AuthHttp } from '@/core/auth/auth.constants';
import { AutoMapper } from '@/core/tools/mapping';
import { ApiKey } from '@/domain/entities/api-key/api-key';
import { IApiKeyRepository } from '@/domain/repositories/iapi-key.repository';
import { ILoggedUserInfoService } from '@/domain/services/ilogged-user-info.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateApiKeyRequest } from './create-api-key.request';
import { CreateApiKeyResponse } from './create-api-key.response';

@Injectable()
export class CreateApiKeyHandler extends RequestHandlerBase<
  CreateApiKeyRequest,
  CreateApiKeyResponse
> {
  constructor(
    private readonly loggedUser: ILoggedUserInfoService,
    private readonly repository: IApiKeyRepository,
    private readonly jwt: JwtService,
  ) {
    super();
  }

  async handle(req: CreateApiKeyRequest): Promise<CreateApiKeyResponse> {
    const validated = new PersistApiKeyValidator(req).validate();
    const user = this.loggedUser.getUser();

    const apiKey = AutoMapper.map(validated, CreateApiKeyRequest, ApiKey);
    apiKey.userId = user.sub;
    apiKey.key = '';

    const saved = await this.repository.save(apiKey);
    const created = await this.repository.findById(saved.id);

    if (!created) {
      throw new NotFoundException('Chave de API após criação');
    }

    created.key = await this.jwt.signAsync(
      {
        sub: created.userId,
        iss: created.id,
        typ: AuthHttp.API_KEY_TOKEN_TYPE,
      },
      {
        expiresIn: '100y',
        algorithm: AuthHttp.JWT_ALGORITHM,
      },
    );

    await this.repository.save(created);

    return CreateApiKeyResponse.from({ id: created.id, key: created.key });
  }
}
