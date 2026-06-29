import { Type } from '@nestjs/common';
import { execSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { setE2EDatabaseContext } from '../e2e-context';
import { E2EDatabaseClient } from './e2e-database-client';

function resolveMigrationRunner(): string {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
    packageManager?: string;
  };

  const packageManager = packageJson.packageManager ?? 'bun';

  if (packageManager === 'bun') {
    return 'bun';
  }

  return 'node --import ts-node/register/transpile-only';
}

function generateUniqueSchemaConfig() {
  const schemaName = `e2e_${randomUUID().replace(/-/g, '_')}`;

  if (!process.env.DATABASE_URL) {
    throw new Error('Please provide a DATABASE_URL environment variable');
  }

  return {
    url: process.env.DATABASE_URL,
    schemaName,
  };
}

export async function createE2EDatabase<T extends E2EDatabaseClient>(
  clientInstance: Type<T>,
) {
  const { url, schemaName } = generateUniqueSchemaConfig();

  setE2EDatabaseContext(url, schemaName);

  const client = new clientInstance(url, schemaName);

  try {
    await client.createSchema(schemaName);

    const env = {
      ...process.env,
      DATABASE_URL: url,
      DATABASE_SCHEMA: schemaName,
      NODE_ENV: 'test',
    };
    const migrationRunner = resolveMigrationRunner();
    execSync(
      `${migrationRunner} ./node_modules/typeorm/cli.js migration:run -d ./src/infra/database/migrations/migration-datasource.ts`,
      {
        cwd: process.cwd(),
        env,
        stdio: 'inherit',
      },
    );

    return { client, schemaName };
  } catch (error) {
    try {
      await client.dropSchema();
    } catch {
      // schema pode não ter sido criado
    }

    console.error('Erro ao preparar schema e2e:', error);
    throw error;
  }
}
