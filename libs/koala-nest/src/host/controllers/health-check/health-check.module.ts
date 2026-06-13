import { DatabaseIndicator } from '@/infra/services/database.indicator.service';
import { RedisIndicator } from '@/infra/services/redis.indicator.service';
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
  providers: [DatabaseIndicator, RedisIndicator],
  controllers: [HealthCheckController],
})
export class HealthCheckModule {}
