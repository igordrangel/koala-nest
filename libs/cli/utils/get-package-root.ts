import path from "node:path";
import { fileURLToPath } from "node:url";

export function getPackageRoot(fromUrl: string = import.meta.url): string {
  return path.resolve(path.dirname(fileURLToPath(fromUrl)), "../..");
}
