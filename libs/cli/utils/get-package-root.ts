import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function isPackageRoot(dir: string): boolean {
  if (!existsSync(path.join(dir, "package.json"))) {
    return false;
  }

  return (
    existsSync(path.join(dir, "koala-nest")) ||
    existsSync(path.join(dir, "libs", "koala-nest"))
  );
}

export function getPackageRoot(fromUrl: string = import.meta.url): string {
  let dir = path.dirname(fileURLToPath(fromUrl));

  while (dir !== path.dirname(dir)) {
    if (isPackageRoot(dir)) {
      return dir;
    }

    dir = path.dirname(dir);
  }

  throw new Error("Não foi possível resolver a raiz do pacote koala-nest.");
}
