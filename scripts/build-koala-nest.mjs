#!/usr/bin/env bun

import { cpSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.join(rootDir, "libs/koala-nest");
const outputDir = path.join(rootDir, "dist/koala-nest");

const EXCLUDED_DIRS = new Set(["node_modules", "dist", ".git"]);
const EXCLUDED_FILES = new Set(["bun.lock"]);

function buildKoalaNest() {
  rmSync(outputDir, { recursive: true, force: true });
  mkdirSync(outputDir, { recursive: true });

  cpSync(sourceDir, outputDir, {
    recursive: true,
    filter: (src) => {
      const relative = path.relative(sourceDir, src);
      if (!relative) return true;

      if (EXCLUDED_FILES.has(path.basename(src))) {
        return false;
      }

      return !relative.split(path.sep).some((part) => EXCLUDED_DIRS.has(part));
    },
  });

  console.log(`Build concluído: ${path.relative(rootDir, outputDir)}/`);
}

buildKoalaNest();
