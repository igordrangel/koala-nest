import { EnvConfig } from '@/core/utils/env.config';
import { InternalSubnetValidator } from '@/core/utils/internal-subnet-validator';
import {
  matchApiKeyDomainOrigin,
  resolveClientIp,
} from '@/core/utils/match-api-key-domain-origin';
import { ApiKeyType } from '@/domain/entities/api-key/enums/api-key-type.enum';
import { IApiKeyRepository } from '@/domain/repositories/iapi-key.repository';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ApiKeyAuthorizationService {
  constructor(private readonly apiKeyRepository: IApiKeyRepository) {}

  private async validateDomainOrigin(
    origins: string[],
    req: Request,
  ): Promise<boolean> {
    const clientIp = resolveClientIp(req);

    if (!clientIp) {
      return false;
    }

    // Marker: InternalSubnetValidator — removido pela CLI quando a flag não é escolhida
    if (InternalSubnetValidator.validate(clientIp)) {
      return true;
    }

    return matchApiKeyDomainOrigin(clientIp, origins);
  }

  async validateApiKey(
    userId: string,
    apiKeyId: string,
    req: Request,
  ): Promise<boolean> {
    const apiKey = await this.apiKeyRepository.findById(apiKeyId);

    if (!apiKey || apiKey.userId !== userId) {
      return false;
    }

    const origins = apiKey.origin.split(',').map((origin) => origin.trim());

    if (
      (EnvConfig.isEnvTest || EnvConfig.isEnvDevelop) &&
      origins.includes('*')
    ) {
      return true;
    }

    switch (apiKey.type) {
      case ApiKeyType.domain:
        return this.validateDomainOrigin(origins, req);
      case ApiKeyType.host:
        return origins.includes(req.hostname);
      case ApiKeyType.uri: {
        let uri = `${req.hostname}${req.path}`;

        for (const param of Object.values(req.params)) {
          if (typeof param === 'string' && param.length > 0) {
            uri = uri.replace(`/${param}`, '');
          }
        }

        return origins.includes(uri);
      }
      default:
        return false;
    }
  }
}
