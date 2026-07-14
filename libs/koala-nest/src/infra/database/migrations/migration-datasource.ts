import { DbContext } from '@/core/database/db-context';
import 'dotenv/config';
import './load-all-entities';
import path from 'node:path';
import { DataSource } from 'typeorm';

const root = process.cwd();
const schema = process.env.DATABASE_SCHEMA;

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ...(schema
    ? {
        schema,
        extra: { options: `-c search_path=${schema},public` },
      }
    : {}),
  entities: Array.from(DbContext.entities.values()),
  migrations: [path.join(root, 'src/infra/database/migrations/[0-9]*.{js,ts}')],
  migrationsTableName: 'migrations',
  migrationsTransactionMode: 'all',
});
