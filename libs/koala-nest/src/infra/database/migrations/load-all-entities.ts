/**
 * Carrega dinamicamente todas as entidades para popular o DbContext.
 * Usado pelo migration-datasource no CLI (fora do Nest).
 */
import { readdirSync } from 'node:fs';
import path from 'node:path';

const entitiesRoot = path.join(process.cwd(), 'src/domain/entities');

function collectEntityFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === 'enums') {
        continue;
      }
      files.push(...collectEntityFiles(fullPath));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (!entry.name.endsWith('.ts') && !entry.name.endsWith('.js')) {
      continue;
    }

    if (entry.name.endsWith('.enum.ts') || entry.name.endsWith('.enum.js')) {
      continue;
    }

    files.push(fullPath);
  }

  return files;
}

try {
  for (const file of collectEntityFiles(entitiesRoot)) {
    try {
      require(file);
    } catch {
      // Ignora arquivos que não exportam entidades válidas
    }
  }
} catch {
  // Diretório de entidades ausente (ex.: template limpo)
}
