import { CreatePersonJob } from '@/domain/person/use-cases/create-person-job/create-person-job'
import { DeleteInactiveJob } from '@/domain/person/use-cases/delete-inative-job/delete-inactive-job'
import { InactivePersonHandler } from '@/domain/person/use-cases/events/inactive-person/inactive-person-handler'
import { KoalaApp } from '@koalarx/nest/core/koala-app'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { DbTransactionContext } from './database/db-transaction-context'

async function bootstrap() {
  const app = await NestFactory.create(AppModule).then((app) =>
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
      .build(),
  )

  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
