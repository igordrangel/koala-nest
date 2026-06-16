export function patchMainForAuth(content: string) {
  if (content.includes('applyHttpMiddleware')) {
    return content;
  }

  if (content.includes('cookieParser()')) {
    return content;
  }

  return content
    .replace(
      "import { NestFactory } from '@nestjs/core';",
      "import { NestFactory } from '@nestjs/core';\nimport cookieParser from 'cookie-parser';",
    )
    .replace(
      '  const app = await NestFactory.create(AppModule);\n',
      '  const app = await NestFactory.create(AppModule);\n\n  app.use(cookieParser());\n',
    );
}
