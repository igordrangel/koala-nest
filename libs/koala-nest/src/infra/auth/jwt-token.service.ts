import { JwtClaims } from '@/core/auth/jwt-claims';
import { JwtTokenType } from '@/core/auth/auth.constants';
import { IJwtTokenService } from '@/domain/auth/services/iauth.service';
import { Injectable } from '@nestjs/common';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import { EnvService } from '@/infra/common/env.service';

@Injectable()
export class JwtTokenService implements IJwtTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly env: EnvService,
  ) {}

  signAccessToken(claims: JwtClaims): string {
    return this.jwtService.sign(
      { ...claims, tokenType: JwtTokenType.ACCESS, jti: randomUUID() },
      this.signOptions('JWT_ACCESS_TOKEN_EXPIRES_IN'),
    );
  }

  signRefreshToken(claims: JwtClaims): string {
    return this.jwtService.sign(
      { ...claims, tokenType: JwtTokenType.REFRESH, jti: randomUUID() },
      this.signOptions('JWT_REFRESH_TOKEN_EXPIRES_IN'),
    );
  }

  private signOptions(
    key: 'JWT_ACCESS_TOKEN_EXPIRES_IN' | 'JWT_REFRESH_TOKEN_EXPIRES_IN',
  ): JwtSignOptions {
    return {
      expiresIn: this.env.get(key) as JwtSignOptions['expiresIn'],
    };
  }

  signTokenPair(claims: JwtClaims) {
    return {
      accessToken: this.signAccessToken(claims),
      refreshToken: this.signRefreshToken(claims),
    };
  }
}
