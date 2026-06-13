import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { patchGeneratedProjectConfig } from "../../utils/patch-generated-project.ts";
import { runCommand } from "../../utils/run-command";
import type { PackageManager } from "../../types";
import { configureTestRunner } from "./configure-test-runner.ts";

export async function createDDDStructure(
  projectName: string,
  packageManager: PackageManager,
): Promise<void> {
  const folders = [
    "src/application",
    "src/domain",
    "src/infra",
    "src/host",
    "src/core",
    "src/test",
  ];

  for (const folder of folders) {
    mkdirSync(path.join(process.cwd(), projectName, folder), {
      recursive: true,
    });
  }

  rmSync(path.join(process.cwd(), projectName, "test"), { recursive: true });
  rmSync(path.join(process.cwd(), projectName, "src/app.controller.spec.ts"));
  rmSync(path.join(process.cwd(), projectName, "src/app.controller.ts"));
  rmSync(path.join(process.cwd(), projectName, "src/app.module.ts"));
  rmSync(path.join(process.cwd(), projectName, "src/app.service.ts"));
  rmSync(path.join(process.cwd(), projectName, "src/main.ts"));

  const packageJson = JSON.parse(
    readFileSync(path.join(process.cwd(), projectName, "package.json"), "utf8"),
  );

  packageJson.packageManager = packageManager;

  const migrationDatasource =
    "-d ./src/infra/database/migrations/migration-datasource.ts";
  const typeormCli = "./node_modules/typeorm/cli.js";

  const migrationRunner =
    packageManager === "bun"
      ? "bun"
      : "node --import ts-node/register/transpile-only";

  packageJson.scripts["migration:generate"] =
    packageManager === "bun"
      ? "bun ./src/infra/database/migrations/generate-migration.ts"
      : "node --import ts-node/register/transpile-only ./src/infra/database/migrations/generate-migration.ts";
  packageJson.scripts["migration:run"] =
    `${migrationRunner} ${typeormCli} migration:run ${migrationDatasource}`;
  packageJson.scripts["migration:revert"] =
    `${migrationRunner} ${typeormCli} migration:revert ${migrationDatasource}`;

  packageJson.devDependencies ??= {};

  configureTestRunner(packageJson, packageManager);

  delete packageJson.scripts["test:cov"];
  delete packageJson.scripts["test:debug"];
  delete packageJson.scripts["test:e2e"];
  delete packageJson.jest;

  delete packageJson.devDependencies["@types/jest"];
  delete packageJson.devDependencies["@types/supertest"];
  delete packageJson.devDependencies["ts-jest"];
  delete packageJson.devDependencies["supertest"];

  writeFileSync(
    path.join(process.cwd(), projectName, "package.json"),
    JSON.stringify(packageJson, null, 2),
  );

  patchGeneratedProjectConfig(path.join(process.cwd(), projectName));

  await runCommand(
    [packageManager, "install"],
    path.join(process.cwd(), projectName),
  );
}
