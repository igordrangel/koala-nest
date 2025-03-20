import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { KoalaApp } from '@koalarx/nest/core/koala-app'

async function bootstrap() {
  const app = await NestFactory.create(AppModule).then((app) =>
    new KoalaApp(app)
      .includeSwagger({
        endpoint: '/',
        title: 'API de Demonstração',
        version: '1.0',
      })
      .enableCors()
      .build(),
  )

  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
