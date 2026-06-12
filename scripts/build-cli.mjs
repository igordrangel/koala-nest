#!/usr/bin/env bun

import { Glob } from "bun";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.join(rootDir, "libs/cli");
const outputDir = path.join(rootDir, "dist/cli");

const transpiler = new Bun.Transpiler({
  loader: "ts",
  target: "node",
});

function rewriteRelativeImports(code, source) {
  let output = code.replace(
    /(from\s+["'])(\.[^"']+)(["'])/g,
    (_, prefix, importPath, suffix) => {
      if (importPath.endsWith(".json")) {
        return `${prefix}${importPath}${suffix}`;
      }

      const normalized = importPath.endsWith(".ts")
        ? `${importPath.slice(0, -3)}.js`
        : `${importPath}.js`;

      return `${prefix}${normalized}${suffix}`;
    },
  );

  if (/with\s+\{\s*type:\s*["']json["']\s*\}/.test(source)) {
    output = output.replace(
      /import\s+(\w+)\s+from\s+["']([^"']+\.json)["']/g,
      'import $1 from "$2" with { type: "json" }',
    );
  }

  return output;
}

function buildCli() {
  rmSync(outputDir, { recursive: true, force: true });

  for (const file of new Glob("**/*.ts").scanSync(sourceDir)) {
    const sourcePath = path.join(sourceDir, file);
    const outputPath = path.join(outputDir, file.replace(/\.ts$/, ".js"));

    mkdirSync(path.dirname(outputPath), { recursive: true });

    const source = readFileSync(sourcePath, "utf8");
    let output = transpiler.transformSync(source);
    output = rewriteRelativeImports(output, source);

    if (file === "index.ts") {
      output = `#!/usr/bin/env node\n\n${output}`;
    }

    writeFileSync(outputPath, output, "utf8");
  }

  console.log(`Build concluído: ${path.relative(rootDir, outputDir)}/`);
}

buildCli();
