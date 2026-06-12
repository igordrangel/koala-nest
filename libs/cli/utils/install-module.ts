import { cpSync } from "node:fs";
import path from "node:path";
import { getSourceCodePath } from "./get-source-code-path";
import { removeSampleParts } from "./remove-sample-parts";
import { resolveProjectPath } from "./resolve-project-pach";
import { runCommand } from "./run-command";
import { getPackageManager } from "./get-package-manager";

export type Template = "default" | "crudSample";

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

  cpSync(koalaNestPath, projectPath, { recursive: true, force: true });
}

export async function installModule(
  module: Modules,
  template: Template,
  projectName = "",
): Promise<void> {
  switch (module) {
    case Modules.CORE: {
      install("src/application/common", projectName);
      install("src/application/mapping/mapping.provider.ts", projectName);
      install("src/core", projectName);
      install("src/domain/dtos/pagination.dto.ts", projectName);
      install("src/host/controllers/common", projectName);
      install("src/host/decorators", projectName);
      install("src/host/filters", projectName);
      install("src/host/open-api", projectName);
      install("src/host/app.module.ts", projectName);
      install("src/host/main.ts", projectName);
      install("src/infra/common/env.service.ts", projectName);
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

      await runCommand(
        [
          getPackageManager(projectName),
          "add",
          "@nestjs/config",
          "@nestjs/swagger",
          "typeorm",
          "pg",
          "zod",
          "@scalar/nestjs-api-reference",
        ],
        resolveProjectPath(projectName),
      );

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
    case Modules.AUTH:
      break;
    case Modules.CACHE:
      break;
  }
}
