/**
 * Carrega dinamicamente todas as entidades para popular o DbContext.
 * Usado pelo migration-datasource no CLI (fora do Nest).
 */
import { readdirSync } from 'node:fs';
import path from 'node:path';

const entitiesRoot = path.join(process.cwd(), 'src/domain/entities');

function isMissingPathError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as NodeJS.ErrnoException).code === 'ENOENT'
  );
}

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
    require(file);
  }
} catch (error) {
  // Diretório ausente (ex.: template limpo); demais erros sobem para o CLI.
  if (!isMissingPathError(error)) {
    throw error;
  }
}
