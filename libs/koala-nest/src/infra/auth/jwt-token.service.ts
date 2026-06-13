import { JwtClaims } from '@/core/auth/jwt-claims';
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

  private signOptions(
    key: 'JWT_ACCESS_TOKEN_EXPIRES_IN' | 'JWT_REFRESH_TOKEN_EXPIRES_IN',
  ): JwtSignOptions {
    return {
      expiresIn: this.env.get(key) as JwtSignOptions['expiresIn'],
    };
  }

  signAccessToken(claims: JwtClaims): string {
    return this.jwtService.sign(
      { ...claims, jti: randomUUID() },
      this.signOptions('JWT_ACCESS_TOKEN_EXPIRES_IN'),
    );
  }

  signRefreshToken(claims: JwtClaims): string {
    return this.jwtService.sign(
      { ...claims, jti: randomUUID() },
      this.signOptions('JWT_REFRESH_TOKEN_EXPIRES_IN'),
    );
  }

  signTokenPair(claims: JwtClaims) {
    const accessToken = this.signAccessToken(claims);
    const refreshToken = this.signRefreshToken(claims);

    return {
      accessToken,
      access_token: accessToken,
      refreshToken,
      refresh_token: refreshToken,
    };
  }
}
