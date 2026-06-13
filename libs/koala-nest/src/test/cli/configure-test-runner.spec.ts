import { describe, expect, it } from "bun:test";
import { configureTestRunner } from "../../../../cli/commands/new/configure-test-runner.ts";

describe("configureTestRunner", () => {
  it("configura Bun test para projetos com bun", () => {
    const packageJson = {
      scripts: {} as Record<string, string>,
      devDependencies: {} as Record<string, string>,
    };

    configureTestRunner(packageJson, "bun");

    expect(packageJson.scripts.test).toBe("bun test");
    expect(packageJson.scripts["test:watch"]).toBe("bun test --watch");
    expect(packageJson.devDependencies.vitest).toBeUndefined();
  });

  it("configura Vitest para npm e pnpm", () => {
    const packageJson = {
      scripts: {} as Record<string, string>,
      devDependencies: {} as Record<string, string>,
    };

    configureTestRunner(packageJson, "npm");

    expect(packageJson.scripts.test).toBe("vitest run");
    expect(packageJson.scripts["test:watch"]).toBe("vitest");
    expect(packageJson.devDependencies.vitest).toBe("^4.1.8");
    expect(packageJson.devDependencies["vite-tsconfig-paths"]).toBe("^5.1.4");
  });
});
