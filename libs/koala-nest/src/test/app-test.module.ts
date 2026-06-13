import { envSchema } from '@/core/env';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PersonModule } from '@/host/controllers/person/person.module';
import { e2eDatabaseUrl } from '@/test/e2e-context';

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
        }),
    }),
    PersonModule,
  ],
})
export class AppTestModule {}
