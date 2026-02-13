import { DbTransactionContext } from '@/infra/database/db-transaction-context'
import { setPrismaClientOptions } from '@koalarx/nest/core/database/prisma.service'
import { KoalaAppTest } from '@koalarx/nest/test/koala-app-test'
import { Test } from '@nestjs/testing'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'
import { AppTestModule } from './app-test.module'
import { pgClient } from './setup-e2e'

export async function createE2ETestApp() {
  const adapter = new PrismaPg(pgClient.pool)
  setPrismaClientOptions({ adapter })

  return Test.createTestingModule({ imports: [AppTestModule] })
    .compile()
    .then((moduleRef) => moduleRef.createNestApplication())
    .then((app) =>
      new KoalaAppTest(app)
        .setDbTransactionContext(DbTransactionContext)
        .enableCors()
        .build(),
    )
    .then((app) => app.init())
}
