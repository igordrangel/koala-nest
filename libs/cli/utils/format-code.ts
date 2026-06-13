import { getPackageManager } from "./get-package-manager";
import { resolveProjectPath } from "./resolve-project-path";
import { runCommand } from "./run-command";

export async function formatCode(projectName: string) {
  await runCommand(
    [getPackageManager(projectName), "run", "lint"],
    resolveProjectPath(projectName),
  );

  await runCommand(
    [getPackageManager(projectName), "run", "format"],
    resolveProjectPath(projectName),
  );
}
