import { validateEnvConfig } from '@/core/env';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InactivePersonHandler } from '@/application/person/jobs/events/person/inactive-person/inactive-person.handler';
import { CreatePersonJob } from '@/application/person/jobs/cron/create-person.job';
import { DeleteInactiveJob } from '@/application/person/jobs/cron/delete-inactive.job';
import { AuthModule } from './controllers/auth/auth.module';
import { JobsModule } from './jobs/jobs.module';
import { PersonModule } from './controllers/person/person.module';
import { SecurityModule } from './security/security.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => validateEnvConfig(config),
    }),
    SecurityModule,
    AuthModule,
    JobsModule.register({
      imports: [PersonModule],
      eventHandlers: [InactivePersonHandler],
      cronJobs: [CreatePersonJob, DeleteInactiveJob],
    }),
  ],
})
export class AppModule {}
