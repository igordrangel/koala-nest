import { Module } from '@nestjs/common';
import { EnvService } from '@/infra/common/env.service';
import {
  DATA_SOURCE_PROVIDER_TOKEN,
  dataSourceFactory,
} from '@/infra/database/data-source-factory';

@Module({
  providers: [
    EnvService,
    {
      provide: DATA_SOURCE_PROVIDER_TOKEN,
      useFactory: dataSourceFactory,
      inject: [EnvService],
    },
  ],
  exports: [EnvService, DATA_SOURCE_PROVIDER_TOKEN],
})
export class DatabaseModule {}
