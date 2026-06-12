import path from "node:path";
import { getPackageRoot } from "./get-package-root";

export function getSourceCodePath(): string {
  return path.join(getPackageRoot(import.meta.url), "koala-nest");
}
