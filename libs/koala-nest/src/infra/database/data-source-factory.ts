import { DbContext } from '@/core/database/db-context';
import { EnvService } from '@/infra/common/env.service';
import path from 'node:path';
import { DataSource } from 'typeorm';

export const DATA_SOURCE_PROVIDER_TOKEN = 'DATA_SOURCE';

export async function dataSourceFactory(env: EnvService) {
  const dataSource = new DataSource({
    type: 'postgres',
    url: env.get('DATABASE_URL'),
    schema: env.get('DATABASE_SCHEMA'),
    entities: Array.from(DbContext.entities.values()),
    migrations: [path.join(__dirname, 'migrations', '[0-9]*.{ts,js}')],
    migrationsTableName: 'migrations',
    migrationsTransactionMode: 'all',
    invalidWhereValuesBehavior: {
      undefined: 'ignore',
    },
  });

  await dataSource.initialize();
  await dataSource.runMigrations();

  return dataSource;
}
