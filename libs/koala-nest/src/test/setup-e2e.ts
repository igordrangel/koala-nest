import 'reflect-metadata';
import { createE2EDatabase } from '@/test/utils/create-e2e-database';
import { E2EDatabaseClient } from '@/test/utils/e2e-database-client';
import { Pool } from 'pg';

class E2EPostgresClient extends E2EDatabaseClient {
  public pool: Pool;

  constructor(url: string, schemaName: string) {
    super(url, schemaName);
    this.pool = new Pool({ connectionString: url });
  }

  async createSchema(schemaName: string): Promise<void> {
    await this.pool.query(`CREATE SCHEMA "${schemaName}"`);
  }

  async dropSchema(): Promise<void> {
    await this.pool.query(`DROP SCHEMA IF EXISTS "${this.schemaName}" CASCADE`);
    await this.pool.end();
  }
}

const { client } = await createE2EDatabase(E2EPostgresClient);
export const pgClient = client;

afterAll(async () => {
  await pgClient.dropSchema();
});
