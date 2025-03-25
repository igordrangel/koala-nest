import { AppModule } from '@/infra/app.module'
import { DbTransactionContext } from '@/infra/database/db-transaction-context'
import { KoalaAppTest } from '@koalarx/nest/test/koala-app-test'
import { Test } from '@nestjs/testing'

export async function createAppTest() {
  return Test
    .createTestingModule({ imports: [AppModule] })    
    .compile()
    .then((moduleRef) => moduleRef.createNestApplication())
    .then((app) => new KoalaAppTest(app)
      .setDbTransactionContext(DbTransactionContext)
      .enableCors()
      .build()
    )
    .then((app) => app.init())
}