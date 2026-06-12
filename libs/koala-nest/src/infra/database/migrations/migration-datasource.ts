import 'dotenv/config';
import path from 'node:path';
import { DataSource } from 'typeorm';

const root = process.cwd();

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [path.join(root, 'src/domain/entities/**/*.{js,ts}')],
  migrations: [path.join(root, 'src/infra/database/migrations/[0-9]*.{js,ts}')],
  migrationsTableName: 'migrations',
  migrationsTransactionMode: 'all',
});
