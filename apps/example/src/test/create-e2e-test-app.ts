import 'dotenv/config'
import { AppModule } from '@/host/app.module'
import { DbTransactionContext } from '@/infra/database/db-transaction-context'
import { KoalaAppTest } from '@koalarx/nest/test/koala-app-test'
import { setPrismaClientOptions } from '@koalarx/nest/core/database/prisma.service'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { Test } from '@nestjs/testing'

export async function createE2ETestApp() {
  // Configurar o adapter PostgreSQL antes de criar o módulo de teste
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
