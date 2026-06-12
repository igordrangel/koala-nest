import { envSchema } from '@/core/env';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PersonModule } from './controllers/person/person.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => envSchema.parse(config),
    }),
    PersonModule,
  ],
})
export class AppModule {}
