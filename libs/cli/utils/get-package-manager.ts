import { readFileSync } from "node:fs";
import path from "node:path";
import type { PackageManager } from "../types";
import { resolveProjectPath } from "./resolve-project-pach";

export function getPackageManager(projectName: string): PackageManager {
  const packageJson = JSON.parse(
    readFileSync(
      path.join(resolveProjectPath(projectName), "package.json"),
      "utf8",
    ),
  );

  return packageJson.packageManager;
}
