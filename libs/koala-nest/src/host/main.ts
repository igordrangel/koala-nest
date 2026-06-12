import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { defineDocumentation } from './open-api/define-documentation';
import { ErrorsFilter } from './filters/errors.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    credentials: true,
    origin: true,
    optionsSuccessStatus: 200,
  });

  defineDocumentation(app);

  app.useGlobalFilters(new ErrorsFilter());

  await app.listen(process.env.PORT || 3000);

  console.log(`Server is running on port ${process.env.PORT || 3000}`);
  console.log(
    `Documentation is available at http://localhost:${process.env.PORT || 3000}/doc`,
  );
}

bootstrap();
