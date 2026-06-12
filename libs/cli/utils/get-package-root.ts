import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function getPackageRoot(fromUrl: string = import.meta.url): string {
  let dir = path.dirname(fileURLToPath(fromUrl));

  while (dir !== path.dirname(dir)) {
    if (
      existsSync(path.join(dir, "package.json")) &&
      existsSync(path.join(dir, "koala-nest"))
    ) {
      return dir;
    }

    dir = path.dirname(dir);
  }

  throw new Error("Não foi possível resolver a raiz do pacote koala-nest.");
}
