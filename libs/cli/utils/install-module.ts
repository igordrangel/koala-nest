import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  AUTH_DEV_PACKAGES,
  AUTH_PACKAGES,
  CACHE_PACKAGES,
  CORE_PACKAGES,
  CRON_PACKAGES,
  devAddFlag,
  HEALTH_PACKAGES,
} from "../constants/core-packages";
import { getSourceCodePath } from "./get-source-code-path";
import { patchAppModuleForHealth } from "./patch-health-module";
import {
  patchInfraModuleForCache,
  stripInfraModuleCache,
} from "./patch-infra-module";
import { patchAuthInstall, type AuthStrategy } from "./patch-auth-install";
import {
  patchMainForAuth,
  patchMainForCronJobs,
  stripMainOptionalFeatures,
} from "./patch-main";
import { removeSampleParts } from "./remove-sample-parts";
import { resolveProjectPath } from "./resolve-project-path";
import { runCommand } from "./run-command";
import { getPackageManager } from "./get-package-manager";

export type Template = "default" | "crudSample";

export type InstallModuleOptions = {
  authStrategy?: AuthStrategy;
  withRedis?: boolean;
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

export enum Modules {
  CORE = "core",
  AUTH = "auth",
  CACHE = "cache",
  HEALTH = "health",
  INTERNAL_CRON_JOBS = "internal-cron-jobs",
  INTERNAL_EVENT_JOBS = "internal-event-jobs",
}

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
    await runCommand([packageManager, "add", ...packages], projectPath);
  }

  if (devPackages.length > 0) {
    await runCommand(
      [packageManager, "add", devAddFlag(packageManager), ...devPackages],
      projectPath,
    );
  }
}

function patchInfraModuleFile(projectName: string, withCache: boolean) {
  const infraModulePath = path.join(
    resolveProjectPath(projectName),
    "src/infra/infra.module.ts",
  );
  const content = readFileSync(infraModulePath, "utf8");

  writeFileSync(
    infraModulePath,
    withCache ? patchInfraModuleForCache(content) : stripInfraModuleCache(content),
  );
}

function patchAppModuleFile(
  projectName: string,
  replacer: (content: string) => string,
) {
  const appModulePath = path.join(
    resolveProjectPath(projectName),
    "src/host/app.module.ts",
  );

  writeFileSync(appModulePath, replacer(readFileSync(appModulePath, "utf8")));
}

function patchMainFile(projectName: string, replacer: (content: string) => string) {
  const mainPath = path.join(resolveProjectPath(projectName), "src/host/main.ts");
  writeFileSync(mainPath, replacer(readFileSync(mainPath, "utf8")));
}

function installCacheInfrastructure(projectName: string, withRedis: boolean) {
  install("src/domain/common/icache.service.ts", projectName);
  install("src/domain/common/ired-lock.service.ts", projectName);
  install("src/infra/common/in-memory-cache.service.ts", projectName);
  install("src/infra/common/cache-service.provider.ts", projectName);
  install("src/infra/common/red-lock.service.ts", projectName);

  if (withRedis) {
    install("src/infra/common/redis-cache.service.ts", projectName);
  } else {
    rmSync(
      path.join(
        resolveProjectPath(projectName),
        "src/infra/common/redis-cache.service.ts",
      ),
      { force: true },
    );

    let provider = readFileSync(
      path.join(
        resolveProjectPath(projectName),
        "src/infra/common/cache-service.provider.ts",
      ),
      "utf8",
    );

    provider = provider
      .replace(
        "import { RedisCacheService } from '@/infra/common/redis-cache.service';\n",
        "",
      )
      .replace(
        /const redisUrl = env\.get\('REDIS_CONNECTION_STRING'\);\n\n    this\.delegate = redisUrl\n      \? new RedisCacheService\(redisUrl, this\.resolveKeyPrefix\(env\)\)\n      : new InMemoryCacheService\(\);/,
        "this.delegate = new InMemoryCacheService();",
      );

    writeFileSync(
      path.join(
        resolveProjectPath(projectName),
        "src/infra/common/cache-service.provider.ts",
      ),
      provider,
    );
  }

  patchInfraModuleFile(projectName, true);
}

export async function installModule(
  module: Modules,
  template: Template,
  projectName = "",
  options: InstallModuleOptions = {},
): Promise<void> {
  switch (module) {
    case Modules.CORE: {
      install("src/application/common", projectName);
      install("src/application/mapping/mapping.provider.ts", projectName);
      install("src/core", projectName);
      install("src/domain/common/ilogging.service.ts", projectName);
      install("src/domain/dtos/pagination.dto.ts", projectName);
      install("src/domain/dtos/logged-user-info.dto.ts", projectName);
      install("src/domain/services", projectName);
      install("src/host/controllers/common", projectName);
      install("src/host/decorators", projectName);
      install("src/host/filters", projectName);
      install("src/host/open-api", projectName);
      install("src/host/app.module.ts", projectName);
      install("src/host/main.ts", projectName);
      install("src/infra/common/env.service.ts", projectName);
      install("src/infra/common/logging.service.ts", projectName);
      install("src/infra/services", projectName);
      install(
        "src/infra/database/migrations/generate-migration.ts",
        projectName,
      );
      install(
        "src/infra/database/migrations/migration-datasource.ts",
        projectName,
      );
      install("src/infra/database/data-source-factory.ts", projectName);
      install("src/infra/database/database.module.ts", projectName);
      install("src/infra/repositories/repository.base.ts", projectName);
      install("src/infra/repositories/repository.module.ts", projectName);
      install("src/infra/infra.module.ts", projectName);
      install("src/test", projectName);

      rmSync(
        path.join(resolveProjectPath(projectName), "src/core/background-services"),
        { recursive: true, force: true },
      );
      rmSync(
        path.join(resolveProjectPath(projectName), "src/core/utils/cron-expression-to-boolean.ts"),
        { force: true },
      );
      rmSync(
        path.join(resolveProjectPath(projectName), "src/core/utils/person-list-cache.ts"),
        { force: true },
      );
      rmSync(
        path.join(resolveProjectPath(projectName), "src/core/utils/build-list-cache-key.ts"),
        { force: true },
      );
      rmSync(
        path.join(resolveProjectPath(projectName), "src/host/bootstrap"),
        { recursive: true, force: true },
      );
      rmSync(
        path.join(resolveProjectPath(projectName), "src/host/controllers/health-check"),
        { recursive: true, force: true },
      );
      rmSync(
        path.join(resolveProjectPath(projectName), "src/infra/services/database.indicator.service.ts"),
        { force: true },
      );
      rmSync(
        path.join(resolveProjectPath(projectName), "src/infra/services/redis.indicator.service.ts"),
        { force: true },
      );

      const projectPath = resolveProjectPath(projectName);
      const packageManager = getPackageManager(projectName);

      rmSync(path.join(projectPath, "src/test/cli"), {
        recursive: true,
        force: true,
      });

      if (packageManager === "bun") {
        cpSync(
          path.join(getSourceCodePath(), "bunfig.toml"),
          path.join(projectPath, "bunfig.toml"),
        );
      } else {
        cpSync(
          path.join(getSourceCodePath(), "vitest.config.ts"),
          path.join(projectPath, "vitest.config.ts"),
        );
      }

      for (const configFile of ["tsconfig.build.json", ".env.example"]) {
        cpSync(
          path.join(getSourceCodePath(), configFile),
          path.join(projectPath, configFile),
        );
      }

      patchInfraModuleFile(projectName, false);
      patchMainFile(projectName, stripMainOptionalFeatures);

      await installPackages(projectName, CORE_PACKAGES);

      if (template === "default") {
        await removeSampleParts(projectName);
      } else {
        install("src/application/mapping", projectName);
        install("src/application/person", projectName);
        install("src/domain/entities", projectName);
        install("src/domain/repositories", projectName);
        install("src/domain/dtos", projectName);
        install("src/host/controllers/person", projectName);
        install("src/infra/repositories/person.repository.ts", projectName);
        install("src/infra/database/migrations", projectName);
      }
      break;
    }
    case Modules.AUTH: {
      install("src/application/auth", projectName);
      install("src/domain/auth", projectName);
      install("src/infra/auth", projectName);
      install("src/host/security", projectName);
      install("src/host/controllers/auth", projectName);
      install("src/host/controllers/oauth2", projectName);
      install("src/core/auth", projectName);
      install("src/core/types/auth-provider-config-response.type.ts", projectName);

      await installPackages(projectName, AUTH_PACKAGES, AUTH_DEV_PACKAGES);
      patchMainFile(projectName, patchMainForAuth);

      if (options.authStrategy) {
        await patchAuthInstall(projectName, options.authStrategy);
      }
      break;
    }
    case Modules.CACHE: {
      installCacheInfrastructure(projectName, options.withRedis ?? false);

      if (options.withRedis) {
        await installPackages(projectName, CACHE_PACKAGES);
      }

      if (template === "crudSample") {
        install("src/core/utils/person-list-cache.ts", projectName);
        install("src/core/utils/build-list-cache-key.ts", projectName);
      }
      break;
    }
    case Modules.HEALTH: {
      install("src/host/controllers/health-check", projectName);
      install("src/infra/services/database.indicator.service.ts", projectName);
      install("src/infra/services/redis.indicator.service.ts", projectName);
      patchAppModuleFile(projectName, patchAppModuleForHealth);
      await installPackages(projectName, HEALTH_PACKAGES);
      break;
    }
    case Modules.INTERNAL_CRON_JOBS: {
      install("src/core/background-services/cron-service", projectName);
      install("src/core/utils/cron-expression-to-boolean.ts", projectName);
      install("src/host/bootstrap/koala-bootstrap.ts", projectName);
      patchMainFile(projectName, patchMainForCronJobs);
      await installPackages(projectName, CRON_PACKAGES);
      break;
    }
    case Modules.INTERNAL_EVENT_JOBS: {
      install("src/core/background-services/event-service", projectName);

      const bootstrapPath = path.join(
        resolveProjectPath(projectName),
        "src/host/bootstrap/koala-bootstrap.ts",
      );

      if (!existsSync(bootstrapPath)) {
        install("src/host/bootstrap/koala-bootstrap.ts", projectName);
        patchMainFile(projectName, patchMainForCronJobs);
      }
      break;
    }
  }
}

export type ExtraFeature =
  | "cache"
  | "health-check"
  | "internal-cron-jobs"
  | "internal-event-jobs";

/** Incluídas automaticamente no template Exemplo de CRUD. */
export const CRUD_BUNDLED_FEATURES: readonly ExtraFeature[] = [
  "cache",
  "internal-cron-jobs",
  "internal-event-jobs",
];

export function mergeCrudSampleFeatures(features: ExtraFeature[]): ExtraFeature[] {
  return Array.from(new Set([...CRUD_BUNDLED_FEATURES, ...features]));
}

export function resolveNewProjectOptions(
  template: Template,
  auth: "none" | "jwt" | "oauth2",
  features: ExtraFeature[],
): { auth: "none" | "jwt" | "oauth2"; features: ExtraFeature[] } {
  if (template !== "crudSample") {
    return { auth, features };
  }

  return {
    auth: auth === "none" ? "jwt" : auth,
    features: mergeCrudSampleFeatures(features),
  };
}

export function mapExtraFeatureToModule(feature: ExtraFeature): Modules {
  switch (feature) {
    case "cache":
      return Modules.CACHE;
    case "health-check":
      return Modules.HEALTH;
    case "internal-cron-jobs":
      return Modules.INTERNAL_CRON_JOBS;
    case "internal-event-jobs":
      return Modules.INTERNAL_EVENT_JOBS;
  }
}

export function resolveProjectFeatures(
  features: ExtraFeature[],
  auth: "none" | "jwt" | "oauth2",
): ProjectFeatures {
  const selected = new Set(features);
  const cacheWithRedis = selected.has("cache");
  const needsMemoryCache =
    cacheWithRedis ||
    auth === "oauth2" ||
    selected.has("internal-cron-jobs");

  return {
    cache: needsMemoryCache,
    cacheWithRedis,
    cacheForCrud: cacheWithRedis,
    health: selected.has("health-check"),
    cronJobs: selected.has("internal-cron-jobs"),
    eventJobs: selected.has("internal-event-jobs"),
  };
}
