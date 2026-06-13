import { ICacheService } from '@/domain/common/icache.service';
import { ILoggingService } from '@/domain/common/ilogging.service';
import { IRedLockService } from '@/domain/common/ired-lock.service';
import { Module } from '@nestjs/common';
import { LoggingService } from './common/logging.service';
import { RedisService } from './common/redis.service';
import { RedLockService } from './common/red-lock.service';
import { RepositoryModule } from './repositories/repository.module';

@Module({
  imports: [RepositoryModule],
  providers: [
    { provide: ICacheService, useClass: RedisService },
    { provide: ILoggingService, useClass: LoggingService },
    { provide: IRedLockService, useClass: RedLockService },
  ],
  exports: [
    RepositoryModule,
    ICacheService,
    ILoggingService,
    IRedLockService,
  ],
})
export class InfraModule {}
