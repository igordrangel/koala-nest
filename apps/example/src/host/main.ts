import 'dotenv/config'
import { CreatePersonJob } from '@/application/person/create-person-job/create-person-job'
import { DeleteInactiveJob } from '@/application/person/delete-inative-job/delete-inactive-job'
import { InactivePersonHandler } from '@/application/person/events/inactive-person/inactive-person-handler'
import { DbTransactionContext } from '@/infra/database/db-transaction-context'
import { KoalaApp } from '@koalarx/nest/core/koala-app'
import { setPrismaClientOptions } from '@koalarx/nest/core/database/prisma.service'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  // Configurar o adapter PostgreSQL antes de inicializar a aplicação
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })
  const adapter = new PrismaPg(pool)
  setPrismaClientOptions({ adapter })

  return NestFactory.create(AppModule).then((app) =>
    new KoalaApp(app)
      .useDoc({
        ui: 'scalar',
        endpoint: '/doc',
        title: 'API de Demonstração',
        version: '1.0',
      })
      .addCronJob(CreatePersonJob)
      .addCronJob(DeleteInactiveJob)
      .addEventJob(InactivePersonHandler)
      .setAppName('example')
      .setInternalUserName('integration.bot')
      .setDbTransactionContext(DbTransactionContext)
      .enableCors()
      .buildAndServe(),
  )
}
bootstrap()
