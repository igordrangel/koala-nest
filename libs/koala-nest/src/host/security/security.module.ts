import { AuthHttp } from '@/core/auth/auth.constants';
import { Env } from '@/core/env';
import { OAuthProviderRegistry } from '@/core/auth/oauth-provider.registry';
import {
  IJwtTokenService,
  IOAuth2Service,
} from '@/domain/auth/services/iauth.service';
import { JwtTokenService } from '@/infra/auth/jwt-token.service';
import { OAuth2AuthService } from '@/infra/auth/oauth2-auth.service';
import { InfraModule } from '@/infra/infra.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthGuard } from './guards/auth.guard';
import { ProfilesGuard } from './guards/profiles.guard';

@Module({
  imports: [
    InfraModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      global: true,
      useFactory(config: ConfigService<Env, true>) {
        const privateKey = config.get('JWT_PRIVATE_KEY', { infer: true });
        const publicKey = config.get('JWT_PUBLIC_KEY', { infer: true });

        if (!privateKey || !publicKey) {
          throw new Error(
            'JWT_PRIVATE_KEY e JWT_PUBLIC_KEY são obrigatórios quando o módulo de autenticação está ativo',
          );
        }

        return {
          signOptions: { algorithm: AuthHttp.JWT_ALGORITHM },
          privateKey: Buffer.from(privateKey, 'base64'),
          publicKey: Buffer.from(publicKey, 'base64'),
        };
      },
    }),
  ],
  providers: [
    OAuthProviderRegistry,
    JwtStrategy,
    AuthGuard,
    ProfilesGuard,
    { provide: IJwtTokenService, useClass: JwtTokenService },
    { provide: IOAuth2Service, useClass: OAuth2AuthService },
  ],
  exports: [
    IJwtTokenService,
    IOAuth2Service,
    OAuthProviderRegistry,
    JwtModule,
    AuthGuard,
    ProfilesGuard,
  ],
})
export class SecurityModule {}
