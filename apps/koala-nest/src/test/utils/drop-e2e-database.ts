import { PrismaClient } from '@prisma/client'

export function dropE2EDatabase(schemaId: string) {
  return new PrismaClient().$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`)
}