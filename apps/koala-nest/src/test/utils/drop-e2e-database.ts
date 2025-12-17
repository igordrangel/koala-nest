import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

export function dropE2EDatabase(schemaId: string) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  return prisma
    .$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`)
    .finally(() => prisma.$disconnect())
}
