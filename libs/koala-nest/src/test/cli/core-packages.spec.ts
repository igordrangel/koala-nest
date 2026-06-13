import { describe, expect, it } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  AUTH_DEV_PACKAGES,
  AUTH_PACKAGES,
  CACHE_PACKAGES,
  CORE_PACKAGES,
  CRON_PACKAGES,
  HEALTH_PACKAGES,
  devAddFlag,
} from "../../../../cli/constants/core-packages.ts";
import {
  mergeCrudSampleFeatures,
  resolveNewProjectOptions,
  resolveProjectFeatures,
} from "../../../../cli/utils/install-module.ts";
import { getPackageManager } from "../../../../cli/utils/get-package-manager.ts";

describe("core-packages", () => {
  it("instala apenas dependências essenciais no core", () => {
    expect(CORE_PACKAGES).toContain("@koalarx/utils");
    expect(CORE_PACKAGES).toContain("@scalar/nestjs-api-reference");
    expect(CORE_PACKAGES).not.toContain("cookie-parser");
    expect(CORE_PACKAGES).not.toContain("cron-parser");
    expect(CORE_PACKAGES).not.toContain("ioredis");
    expect(CORE_PACKAGES).not.toContain("@nestjs/terminus");
    expect(CORE_PACKAGES).not.toContain("@nestjs/axios");
  });

  it("agrupa pacotes por feature", () => {
    expect(AUTH_PACKAGES).toContain("@nestjs/jwt");
    expect(AUTH_PACKAGES).toContain("cookie-parser");
    expect(CACHE_PACKAGES).toEqual(["ioredis"]);
    expect(CRON_PACKAGES).toEqual(["cron-parser"]);
    expect(HEALTH_PACKAGES).toEqual(["@nestjs/terminus", "@nestjs/axios"]);
    expect(AUTH_DEV_PACKAGES).toContain("@types/cookie-parser");
  });

  it("usa flag de dev dependency por gerenciador", () => {
    expect(devAddFlag("bun")).toBe("-d");
    expect(devAddFlag("npm")).toBe("-D");
    expect(devAddFlag("pnpm")).toBe("-D");
  });
});

describe("resolveProjectFeatures", () => {
  it("instala cache em memória para OAuth2 sem marcar Redis", () => {
    const features = resolveProjectFeatures([], "oauth2");

    expect(features.cache).toBe(true);
    expect(features.cacheWithRedis).toBe(false);
    expect(features.cacheForCrud).toBe(false);
  });

  it("instala Redis apenas quando cache é selecionado", () => {
    const features = resolveProjectFeatures(["cache"], "none");

    expect(features.cache).toBe(true);
    expect(features.cacheWithRedis).toBe(true);
    expect(features.cacheForCrud).toBe(true);
  });

  it("cron jobs exigem cache em memória para RedLock", () => {
    const features = resolveProjectFeatures(["internal-cron-jobs"], "jwt");

    expect(features.cache).toBe(true);
    expect(features.cacheWithRedis).toBe(false);
    expect(features.cronJobs).toBe(true);
  });

  it("CRUD sem extras selecionados não instala cache nem jobs", () => {
    const features = resolveProjectFeatures([], "none");

    expect(features.cache).toBe(false);
    expect(features.cacheWithRedis).toBe(false);
    expect(features.cacheForCrud).toBe(false);
    expect(features.cronJobs).toBe(false);
    expect(features.eventJobs).toBe(false);
  });
});

describe("resolveNewProjectOptions", () => {
  it("força auth, cache Redis e jobs no template CRUD", () => {
    const resolved = resolveNewProjectOptions("crudSample", "none", []);

    expect(resolved.auth).toBe("jwt");
    expect(resolved.features).toEqual([
      "cache",
      "internal-cron-jobs",
      "internal-event-jobs",
    ]);
  });

  it("preserva estratégia de auth escolhida no CRUD", () => {
    const resolved = resolveNewProjectOptions("crudSample", "oauth2", [
      "health-check",
    ]);

    expect(resolved.auth).toBe("oauth2");
    expect(resolved.features).toEqual([
      "cache",
      "internal-cron-jobs",
      "internal-event-jobs",
      "health-check",
    ]);
  });

  it("não altera opções do template padrão", () => {
    const resolved = resolveNewProjectOptions("default", "none", ["health-check"]);

    expect(resolved.auth).toBe("none");
    expect(resolved.features).toEqual(["health-check"]);
  });
});

describe("mergeCrudSampleFeatures", () => {
  it("deduplica features bundled", () => {
    expect(
      mergeCrudSampleFeatures(["cache", "health-check", "internal-cron-jobs"]),
    ).toEqual([
      "cache",
      "internal-cron-jobs",
      "internal-event-jobs",
      "health-check",
    ]);
  });
});

describe("getPackageManager", () => {
  it("normaliza packageManager com versão", () => {
    const tempDir = mkdtempSync(path.join(os.tmpdir(), "koala-nest-cli-"));
    writeFileSync(
      path.join(tempDir, "package.json"),
      `${JSON.stringify({ packageManager: "bun@1.2.3" }, null, 2)}\n`,
    );

    const previousCwd = process.cwd();
    process.chdir(tempDir);

    try {
      expect(getPackageManager(".")).toBe("bun");
    } finally {
      process.chdir(previousCwd);
      rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
