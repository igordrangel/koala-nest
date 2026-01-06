import 'dotenv/config'
import { execSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { Pool } from 'pg'

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

export async function createE2EDatabase(runtime: 'node' | 'bun' = 'node') {
  const { url, schemaId } = generateUniqueDatabaseURL()

  process.env.DATABASE_URL = url
  process.env.DIRECT_URL = url
  process.env.PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK = 'true'

  try {
    // Conectar ao banco padrão para criar novo banco
    const baseUrl = new URL(process.env.DATABASE_URL)
    baseUrl.pathname = '/postgres'
    const pool = new Pool({ connectionString: baseUrl.toString() })

    try {
      // Criar banco de dados
      await pool.query(`CREATE DATABASE "${schemaId}"`)
    } finally {
      await pool.end()
    }

    // Executar migrations no novo banco com a variável de ambiente corrigida
    const env = { ...process.env, DATABASE_URL: url, DIRECT_URL: url }
    execSync(`${runtime}x prisma migrate deploy`, {
      cwd: process.cwd(),
      env,
      stdio: 'inherit',
    })
  } catch (error) {
    console.error('Erro ao criar banco de dados e2e:', error)
    throw error
  }

  return schemaId
}
