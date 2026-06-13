import { readFileSync } from "node:fs";
import path from "node:path";
import type { PackageManager } from "../types";
import { resolveProjectPath } from "./resolve-project-path";

export function getPackageManager(projectName: string): PackageManager {
  const packageJson = JSON.parse(
    readFileSync(
      path.join(resolveProjectPath(projectName), "package.json"),
      "utf8",
    ),
  ) as { packageManager?: string };

  const raw = packageJson.packageManager ?? "bun";
  const manager = raw.split("@")[0] as PackageManager;

  if (manager === "npm" || manager === "pnpm" || manager === "bun") {
    return manager;
  }

  return "bun";
}
