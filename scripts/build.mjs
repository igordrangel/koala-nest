#!/usr/bin/env bun

import { cpSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(rootDir, "dist");

function runBuildScript(scriptName) {
  const result = spawnSync(
    process.execPath,
    [path.join(rootDir, "scripts", scriptName)],
    {
      cwd: rootDir,
      stdio: "inherit",
    },
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function copyPackageMetadata() {
  cpSync(path.join(rootDir, "README.md"), path.join(distDir, "README.md"));

  const packageJson = JSON.parse(
    readFileSync(path.join(rootDir, "package.json"), "utf8"),
  );

  if (packageJson.bin?.["kl-nest"]) {
    packageJson.bin["kl-nest"] = packageJson.bin["kl-nest"].replace(
      /^\.\/dist\//,
      "./",
    );
  }

  writeFileSync(
    path.join(distDir, "package.json"),
    `${JSON.stringify(packageJson, null, 2)}\n`,
  );
}

runBuildScript("build-cli.mjs");
runBuildScript("build-koala-nest.mjs");
copyPackageMetadata();

console.log(`Build concluído: ${path.relative(rootDir, distDir)}/`);
