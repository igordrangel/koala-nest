import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { runCommand } from "../../utils/run-command";
import type { PackageManager } from "../../types";

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

  delete packageJson.scripts.test;
  delete packageJson.scripts["test:watch"];
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

  await runCommand(
    [packageManager, "install"],
    path.join(process.cwd(), projectName),
  );
}
