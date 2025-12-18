import { AppModule } from '@/host/app.module'
import { DbTransactionContext } from '@/infra/database/db-transaction-context'
import { setPrismaClientOptions } from '@koalarx/nest/core/database/prisma.service'
import { KoalaAppTest } from '@koalarx/nest/test/koala-app-test'
import { Test } from '@nestjs/testing'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'
import { Pool } from 'pg'

export async function createE2ETestApp() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })
  const adapter = new PrismaPg(pool)
  setPrismaClientOptions({ adapter })

  return Test.createTestingModule({ imports: [AppModule] })
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
