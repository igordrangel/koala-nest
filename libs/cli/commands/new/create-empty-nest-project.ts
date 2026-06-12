import { spawnSync } from "bun";
import type { PackageManager } from "../../types";

export async function createEmptyNestProject(
  projectName: string,
  packageManager: PackageManager,
): Promise<void> {
  let command = "";

  switch (packageManager) {
    case "bun":
      command = "bunx";
      break;
    case "npm":
      command = "npx";
      break;
    case "pnpm":
      command = "pnpx";
      break;
  }

  spawnSync(
    [command, "nest", "new", projectName, "--package-manager", packageManager],
    { cwd: process.cwd() },
  );
}
