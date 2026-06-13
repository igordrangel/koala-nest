type InfraModuleOptions = {
  cache: boolean;
  auth: boolean;
};

function hasCacheProviders(content: string) {
  return content.includes(
    '{ provide: ICacheService, useExisting: CacheServiceProvider }',
  );
}

function hasAuthProviders(content: string) {
  return content.includes(
    '{ provide: ILoggedUserInfoService, useClass: LoggedUserInfoService }',
  );
}

export function buildInfraModule({ cache, auth }: InfraModuleOptions): string {
  const importLines = [
    ...(cache
      ? ["import { ICacheService } from '@/domain/common/icache.service';"]
      : []),
    "import { ILoggingService } from '@/domain/common/ilogging.service';",
    ...(auth
      ? [
          "import { ILoggedUserInfoService } from '@/domain/services/ilogged-user-info.service';",
        ]
      : []),
    ...(cache
      ? ["import { IRedLockService } from '@/domain/common/ired-lock.service';"]
      : []),
    "import { Module } from '@nestjs/common';",
    ...(cache
      ? [
          "import { CacheServiceProvider } from '@/infra/common/cache-service.provider';",
        ]
      : []),
    "import { LoggingService } from '@/infra/common/logging.service';",
    ...(auth
      ? [
          "import { LoggedUserInfoService } from '@/infra/services/logged-user-info.service';",
        ]
      : []),
    ...(cache
      ? ["import { RedLockService } from '@/infra/common/red-lock.service';"]
      : []),
    "import { RepositoryModule } from '@/infra/repositories/repository.module';",
  ];

  const providerLines = [
    ...(cache
      ? [
          '    CacheServiceProvider,',
          '    { provide: ICacheService, useExisting: CacheServiceProvider },',
        ]
      : []),
    '    { provide: ILoggingService, useClass: LoggingService },',
    ...(cache
      ? ['    { provide: IRedLockService, useClass: RedLockService },']
      : []),
    ...(auth
      ? [
          '    { provide: ILoggedUserInfoService, useClass: LoggedUserInfoService },',
        ]
      : []),
  ];

  const exportLines = [
    '    RepositoryModule,',
    ...(cache ? ['    ICacheService,'] : []),
    '    ILoggingService,',
    ...(cache ? ['    IRedLockService,'] : []),
    ...(auth ? ['    ILoggedUserInfoService,'] : []),
  ];

  return `${importLines.join('\n')}

@Module({
  imports: [RepositoryModule],
  providers: [
${providerLines.join('\n')}
  ],
  exports: [
${exportLines.join('\n')}
  ],
})
export class InfraModule {}
`;
}

export function patchInfraModuleForCache(content: string) {
  if (hasCacheProviders(content)) {
    return content;
  }

  return buildInfraModule({
    cache: true,
    auth: hasAuthProviders(content) || content.includes('ILoggedUserInfoService'),
  });
}

export const SLIM_INFRA_MODULE = buildInfraModule({ cache: false, auth: false });

export function patchInfraModuleForAuth(content: string) {
  if (hasAuthProviders(content)) {
    return content;
  }

  return buildInfraModule({
    cache: hasCacheProviders(content) || content.includes('ICacheService'),
    auth: true,
  });
}

export function stripInfraModuleCache(_content: string) {
  return SLIM_INFRA_MODULE;
}
