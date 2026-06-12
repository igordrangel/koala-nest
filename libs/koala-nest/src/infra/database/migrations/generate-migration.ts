import { spawnSync } from 'node:child_process';
import path from 'node:path';

const isAutoName = !process.argv[2];
const timestamp = String(Date.now());
const name = process.argv[2] ?? `Migration-${timestamp}`;

const migrationPath = path.join('src/infra/database/migrations', name);
const command = [
  './node_modules/typeorm/cli.js',
  'migration:generate',
  migrationPath,
  '-d',
  './src/infra/database/migrations/migration-datasource.ts',
];

if (isAutoName) {
  command.push('-t', timestamp);
}

const result = spawnSync('bun', command, {
  stdio: 'inherit',
  cwd: process.cwd(),
});

process.exit(result.status ?? 1);
