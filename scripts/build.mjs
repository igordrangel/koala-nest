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

  const rootPackage = JSON.parse(
    readFileSync(path.join(rootDir, "package.json"), "utf8"),
  );

  const publishPackage = {
    name: rootPackage.name,
    version: rootPackage.version,
    description: rootPackage.description,
    license: rootPackage.license,
    type: rootPackage.type,
    bin: {
      "kl-nest": "./cli/index.js",
    },
    repository: rootPackage.repository,
    publishConfig: rootPackage.publishConfig,
    files: ["cli", "koala-nest", "README.md"],
    dependencies: rootPackage.dependencies,
  };

  writeFileSync(
    path.join(distDir, "package.json"),
    `${JSON.stringify(publishPackage, null, 2)}\n`,
  );
}

runBuildScript("build-cli.mjs");
runBuildScript("build-koala-nest.mjs");
copyPackageMetadata();

console.log(`Build concluído: ${path.relative(rootDir, distDir)}/`);
