import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  mock,
} from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const runCommandCalls: { command: string[]; cwd: string }[] = [];

mock.module("../../../../cli/utils/run-command.ts", () => ({
  runCommand: async (command: string[], cwd = process.cwd()) => {
    runCommandCalls.push({ command, cwd });
  },
}));

mock.module("../../../../cli/utils/format-code.ts", () => ({
  formatCode: async () => {},
}));

const { installModule, Modules } = await import(
  "../../../../cli/utils/install-module.ts"
);

describe("installModule HEALTH", () => {
  let tempDir = "";
  let previousCwd = process.cwd();

  beforeEach(() => {
    runCommandCalls.length = 0;
    tempDir = mkdtempSync(path.join(os.tmpdir(), "koala-health-install-"));

    writeFileSync(
      path.join(tempDir, "package.json"),
      `${JSON.stringify({ name: "health-test", packageManager: "bun" }, null, 2)}\n`,
    );

    mkdirSync(path.join(tempDir, "src/host"), { recursive: true });
    writeFileSync(
      path.join(tempDir, "src/host/app.module.ts"),
      `import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({})],
})
export class AppModule {}
`,
    );

    previousCwd = process.cwd();
    process.chdir(tempDir);
  });

  afterEach(() => {
    process.chdir(previousCwd);
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("instala @nestjs/terminus e @nestjs/axios ao adicionar health-check", async () => {
    await installModule(Modules.HEALTH, "default", ".");

    const addCommand = runCommandCalls.find((call) => call.command[1] === "add");

    expect(addCommand).toBeDefined();
    expect(addCommand?.command[0]).toBe("bun");
    expect(addCommand?.command).toContain("@nestjs/terminus");
    expect(addCommand?.command).toContain("@nestjs/axios");
    expect(addCommand?.command).not.toContain("ioredis");
    expect(addCommand?.command).not.toContain("cron-parser");
  });

  it("copia arquivos do health-check e registra módulo no app", async () => {
    await installModule(Modules.HEALTH, "default", ".");

    expect(existsSync(path.join(tempDir, "src/host/controllers/health-check/health-check.controller.ts"))).toBe(true);
    expect(existsSync(path.join(tempDir, "src/infra/services/database.indicator.service.ts"))).toBe(true);

    const appModule = readFileSync(path.join(tempDir, "src/host/app.module.ts"), "utf8");
    expect(appModule).toContain("HealthCheckModule");
  });
});
