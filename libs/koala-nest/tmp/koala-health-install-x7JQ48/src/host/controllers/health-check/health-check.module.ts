import { DatabaseIndicator } from '@/infra/services/database.indicator.service';
import { DatabaseModule } from '@/infra/database/database.module';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { ControllerModule } from '../common/controller.module';
import { HealthCheckController } from './health-check.controller';

@Module({
  imports: [
    ControllerModule,
    DatabaseModule,
    HttpModule,
    TerminusModule.forRoot({
      errorLogStyle: 'pretty',
    }),
  ],
  providers: [DatabaseIndicator],
  controllers: [HealthCheckController],
})
export class HealthCheckModule {}
