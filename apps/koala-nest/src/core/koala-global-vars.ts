import { Type } from "@nestjs/common"
import { PrismaTransactionalClient } from "./database/prisma-transactional-client"

export class KoalaGlobalVars {
  static appName: string = 'koala-nest'
  static internalUserName: string = 'internal'
  static dbTransactionContext?: Type<PrismaTransactionalClient>
}
