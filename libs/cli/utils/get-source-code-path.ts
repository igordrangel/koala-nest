import path from "node:path";
import { fileURLToPath } from "node:url";

export function getSourceCodePath(): string {
  const currentFile = fileURLToPath(import.meta.url);
  const packageRoot = path.resolve(path.dirname(currentFile), "../../..");

  return path.join(packageRoot, "dist/koala-nest");
}
