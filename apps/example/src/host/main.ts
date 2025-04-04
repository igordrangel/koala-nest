import { CreatePersonJob } from '@/application/person/create-person-job/create-person-job'
import { DeleteInactiveJob } from '@/application/person/delete-inative-job/delete-inactive-job'
import { InactivePersonHandler } from '@/application/person/events/inactive-person/inactive-person-handler'
import { DbTransactionContext } from '@/infra/database/db-transaction-context'
import { KoalaApp } from '@koalarx/nest/core/koala-app'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
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
