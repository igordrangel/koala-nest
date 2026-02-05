import { Type } from '@nestjs/common'
import 'dotenv/config'
import { execSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { E2EDatabaseClient } from './e2e-database-client'

function generateUniqueDatabaseURL() {
  const schemaId = randomUUID()

  if (!process.env.DATABASE_URL) {
    throw new Error('Please provider a DATABASE_URL environment variable')
  }

  const url = new URL(process.env.DATABASE_URL)
  url.pathname = `/${schemaId}`

  return {
    url: url.toString(),
    schemaId,
  }
}

export async function createE2EDatabase<T extends E2EDatabaseClient>(
  runtime: 'node' | 'bun' = 'node',
  clientInstance: Type<T>,
) {
  const { url, schemaId } = generateUniqueDatabaseURL()

  process.env.DATABASE_URL = url
  process.env.PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK = 'true'

  try {
    const client = new clientInstance(url, schemaId)

    await client.createDatabase(schemaId)

    // Executar migrations no novo banco com a variável de ambiente corrigida
    const env = { ...process.env, DATABASE_URL: url, DIRECT_URL: url }
    execSync(`${runtime}x prisma migrate deploy`, {
      cwd: process.cwd(),
      env,
      stdio: 'inherit',
    })

    return { client, schemaId }
  } catch (error) {
    console.error('Erro ao criar banco de dados e2e:', error)
    throw error
  }
}
