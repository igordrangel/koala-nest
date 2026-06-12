import { readFileSync } from "node:fs";
import path from "node:path";
import { getPackageRoot } from "../utils/get-package-root";

const packageJson = JSON.parse(
  readFileSync(path.join(getPackageRoot(import.meta.url), "package.json"), "utf8"),
) as { version: string };

export const CLI_VERSION = packageJson.version;
