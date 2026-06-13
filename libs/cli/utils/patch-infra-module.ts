export function patchInfraModuleForCache(content: string) {
  if (content.includes("CacheServiceProvider")) {
    return content;
  }

  return content
    .replace(
      "import { ILoggingService } from '@/domain/common/ilogging.service';",
      "import { ICacheService } from '@/domain/common/icache.service';\nimport { ILoggingService } from '@/domain/common/ilogging.service';\nimport { IRedLockService } from '@/domain/common/ired-lock.service';",
    )
    .replace(
      "import { LoggingService } from '@/infra/common/logging.service';",
      "import { CacheServiceProvider } from '@/infra/common/cache-service.provider';\nimport { LoggingService } from '@/infra/common/logging.service';\nimport { RedLockService } from '@/infra/common/red-lock.service';",
    )
    .replace(
      "  providers: [\n    { provide: ILoggingService, useClass: LoggingService },",
      "  providers: [\n    CacheServiceProvider,\n    { provide: ICacheService, useExisting: CacheServiceProvider },\n    { provide: ILoggingService, useClass: LoggingService },\n    { provide: IRedLockService, useClass: RedLockService },",
    )
    .replace(
      "  exports: [RepositoryModule, ILoggingService, ILoggedUserInfoService],",
      "  exports: [\n    RepositoryModule,\n    ICacheService,\n    ILoggingService,\n    IRedLockService,\n    ILoggedUserInfoService,\n  ],",
    );
}

export const SLIM_INFRA_MODULE = `import { ILoggingService } from '@/domain/common/ilogging.service';
import { ILoggedUserInfoService } from '@/domain/services/ilogged-user-info.service';
import { Module } from '@nestjs/common';
import { LoggingService } from '@/infra/common/logging.service';
import { LoggedUserInfoService } from '@/infra/services/logged-user-info.service';
import { RepositoryModule } from '@/infra/repositories/repository.module';

@Module({
  imports: [RepositoryModule],
  providers: [
    { provide: ILoggingService, useClass: LoggingService },
    { provide: ILoggedUserInfoService, useClass: LoggedUserInfoService },
  ],
  exports: [RepositoryModule, ILoggingService, ILoggedUserInfoService],
})
export class InfraModule {}
`;

export function stripInfraModuleCache(_content: string) {
  return SLIM_INFRA_MODULE;
}
