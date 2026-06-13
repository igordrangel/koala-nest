import { envSchema } from '@/core/env';
import { KoalaApp } from '@/core/koala-app';
import { KoalaGlobalVars } from '@/core/koala-global-vars';
import { CreatePersonJob } from '@/application/person/jobs/create-person.job';
import { DeleteInactiveJob } from '@/application/person/jobs/delete-inactive.job';
import { InactivePersonHandler } from '@/application/person/events/inactive-person.handler';
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

export function bootstrapKoalaApp(app: import('@nestjs/common').INestApplication) {
  KoalaGlobalVars.appName = 'koala-nest';
  KoalaGlobalVars.internalUserName = 'integration.bot';

  return new KoalaApp(app)
    .addCronJob(CreatePersonJob)
    .addCronJob(DeleteInactiveJob)
    .addEventJob(InactivePersonHandler);
}
