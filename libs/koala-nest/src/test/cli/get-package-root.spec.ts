import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "bun:test";
import { getPackageRoot } from "../../../../cli/utils/get-package-root.ts";

describe("getPackageRoot", () => {
  let tempDir = "";

  afterEach(() => {
    if (tempDir) {
      rmSync(tempDir, { recursive: true, force: true });
      tempDir = "";
    }
  });

  function probeFrom(relativeDir: string) {
    const dir = path.join(tempDir, relativeDir);
    mkdirSync(dir, { recursive: true });
    return new URL(`file://${path.join(dir, "probe.js")}`).href;
  }

  it("resolve pacote publicado com koala-nest na raiz", () => {
    tempDir = mkdtempSync(path.join(os.tmpdir(), "koala-nest-root-"));
    mkdirSync(path.join(tempDir, "koala-nest"), { recursive: true });
    writeFileSync(
      path.join(tempDir, "package.json"),
      `${JSON.stringify({ name: "@koalarx/nest", version: "1.0.0" }, null, 2)}\n`,
    );

    expect(getPackageRoot(probeFrom("cli/utils"))).toBe(tempDir);
  });

  it("resolve monorepo com libs/koala-nest", () => {
    tempDir = mkdtempSync(path.join(os.tmpdir(), "koala-nest-root-"));
    mkdirSync(path.join(tempDir, "libs", "koala-nest"), { recursive: true });
    writeFileSync(
      path.join(tempDir, "package.json"),
      `${JSON.stringify({ name: "@koalarx/nest", version: "1.0.0" }, null, 2)}\n`,
    );

    expect(getPackageRoot(probeFrom("libs/cli/utils"))).toBe(tempDir);
  });
});
