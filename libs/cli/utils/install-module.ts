import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import {
  AUTH_DEV_PACKAGES,
  AUTH_PACKAGES,
  CACHE_PACKAGES,
  CORE_PACKAGES,
  CRON_PACKAGES,
  devAddFlag,
  HEALTH_PACKAGES,
} from '@cli/constants/core-packages';
import {
  AuthChoice,
  AuthStrategy,
  ExtraFeature,
  InstallModule as Modules,
  Template,
} from '@cli/constants/domain';
import { getSourceCodePath } from './get-source-code-path';
import {
  patchAppModuleForHealth,
  patchHealthCheckWithoutRedis,
} from './patch-health-module';
import {
  patchInfraModuleForAuth,
  patchInfraModuleForCache,
  stripInfraModuleCache,
} from './patch-infra-module';
import { patchAuthInstall } from './patch-auth-install';
import { patchMainForAuth, stripMainOptionalFeatures } from './patch-main';
import { restoreDefineDocumentationWithAuth } from './patch-define-documentation';
import { pruneCoreAuthForSlimTemplate } from './prune-core-auth';
import { removeSampleParts } from './remove-sample-parts';
import { resolveProjectPath } from './resolve-project-path';
import { runCommand } from './run-command';
import { getPackageManager } from './get-package-manager';

export type {
  AuthChoice,
  AuthStrategy,
  ExtraFeature,
  Template,
} from '@cli/constants/domain';
export {
  AuthChoice,
  AuthStrategy,
  CRUD_BUNDLED_FEATURES,
  ExtraFeature,
  InstallModule as Modules,
  mapExtraFeatureToModule,
  mergeCrudSampleFeatures,
  resolveNewProjectOptions,
  Template,
} from '@cli/constants/domain';

export type InstallModuleOptions = {
  authStrategies?: AuthStrategy[];
  withRedis?: boolean;
  withRedisIndicator?: boolean;
  skipPackages?: boolean;
};

export type ProjectFeatures = {
  /** Instala ICacheService (memória ou Redis). */
  cache: boolean;
  cacheWithRedis: boolean;
  /** Cache de listagem no CRUD Person. */
  cacheForCrud: boolean;
  health: boolean;
  cronJobs: boolean;
  eventJobs: boolean;
};

function install(modulePath: string, projectName: string) {
  const koalaNestPath = path.join(getSourceCodePath(), modulePath);
  const projectPath = path.join(resolveProjectPath(projectName), modulePath);

  mkdirSync(path.dirname(projectPath), { recursive: true });
  cpSync(koalaNestPath, projectPath, { recursive: true, force: true });
}

async function installPackages(
  projectName: string,
  packages: readonly string[],
  devPackages: readonly string[] = [],
) {
  const packageManager = getPackageManager(projectName);
  const projectPath = resolveProjectPath(projectName);

  if (packages.length > 0) {
    await runCommand([packageManager, 'add', ...packages], projectPath);
  }

  if (devPackages.length > 0) {
    await runCommand(
      [packageManager, 'add', devAddFlag(packageManager), ...devPackages],
      projectPath,
    );
  }
}

function patchInfraModuleFile(projectName: string, withCache: boolean) {
  const infraModulePath = path.join(
    resolveProjectPath(projectName),
    'src/infra/infra.module.ts',
  );
  const content = readFileSync(infraModulePath, 'utf8');

  writeFileSync(
    infraModulePath,
    withCache
      ? patchInfraModuleForCache(content)
      : stripInfraModuleCache(content),
  );
}

function patchInfraModuleAuthFile(projectName: string) {
  const infraModulePath = path.join(
    resolveProjectPath(projectName),
    'src/infra/infra.module.ts',
  );

  writeFileSync(
    infraModulePath,
    patchInfraModuleForAuth(readFileSync(infraModulePath, 'utf8')),
  );
}

function patchAppModuleFile(
  projectName: string,
  replacer: (content: string) => string,
) {
  const appModulePath = path.join(
    resolveProjectPath(projectName),
    'src/host/app.module.ts',
  );

  writeFileSync(appModulePath, replacer(readFileSync(appModulePath, 'utf8')));
}

function patchMainFile(
  projectName: string,
  replacer: (content: string) => string,
) {
  const mainPath = path.join(
    resolveProjectPath(projectName),
    'src/host/main.ts',
  );
  writeFileSync(mainPath, replacer(readFileSync(mainPath, 'utf8')));
}

function installCacheInfrastructure(projectName: string, withRedis: boolean) {
  install('src/domain/common/icache.service.ts', projectName);
  install('src/domain/common/ired-lock.service.ts', projectName);
  install('src/infra/common/in-memory-cache.service.ts', projectName);
  install('src/infra/common/cache-service.provider.ts', projectName);
  install('src/infra/common/red-lock.service.ts', projectName);

  if (withRedis) {
    install('src/infra/common/redis-cache.service.ts', projectName);
  } else {
    rmSync(
      path.join(
        resolveProjectPath(projectName),
        'src/infra/common/redis-cache.service.ts',
      ),
      { force: true },
    );

    let provider = readFileSync(
      path.join(
        resolveProjectPath(projectName),
        'src/infra/common/cache-service.provider.ts',
      ),
      'utf8',
    );

    provider = provider
      .replace(
        "import { RedisCacheService } from '@/infra/common/redis-cache.service';\n",
        '',
      )
      .replace(
        /const redisUrl = env\.get\('REDIS_CONNECTION_STRING'\);\n\n {4}this\.delegate = redisUrl\n {6}\? new RedisCacheService\(redisUrl, this\.resolveKeyPrefix\(env\)\)\n {6}: new InMemoryCacheService\(\);/,
        'this.delegate = new InMemoryCacheService();',
      );

    writeFileSync(
      path.join(
        resolveProjectPath(projectName),
        'src/infra/common/cache-service.provider.ts',
      ),
      provider,
    );
  }

  patchInfraModuleFile(projectName, true);
}

export async function installModule(
  module: Modules,
  template: Template,
  projectName = '',
  options: InstallModuleOptions = {},
): Promise<void> {
  switch (module) {
    case Modules.CORE: {
      install('src/application/common', projectName);
      install('src/application/mapping/mapping.provider.ts', projectName);
      install('src/core', projectName);
      install('src/domain/common/ilogging.service.ts', projectName);
      install('src/domain/dtos/pagination.dto.ts', projectName);
      install('src/host/controllers/common', projectName);
      install('src/host/decorators', projectName);
      install('src/host/filters', projectName);
      install('src/host/open-api', projectName);
      install('src/host/jobs', projectName);
      install('src/host/app.module.ts', projectName);
      install('src/host/main.ts', projectName);
      install('src/infra/common/env.service.ts', projectName);
      install('src/infra/common/logging.service.ts', projectName);
      install('src/infra/services', projectName);
      install(
        'src/infra/database/migrations/generate-migration.ts',
        projectName,
      );
      install(
        'src/infra/database/migrations/migration-datasource.ts',
        projectName,
      );
      install('src/infra/database/data-source-factory.ts', projectName);
      install('src/infra/database/database.module.ts', projectName);
      install('src/infra/repositories/repository.base.ts', projectName);
      install('src/infra/repositories/repository.module.ts', projectName);
      install('src/infra/infra.module.ts', projectName);
      install('src/test', projectName);

      rmSync(
        path.join(
          resolveProjectPath(projectName),
          'src/core/background-services',
        ),
        { recursive: true, force: true },
      );
      rmSync(
        path.join(
          resolveProjectPath(projectName),
          'src/core/utils/cron-expression-to-boolean.ts',
        ),
        { force: true },
      );
      rmSync(
        path.join(
          resolveProjectPath(projectName),
          'src/core/utils/person-list-cache.ts',
        ),
        { force: true },
      );
      rmSync(
        path.join(
          resolveProjectPath(projectName),
          'src/core/utils/build-list-cache-key.ts',
        ),
        { force: true },
      );
      rmSync(path.join(resolveProjectPath(projectName), 'src/host/bootstrap'), {
        recursive: true,
        force: true,
      });
      rmSync(
        path.join(
          resolveProjectPath(projectName),
          'src/host/controllers/health-check',
        ),
        { recursive: true, force: true },
      );
      rmSync(
        path.join(
          resolveProjectPath(projectName),
          'src/infra/services/database.indicator.service.ts',
        ),
        { force: true },
      );
      rmSync(
        path.join(
          resolveProjectPath(projectName),
          'src/infra/services/redis.indicator.service.ts',
        ),
        { force: true },
      );
      rmSync(
        path.join(
          resolveProjectPath(projectName),
          'src/infra/services/logged-user-info.service.ts',
        ),
        { force: true },
      );

      pruneCoreAuthForSlimTemplate(projectName);

      const projectPath = resolveProjectPath(projectName);
      const packageManager = getPackageManager(projectName);

      rmSync(path.join(projectPath, 'src/test/cli'), {
        recursive: true,
        force: true,
      });

      if (packageManager === 'bun') {
        cpSync(
          path.join(getSourceCodePath(), 'bunfig.toml'),
          path.join(projectPath, 'bunfig.toml'),
        );
      }

      for (const configFile of ['tsconfig.build.json', '.env.example']) {
        cpSync(
          path.join(getSourceCodePath(), configFile),
          path.join(projectPath, configFile),
        );
      }

      if (packageManager !== 'bun') {
        for (const configFile of ['vitest.config.ts', 'vitest.config.e2e.ts']) {
          cpSync(
            path.join(getSourceCodePath(), configFile),
            path.join(projectPath, configFile),
          );
        }
      }

      patchInfraModuleFile(projectName, false);
      patchMainFile(projectName, stripMainOptionalFeatures);

      if (!options.skipPackages) {
        await installPackages(projectName, CORE_PACKAGES);
      }

      if (template === Template.DEFAULT) {
        await removeSampleParts(projectName);
      } else {
        install('src/application/mapping', projectName);
        install('src/application/person', projectName);
        install('src/domain/entities', projectName);
        install('src/domain/repositories', projectName);
        install('src/domain/dtos', projectName);
        install('src/host/controllers/person', projectName);
        install('src/infra/repositories/person.repository.ts', projectName);
        install('src/infra/database/migrations', projectName);
      }
      break;
    }
    case Modules.AUTH: {
      install('src/application/auth', projectName);
      install('src/domain/dtos/logged-user-info.dto.ts', projectName);
      install('src/domain/services', projectName);
      install('src/domain/auth', projectName);
      install('src/domain/entities/user', projectName);
      install('src/domain/repositories/iuser.repository.ts', projectName);
      install('src/infra/auth', projectName);
      install('src/infra/repositories/user.repository.ts', projectName);
      install('src/infra/services/logged-user-info.service.ts', projectName);
      install('src/core/utils/hash-password.ts', projectName);
      install('src/core/utils/name-to-login.ts', projectName);

      const initMigration =
        'src/infra/database/migrations/1781281330533-Init.ts';
      if (
        !existsSync(path.join(resolveProjectPath(projectName), initMigration))
      ) {
        install(initMigration, projectName);
      }

      install('src/host/security', projectName);
      install('src/host/controllers/auth', projectName);
      install('src/host/controllers/oauth2', projectName);
      install('src/core/auth', projectName);
      install(
        'src/core/types/auth-provider-config-response.type.ts',
        projectName,
      );
      install(
        'src/host/decorators/scalar-token-endpoint.decorator.ts',
        projectName,
      );
      install(
        'src/host/decorators/restriction-by-profile.decorator.ts',
        projectName,
      );

      restoreDefineDocumentationWithAuth(projectName);

      if (!options.skipPackages) {
        await installPackages(projectName, AUTH_PACKAGES, AUTH_DEV_PACKAGES);
      }
      patchMainFile(projectName, patchMainForAuth);
      patchInfraModuleAuthFile(projectName);

      await patchAuthInstall(
        projectName,
        options.authStrategies?.length
          ? options.authStrategies
          : [AuthStrategy.JWT],
      );
      break;
    }
    case Modules.CACHE: {
      installCacheInfrastructure(projectName, options.withRedis ?? false);

      if (options.withRedis && !options.skipPackages) {
        await installPackages(projectName, CACHE_PACKAGES);
      }

      if (template === Template.CRUD_SAMPLE) {
        install('src/core/utils/person-list-cache.ts', projectName);
        install('src/core/utils/build-list-cache-key.ts', projectName);
      }
      break;
    }
    case Modules.HEALTH: {
      install('src/host/controllers/health-check', projectName);
      install('src/infra/services/database.indicator.service.ts', projectName);

      if (options.withRedisIndicator) {
        install('src/infra/services/redis.indicator.service.ts', projectName);
      } else {
        patchHealthCheckWithoutRedis(projectName);
      }

      patchAppModuleFile(projectName, patchAppModuleForHealth);
      if (!options.skipPackages) {
        await installPackages(projectName, HEALTH_PACKAGES);
      }
      break;
    }
    case Modules.INTERNAL_CRON_JOBS: {
      install('src/core/background-services/cron-service', projectName);
      install('src/core/utils/cron-expression-to-boolean.ts', projectName);
      if (!options.skipPackages) {
        await installPackages(projectName, CRON_PACKAGES);
      }
      break;
    }
    case Modules.INTERNAL_EVENT_JOBS: {
      install('src/core/background-services/event-service', projectName);
      break;
    }
  }
}

export function resolveProjectFeatures(
  features: ExtraFeature[],
  auth: AuthStrategy[],
): ProjectFeatures {
  const selected = new Set(features);
  const cacheWithRedis = selected.has(ExtraFeature.CACHE);
  const needsMemoryCache =
    cacheWithRedis ||
    auth.length > 0 ||
    selected.has(ExtraFeature.INTERNAL_CRON_JOBS);

  return {
    cache: needsMemoryCache,
    cacheWithRedis,
    cacheForCrud: cacheWithRedis,
    health: selected.has(ExtraFeature.HEALTH_CHECK),
    cronJobs: selected.has(ExtraFeature.INTERNAL_CRON_JOBS),
    eventJobs: selected.has(ExtraFeature.INTERNAL_EVENT_JOBS),
  };
}
