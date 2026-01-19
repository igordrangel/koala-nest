import fs from "node:fs"
import { execSync } from "node:child_process"

const config = JSON.parse(fs.readFileSync("package.json").toString());
const currentVersion = config.version;

if (fs.existsSync("dist")) {
  fs.rmSync("dist", { recursive: true });
}

execSync(`npm run build:lib`, { stdio: "inherit" });

const packageJson = JSON.parse(
  fs.readFileSync("apps/koala-nest/package.json", { encoding: "utf8" }).toString()
);

fs.writeFileSync(
  "dist/package.json",
  JSON.stringify(
    {
      ...packageJson,
      version: currentVersion,
      description: config.description,
      repository: {
        type: "git",
        url: "git+https://github.com/igordrangel/koala-nest.git",
      },
      keywords: config.keywords,
      author: "Igor D. Rangel",
      license: config.license,
      bugs: {
        url: "https://github.com/igordrangel/koala-nest/issues",
      },
      homepage: "https://github.com/igordrangel/koala-nest#readme",
      types: "./koala-nest.d.ts",
      peerDependencies: config.dependencies
    },
    null,
    2
  ),
  "utf8"
);
fs.writeFileSync(
  "dist/README.md",
  fs.readFileSync("README.md").toString(),
  "utf8"
);
fs.writeFileSync("dist/LICENSE", fs.readFileSync("LICENSE").toString(), "utf8");

// Copiar MCP Server para o dist
console.log("Copying MCP Server...");
execSync(`npm run build:mcp`, { stdio: "inherit" });

const mcpServerSource = "apps/mcp-server/dist";
const mcpServerDest = "dist/mcp-server";

if (!fs.existsSync(mcpServerDest)) {
  fs.mkdirSync(mcpServerDest, { recursive: true });
}

fs.cpSync(mcpServerSource, mcpServerDest, { recursive: true });

// Copiar docs para o dist (necessário para o MCP server funcionar)
console.log("Copying documentation...");
const docsSource = "docs";
const docsDest = "dist/docs";

if (!fs.existsSync(docsDest)) {
  fs.mkdirSync(docsDest, { recursive: true });
}

fs.cpSync(docsSource, docsDest, { recursive: true });

// Copiar arquivo de exemplo mcp.json
const mcpExampleSource = "apps/mcp-server/mcp.json.example";
const mcpExampleDest = "dist/mcp-server/mcp.json.example";

fs.copyFileSync(mcpExampleSource, mcpExampleDest);

console.log("Build completed");
