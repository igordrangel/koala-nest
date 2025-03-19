const fs = require("fs");
const { execSync } = require("child_process");
const config = JSON.parse(fs.readFileSync("package.json").toString());
const currentVersion = config.version;

if (fs.existsSync("dist")) {
  fs.rmSync("dist", { recursive: true });
}

execSync(`nest build`, { stdio: "inherit" });

const packageJson = JSON.parse(
  fs.readFileSync("src/package.json", { encoding: "utf8" }).toString()
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

console.log("Build completed");
