import { envSchema } from '@/core/env';
import { AuthModule } from '@/host/controllers/auth/auth.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PersonModule } from '@/host/controllers/person/person.module';
import { e2eDatabaseUrl } from '@/test/e2e-context';
import { getJwtTestKeys } from '@/test/utils/jwt-test-keys';

const jwtKeys = getJwtTestKeys();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
      validate: () =>
        envSchema.parse({
          PORT: 3000,
          NODE_ENV: 'test',
          DATABASE_URL: e2eDatabaseUrl,
          JWT_PRIVATE_KEY: jwtKeys.privateKey,
          JWT_PUBLIC_KEY: jwtKeys.publicKey,
          JWT_ACCESS_TOKEN_EXPIRES_IN: '15m',
          JWT_REFRESH_TOKEN_EXPIRES_IN: '7d',
          API_HOST: 'http://localhost:3000',
        }),
    }),
    PersonModule,
    AuthModule,
  ],
})
export class AppAuthTestModule {}
