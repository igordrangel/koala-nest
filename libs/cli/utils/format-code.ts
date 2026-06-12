import { getPackageManager } from "./get-package-manager";
import { resolveProjectPath } from "./resolve-project-pach";
import { runCommand } from "./run-command";

export function formatCode(projectName: string) {
  console.log(resolveProjectPath(projectName));
  return runCommand(
    [getPackageManager(projectName), "run", "format"],
    resolveProjectPath(projectName),
  );
}
