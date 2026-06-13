import { JwtClaims } from '@/core/auth/jwt-claims';
import { IJwtTokenService } from '@/domain/auth/services/iauth.service';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EnvService } from '@/infra/common/env.service';

@Injectable()
export class JwtTokenService implements IJwtTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly env: EnvService,
  ) {}

  signAccessToken(claims: JwtClaims): string {
    return this.jwtService.sign(claims, {
      expiresIn: this.env.get('JWT_ACCESS_TOKEN_EXPIRES_IN'),
    });
  }

  signRefreshToken(claims: JwtClaims): string {
    return this.jwtService.sign(claims, {
      expiresIn: this.env.get('JWT_REFRESH_TOKEN_EXPIRES_IN'),
    });
  }

  signTokenPair(claims: JwtClaims) {
    return {
      accessToken: this.signAccessToken(claims),
      refreshToken: this.signRefreshToken(claims),
    };
  }
}
