import { Type } from '@nestjs/common';
import { execSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { setE2EDatabaseUrl } from '../e2e-context';
import { E2EDatabaseClient } from './e2e-database-client';

function generateUniqueDatabaseURL() {
  const schemaId = randomUUID();

  if (!process.env.DATABASE_URL) {
    throw new Error('Please provide a DATABASE_URL environment variable');
  }

  const url = new URL(process.env.DATABASE_URL);
  url.pathname = `/${schemaId}`;

  return {
    url: url.toString(),
    schemaId,
  };
}

export async function createE2EDatabase<T extends E2EDatabaseClient>(
  clientInstance: Type<T>,
) {
  const { url, schemaId } = generateUniqueDatabaseURL();

  setE2EDatabaseUrl(url);

  try {
    const client = new clientInstance(url, schemaId);

    await client.createDatabase(schemaId);

    const env = { ...process.env, DATABASE_URL: url, NODE_ENV: 'test' };
    execSync(
      'bun ./node_modules/typeorm/cli.js migration:run -d ./src/infra/database/migrations/migration-datasource.ts',
      {
        cwd: process.cwd(),
        env,
        stdio: 'inherit',
      },
    );

    return { client, schemaId };
  } catch (error) {
    console.error('Erro ao criar banco de dados e2e:', error);
    throw error;
  }
}
