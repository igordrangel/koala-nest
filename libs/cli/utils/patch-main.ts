export function stripMainOptionalFeatures(content: string) {
  return content
    .replace(/import cookieParser from 'cookie-parser';\n/, '')
    .replace(/\n {2}app\.use\(cookieParser\(\)\);\n/, '\n')
    .replace(
      /import \{ bootstrapKoalaJobs \} from '\.\/bootstrap\/koala-bootstrap';\n/,
      '',
    )
    .replace(/import \{ ConfigService \} from '@nestjs\/config';\n/, '')
    .replace(/import \{ Env \} from '@\/core\/env';\n/, '')
    .replace(
      /\n {2}const config = app\.get\(ConfigService<Env, true>\);\n\n {2}await bootstrapKoalaJobs\(app, \{[\s\S]*?\}\);\n/,
      '\n',
    );
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
      "  KoalaGlobalVars.internalUserName = 'integration.bot';\n",
      "  KoalaGlobalVars.internalUserName = 'integration.bot';\n\n  app.use(cookieParser());\n",
    );
}

export function patchMainForCronJobs(content: string) {
  if (content.includes('bootstrapKoalaJobs')) {
    return content;
  }

  return content
    .replace(
      "import { NestFactory } from '@nestjs/core';",
      "import { NestFactory } from '@nestjs/core';\nimport { ConfigService } from '@nestjs/config';\nimport { Env } from '@/core/env';\nimport { bootstrapKoalaJobs } from './bootstrap/koala-bootstrap';",
    )
    .replace(
      '  app.useGlobalFilters(new ErrorsFilter(httpAdapter, loggingService));\n',
      "  app.useGlobalFilters(new ErrorsFilter(httpAdapter, loggingService));\n\n  const config = app.get(ConfigService<Env, true>);\n\n  await bootstrapKoalaJobs(app, {\n    cronJobsEnabled: config.get('CRON_JOBS_ENABLED', { infer: true }),\n    bootstrapDelayMs: config.get('BOOTSTRAP_DELAY_MS', { infer: true }),\n  });\n",
    );
}
