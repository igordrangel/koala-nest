export function stripMainOptionalFeatures(content: string) {
  return content
    .replace(/import cookieParser from 'cookie-parser';\n/, '')
    .replace(/\n {2}app\.use\(cookieParser\(\)\);\n/, '\n');
}

export function patchMainForAuth(content: string) {
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
