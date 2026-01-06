import 'dotenv/config'
import { Pool } from 'pg'

export async function dropE2EDatabase(schemaId: string) {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  const baseUrl = new URL(process.env.DATABASE_URL || '')
  baseUrl.pathname = '/postgres'
  const pool = new Pool({
    connectionString: baseUrl.toString(),
    idleTimeoutMillis: 100,
  })

  try {
    // Terminate all connections to the database
    await pool.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = '${schemaId}'
      AND pid <> pg_backend_pid()
    `)

    // Small delay to ensure connections are terminated
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Drop the database
    await pool.query(`DROP DATABASE IF EXISTS "${schemaId}"`)
  } catch {
    // Silently fail - connection may already be closed
  } finally {
    try {
      await pool.end()
    } catch {
      // Ignore pool end errors
    }
  }
}
