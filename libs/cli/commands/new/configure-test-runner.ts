import type { PackageManager } from "../../types";

export function configureTestRunner(
  packageJson: Record<string, unknown>,
  packageManager: PackageManager,
) {
  const scripts = packageJson.scripts as Record<string, string>;
  const devDependencies = packageJson.devDependencies as Record<string, string>;

  if (packageManager === "bun") {
    scripts.test = "bun test";
    scripts["test:watch"] = "bun test --watch";
    return;
  }

  scripts.test = "vitest run";
  scripts["test:watch"] = "vitest";
  devDependencies.vitest = "^4.1.8";
  devDependencies["vite-tsconfig-paths"] = "^5.1.4";
}
