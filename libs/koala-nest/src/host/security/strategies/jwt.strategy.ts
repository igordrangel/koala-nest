import { AuthHttp } from '@/core/auth/auth.constants';
import { isAuthRefreshRoute } from '@/core/auth/auth-routes';
import { jwtPayloadSchema } from '@/core/auth/jwt-claims';
import { parseJwtExpiresInToSeconds } from '@/core/auth/parse-jwt-expires-in';
import { EnvService } from '@/infra/common/env.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly accessTokenTtlSeconds: number;

  constructor(env: EnvService) {
    const publicKey = env.get('JWT_PUBLIC_KEY');

    if (!publicKey) {
      throw new Error(
        'JWT_PUBLIC_KEY é obrigatório quando o módulo de autenticação está ativo',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: Buffer.from(publicKey, 'base64'),
      algorithms: [AuthHttp.JWT_ALGORITHM],
      passReqToCallback: true,
    });

    this.accessTokenTtlSeconds = parseJwtExpiresInToSeconds(
      env.get('JWT_ACCESS_TOKEN_EXPIRES_IN'),
    );
  }

  private isLongLivedToken(payload: { exp?: number; iat?: number }): boolean {
    if (!payload.exp || !payload.iat) {
      return false;
    }

    return payload.exp - payload.iat > this.accessTokenTtlSeconds;
  }

  validate(req: Request, payload: { sub: string; exp?: number; iat?: number }) {
    const isRefreshRoute = isAuthRefreshRoute(req.url);
    const parsed = jwtPayloadSchema.parse(payload);

    if (this.isLongLivedToken(payload) && !isRefreshRoute) {
      throw new UnauthorizedException(
        'Refresh token não pode ser usado como access token',
      );
    }

    const token = req
      .get('Authorization')
      ?.replace(AuthHttp.BEARER_PREFIX, '')
      .trim();

    return { sub: parsed.sub, refreshToken: token };
  }
}
