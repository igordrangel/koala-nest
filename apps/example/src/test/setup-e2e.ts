import { createE2EDatabase } from '@koalarx/nest/test/utils/create-e2e-database'
import { E2EDatabaseClient } from '@koalarx/nest/test/utils/e2e-database-client'
import { delay } from '@koalarx/utils'
import { Pool } from 'pg'

export let pgClient: E2EPostgresClient

class E2EPostgresClient extends E2EDatabaseClient {
  private baseUrl: URL

  public pool: Pool

  constructor(url: string, schemaName: string) {
    super(url, schemaName)

    this.baseUrl = new URL(this.url)
    this.baseUrl.pathname = `/${this.schemaName}`

    this.pool = this.createSession()
  }

  private createSession(idleTimeout?: number) {
    return new Pool({
      connectionString: this.baseUrl.toString(),
      ...(idleTimeout ? { idleTimeoutMillis: idleTimeout } : {}),
    })
  }

  async createDatabase(schemaName: string): Promise<void> {
    this.baseUrl.pathname = `/postgres`

    const pool = this.createSession()

    await pool.query(`CREATE DATABASE "${schemaName}"`)
    await pool.end()

    this.baseUrl.pathname = `/${schemaName}`
  }

  async dropDatabase(): Promise<void> {
    await this.pool.end()

    await delay(1000)

    this.baseUrl.pathname = '/postgres'
    const pool = this.createSession(100)

    await pool.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = '${this.schemaName}'
      AND pid <> pg_backend_pid()
    `)

    await delay(500)

    await pool.query(`DROP DATABASE IF EXISTS "${this.schemaName}"`)
    await pool.end()
  }
}

beforeAll(async () => {
  const { client } = await createE2EDatabase('bun', E2EPostgresClient)
  pgClient = client
}, 60000)

afterAll(async () => {
  await pgClient.dropDatabase()
})
