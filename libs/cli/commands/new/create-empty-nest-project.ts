import { rmSync } from "node:fs";
import path from "node:path";
import type { PackageManager } from "../../types";
import { runCommand } from "../../utils/run-command";

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

  await runCommand([
    command,
    "nest",
    "new",
    projectName,
    "--package-manager",
    "npm",
  ]);

  if (packageManager !== "npm") {
    rmSync(path.join(process.cwd(), projectName, "package-lock.json"));
    rmSync(path.join(process.cwd(), projectName, "node_modules"), {
      recursive: true,
    });
  }

  await runCommand(
    [packageManager, "install"],
    path.join(process.cwd(), projectName),
  );
}
