import { AuthenticatedUser, jwtClaimsSchema } from '@/core/auth/jwt-claims';
import { EnvService } from '@/infra/common/env.service';
import { Injectable } from '@nestjs/common';
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
      algorithms: ['RS256'],
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: AuthenticatedUser) {
    const token = req.get('Authorization')?.replace('Bearer', '').trim();
    return jwtClaimsSchema.parse({ ...payload, refreshToken: token });
  }
}
