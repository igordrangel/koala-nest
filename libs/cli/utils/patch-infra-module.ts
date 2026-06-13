export function patchInfraModuleForCache(content: string) {
  if (content.includes('CacheServiceProvider')) {
    return content;
  }

  const withAuth = content.includes('ILoggedUserInfoService');

  let patched = content
    .replace(
      "import { ILoggingService } from '@/domain/common/ilogging.service';",
      "import { ICacheService } from '@/domain/common/icache.service';\nimport { ILoggingService } from '@/domain/common/ilogging.service';\nimport { IRedLockService } from '@/domain/common/ired-lock.service';",
    )
    .replace(
      "import { LoggingService } from '@/infra/common/logging.service';",
      "import { CacheServiceProvider } from '@/infra/common/cache-service.provider';\nimport { LoggingService } from '@/infra/common/logging.service';\nimport { RedLockService } from '@/infra/common/red-lock.service';",
    )
    .replace(
      '  providers: [\n    { provide: ILoggingService, useClass: LoggingService },',
      '  providers: [\n    CacheServiceProvider,\n    { provide: ICacheService, useExisting: CacheServiceProvider },\n    { provide: ILoggingService, useClass: LoggingService },\n    { provide: IRedLockService, useClass: RedLockService },',
    );

  if (withAuth) {
    return patched.replace(
      '  exports: [RepositoryModule, ILoggingService, ILoggedUserInfoService],',
      '  exports: [\n    RepositoryModule,\n    ICacheService,\n    ILoggingService,\n    IRedLockService,\n    ILoggedUserInfoService,\n  ],',
    );
  }

  return patched.replace(
    '  exports: [RepositoryModule, ILoggingService],',
    '  exports: [\n    RepositoryModule,\n    ICacheService,\n    ILoggingService,\n    IRedLockService,\n  ],',
  );
}

export const SLIM_INFRA_MODULE = `import { ILoggingService } from '@/domain/common/ilogging.service';
import { Module } from '@nestjs/common';
import { LoggingService } from '@/infra/common/logging.service';
import { RepositoryModule } from '@/infra/repositories/repository.module';

@Module({
  imports: [RepositoryModule],
  providers: [{ provide: ILoggingService, useClass: LoggingService }],
  exports: [RepositoryModule, ILoggingService],
})
export class InfraModule {}
`;

export function patchInfraModuleForAuth(content: string) {
  if (content.includes('ILoggedUserInfoService')) {
    return content;
  }

  let patched = content
    .replace(
      "import { ILoggingService } from '@/domain/common/ilogging.service';",
      "import { ILoggingService } from '@/domain/common/ilogging.service';\nimport { ILoggedUserInfoService } from '@/domain/services/ilogged-user-info.service';",
    )
    .replace(
      "import { LoggingService } from '@/infra/common/logging.service';",
      "import { LoggingService } from '@/infra/common/logging.service';\nimport { LoggedUserInfoService } from '@/infra/services/logged-user-info.service';",
    )
    .replace(
      '    { provide: ILoggingService, useClass: LoggingService },',
      '    { provide: ILoggingService, useClass: LoggingService },\n    { provide: ILoggedUserInfoService, useClass: LoggedUserInfoService },',
    );

  if (patched.includes('IRedLockService,')) {
    return patched.replace(
      '    IRedLockService,\n  ],',
      '    IRedLockService,\n    ILoggedUserInfoService,\n  ],',
    );
  }

  return patched.replace(
    '  exports: [RepositoryModule, ILoggingService],',
    '  exports: [RepositoryModule, ILoggingService, ILoggedUserInfoService],',
  );
}

export function stripInfraModuleCache(_content: string) {
  return SLIM_INFRA_MODULE;
}
