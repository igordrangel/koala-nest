import { cpSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { getSourceCodePath } from "../../utils/get-source-code-path";
import { resolveProjectPath } from "../../utils/resolve-project-pach";

export function fixLintConfig(projectName: string) {
  const tsconfigProjectContent = JSON.parse(
    readFileSync(path.join(getSourceCodePath(), "tsconfig.json"), "utf8"),
  );

  tsconfigProjectContent.paths = {
    "@/*": ["./src/*"],
  };

  writeFileSync(
    path.join(resolveProjectPath(projectName), "tsconfig.json"),
    JSON.stringify(tsconfigProjectContent, null, 2),
  );

  const eslintKoalaNestConfig = path.join(
    getSourceCodePath(),
    "eslint.config.mjs",
  );
  const eslintProjectConfig = path.join(
    resolveProjectPath(projectName),
    "eslint.config.mjs",
  );

  cpSync(eslintKoalaNestConfig, eslintProjectConfig, { force: true });

  const packageJsonProjectContent = JSON.parse(
    readFileSync(
      path.join(resolveProjectPath(projectName), "package.json"),
      "utf8",
    ),
  );

  packageJsonProjectContent.scripts.lint = 'eslint "src/**/*.ts" --fix';
  packageJsonProjectContent.scripts.format = 'prettier --write "src/**/*.ts"';

  writeFileSync(
    path.join(resolveProjectPath(projectName), "package.json"),
    JSON.stringify(packageJsonProjectContent, null, 2),
  );
}
