/**
 * Este arquivo re-exporta o Prisma Client gerado do seu projeto.
 * 
 * Ele serve como um provider centralizado que permite à lib @koalarx/nest
 * acessar o PrismaClient sem depender de um caminho relativo fixo.
 */

export { PrismaClient, Prisma } from '../../prisma/generated/client'
export type { PrismaClientOptions } from '../../prisma/generated/internal/prismaNamespace'
