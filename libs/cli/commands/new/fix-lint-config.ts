import { cpSync } from "node:fs";
import path from "node:path";
import { getSourceCodePath } from "../../utils/get-source-code-path";
import { resolveProjectPath } from "../../utils/resolve-project-pach";

export function fixLintConfig(projectName: string) {
  const eslintKoalaNestConfig = path.join(
    getSourceCodePath(),
    "eslint.config.mjs",
  );
  const eslintProjectConfig = path.join(
    resolveProjectPath(projectName),
    "eslint.config.mjs",
  );

  cpSync(eslintKoalaNestConfig, eslintProjectConfig, { force: true });
}
