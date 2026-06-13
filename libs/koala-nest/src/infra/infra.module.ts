import { ICacheService } from '@/domain/common/icache.service';
import { ILoggingService } from '@/domain/common/ilogging.service';
import { IRedLockService } from '@/domain/common/ired-lock.service';
import { ILoggedUserInfoService } from '@/domain/services/ilogged-user-info.service';
import { Module } from '@nestjs/common';
import { CacheServiceProvider } from '@/infra/common/cache-service.provider';
import { LoggingService } from '@/infra/common/logging.service';
import { RedLockService } from '@/infra/common/red-lock.service';
import { LoggedUserInfoService } from '@/infra/services/logged-user-info.service';
import { RepositoryModule } from '@/infra/repositories/repository.module';

@Module({
  imports: [RepositoryModule],
  providers: [
    CacheServiceProvider,
    { provide: ICacheService, useExisting: CacheServiceProvider },
    { provide: ILoggingService, useClass: LoggingService },
    { provide: IRedLockService, useClass: RedLockService },
    { provide: ILoggedUserInfoService, useClass: LoggedUserInfoService },
  ],
  exports: [
    RepositoryModule,
    ICacheService,
    ILoggingService,
    IRedLockService,
    ILoggedUserInfoService,
  ],
})
export class InfraModule {}
