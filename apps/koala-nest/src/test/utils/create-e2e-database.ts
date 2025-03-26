import 'dotenv/config'
import { execSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'

function generateUniqueDatabaseURL() {
  const schemaId = randomUUID()

  if (!process.env.DATABASE_URL) {
    throw new Error('Please provider a DATABASE_URL environment variable')
  }

  const url = new URL(process.env.DATABASE_URL)

  url.searchParams.set('schema', schemaId)

  return {
    url: url.toString(),
    schemaId,
  }
}

export function createE2EDatabase() {
  const { url, schemaId } = generateUniqueDatabaseURL()

  process.env.DATABASE_URL = url
  process.env.DIRECT_URL = url
  process.env.PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK = 'true'

  execSync('npx prisma migrate deploy', {})

  return schemaId
}
