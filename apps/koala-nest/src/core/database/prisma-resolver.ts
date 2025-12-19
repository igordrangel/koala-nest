/**
 * Resolver automático para o Prisma Client do projeto consumidor
 * Tenta múltiplos caminhos para encontrar o cliente gerado
 */
import * as path from 'path'
import * as fs from 'fs'

let cachedPrismaClient: any = null

function findPrismaClient(): string | null {
  // Lista de caminhos possíveis onde o Prisma pode estar
  const possiblePaths = [
    // Quando a lib está em node_modules, procura no projeto consumidor
    path.join(process.cwd(), 'prisma/generated/client.js'),
    path.join(process.cwd(), 'prisma/generated/client.ts'),
    // Tenta encontrar via require.main
    ...(require.main?.filename
      ? [
          path.join(
            path.dirname(require.main.filename),
            '../prisma/generated/client.js',
          ),
          path.join(
            path.dirname(require.main.filename),
            '../prisma/generated/client.ts',
          ),
        ]
      : []),
    // Quando rodando localmente (desenvolvimento)
    path.join(__dirname, '../../../prisma/generated/client.js'),
    path.join(__dirname, '../../../prisma/generated/client.ts'),
  ]

  for (const prismaPath of possiblePaths) {
    if (fs.existsSync(prismaPath)) {
      return prismaPath
    }
  }

  return null
}

async function resolvePrismaClient() {
  if (cachedPrismaClient) {
    return cachedPrismaClient
  }

  const prismaPath = findPrismaClient()

  if (!prismaPath) {
    throw new Error(
      `
      Não foi possível carregar o Prisma Client automaticamente.
      
      Certifique-se de que você:
      1. Executou 'bunx prisma generate' no seu projeto
      2. Tem a pasta 'prisma/generated/client' no seu projeto
      3. A lib @koalarx/nest está instalada como dependência
      
      Se o problema persistir, você pode registrar manualmente o Prisma Client:
      
      import { setPrismaClient } from '@koalarx/nest'
      import { PrismaClient } from './prisma/generated/client'
      
      setPrismaClient(PrismaClient)
      `.trim(),
    )
  }

  try {
    // Carrega dinamicamente o módulo
    cachedPrismaClient = await import(prismaPath)
    return cachedPrismaClient
  } catch (error) {
    throw new Error(
      `
      Erro ao carregar o Prisma Client de ${prismaPath}:
      ${error instanceof Error ? error.message : String(error)}
      
      Certifique-se de que 'bunx prisma generate' foi executado com sucesso.
      `.trim(),
    )
  }
}

// Variável global para registro manual
let manualPrismaClient: any = null

export function setPrismaClient(prismaClientClass: any) {
  manualPrismaClient = prismaClientClass
  cachedPrismaClient = null // Limpa cache
}

export function getPrismaClientClass() {
  if (manualPrismaClient) {
    return manualPrismaClient
  }
  // Retorna uma função que resolve o cliente quando necessário
  return resolvePrismaClient()
}
