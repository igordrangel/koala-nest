import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { defineDocumentation } from './open-api/define-documentation';
import { ErrorsFilter } from './filters/errors.filter';
import { HttpAdapterHost } from '@nestjs/core';
import { AuthGuard } from './security/guards/auth.guard';
import { ProfilesGuard } from './security/guards/profiles.guard';
import { ILoggingService } from '@/domain/common/ilogging.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    credentials: true,
    origin: true,
    optionsSuccessStatus: 200,
  });

  await defineDocumentation(app);

  const { httpAdapter } = app.get(HttpAdapterHost);
  const loggingService = app.get(ILoggingService);
  app.useGlobalFilters(new ErrorsFilter(httpAdapter, loggingService));

  app.useGlobalGuards(
    await app.resolve(AuthGuard),
    await app.resolve(ProfilesGuard),
  );

  await app.listen(process.env.PORT || 3000);

  console.log(`Server is running on port ${process.env.PORT || 3000}`);
  console.log(
    `Documentation is available at http://localhost:${process.env.PORT || 3000}/doc`,
  );
}

bootstrap();
