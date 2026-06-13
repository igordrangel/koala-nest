import { AuthenticatedUser, jwtClaimsSchema } from '@/core/auth/jwt-claims';
import { AuthHttp, JwtTokenType } from '@/core/auth/auth.constants';
import { isAuthRefreshRoute } from '@/core/auth/auth-routes';
import { EnvService } from '@/infra/common/env.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
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
  }

  validate(req: Request, payload: AuthenticatedUser) {
    const isRefreshRoute = isAuthRefreshRoute(req.url);

    if (payload.tokenType === JwtTokenType.REFRESH && !isRefreshRoute) {
      throw new UnauthorizedException(
        'Refresh token não pode ser usado como access token',
      );
    }

    if (payload.tokenType === JwtTokenType.REFRESH) {
      return jwtClaimsSchema.parse(payload);
    }

    const token = req
      .get('Authorization')
      ?.replace(AuthHttp.BEARER_PREFIX, '')
      .trim();
    return jwtClaimsSchema.parse({ ...payload, refreshToken: token });
  }
}
