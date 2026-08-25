type InfraModuleOptions = {
  cache: boolean;
  auth: boolean;
  queue: boolean;
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

function hasQueueProviders(content: string) {
  return content.includes('{ provide: IQueueService, useClass: QueueService }');
}

export function buildInfraModule({
  cache,
  auth,
  queue,
}: InfraModuleOptions): string {
  const importLines = [
    ...(cache
      ? ["import { ICacheService } from '@/domain/common/icache.service';"]
      : []),
    "import { ILoggingService } from '@/domain/common/ilogging.service';",
    ...(queue
      ? ["import { IQueueService } from '@/domain/common/iqueue.service';"]
      : []),
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
    ...(queue
      ? ["import { QueueService } from '@/infra/services/queue.service';"]
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
    ...(queue
      ? ['    { provide: IQueueService, useClass: QueueService },']
      : []),
  ];

  const exportLines = [
    '    RepositoryModule,',
    ...(cache ? ['    ICacheService,'] : []),
    '    ILoggingService,',
    ...(cache ? ['    IRedLockService,'] : []),
    ...(auth ? ['    ILoggedUserInfoService,'] : []),
    ...(queue ? ['    IQueueService,'] : []),
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

function resolveInfraFlags(content: string): InfraModuleOptions {
  return {
    cache: hasCacheProviders(content) || content.includes('ICacheService'),
    auth:
      hasAuthProviders(content) || content.includes('ILoggedUserInfoService'),
    queue: hasQueueProviders(content) || content.includes('IQueueService'),
  };
}

export function patchInfraModuleForCache(content: string) {
  if (hasCacheProviders(content)) {
    return content;
  }

  return buildInfraModule({
    ...resolveInfraFlags(content),
    cache: true,
  });
}

export const SLIM_INFRA_MODULE = buildInfraModule({
  cache: false,
  auth: false,
  queue: false,
});

export function patchInfraModuleForAuth(content: string) {
  if (hasAuthProviders(content)) {
    return content;
  }

  return buildInfraModule({
    ...resolveInfraFlags(content),
    auth: true,
  });
}

export function patchInfraModuleForQueue(content: string) {
  if (hasQueueProviders(content)) {
    return content;
  }

  return buildInfraModule({
    ...resolveInfraFlags(content),
    queue: true,
  });
}

export function stripInfraModuleCache(content: string) {
  const flags = resolveInfraFlags(content);

  return buildInfraModule({
    cache: false,
    auth: flags.auth,
    queue: flags.queue,
  });
}
