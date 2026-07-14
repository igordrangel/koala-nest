import { AuthHttp } from '@/core/auth/auth.constants';
import { captureApiKeyOnRequest } from '@/core/utils/capture-apikey-on-request';
import { ApiKeyAuthorizationService } from '@/infra/auth/api-key-authorization.service';
import { EnvService } from '@/infra/common/env.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-custom';
import { z } from 'zod';

const apiKeyTokenSchema = z.object({
  sub: z.uuid(),
  iss: z.uuid(),
  typ: z.string().optional().nullable(),
});

type ApiKeyToken = z.infer<typeof apiKeyTokenSchema>;

type DoneFn = (err: Error | null, user?: ApiKeyToken) => void;

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(Strategy, 'apikey') {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authorizationService: ApiKeyAuthorizationService,
    private readonly env: EnvService,
  ) {
    super();
  }

  async validate(req: Request, done: DoneFn) {
    const encoded = captureApiKeyOnRequest(req);

    if (!encoded) {
      done(new UnauthorizedException());
      return;
    }

    const publicKey = this.env.get('JWT_PUBLIC_KEY');

    if (!publicKey) {
      done(new UnauthorizedException());
      return;
    }

    const result = await this.jwtService
      .verifyAsync(encoded, {
        algorithms: [AuthHttp.JWT_ALGORITHM],
        publicKey: Buffer.from(publicKey, 'base64'),
      })
      .then(() => apiKeyTokenSchema.parse(this.jwtService.decode(encoded)))
      .then(async (decodedToken) => {
        if (decodedToken.typ !== AuthHttp.API_KEY_TOKEN_TYPE) {
          return { validOrigin: false, decodedToken: null };
        }

        const validOrigin = await this.authorizationService.validateApiKey(
          decodedToken.sub,
          decodedToken.iss,
          req,
        );

        return { validOrigin, decodedToken };
      })
      .catch(() => ({ validOrigin: false, decodedToken: null }));

    if (result.validOrigin && result.decodedToken) {
      done(null, result.decodedToken);
      return;
    }

    done(new UnauthorizedException());
  }
}
