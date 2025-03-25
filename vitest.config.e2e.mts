import swc from "unplugin-swc";
import tsConfigPatchs from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    root: "./",
    include: ["**/*.e2e-spec.ts"],
    setupFiles: ["./apps/example/src/test/setup-e2e.ts"],
  },
  plugins: [
    tsConfigPatchs(),
    swc.vite({
      module: { type: "es6" },
    })
  ],
});
