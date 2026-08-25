import {
  AppType,
  AuthStrategy,
  ExtraFeature,
  Template,
  resolveNewProjectOptions,
} from '@cli/constants/domain';
import {
  AI_CONTEXT_AGENTS_PATH,
  AI_CONTEXT_CURSOR_RULE_PATHS,
  AI_CONTEXT_GITHUB_PATH,
} from '@cli/constants/ai-context';
import { resolveProjectFeatures } from '@cli/utils/install-module';

export type CacheLevel = false | 'memory' | 'redis';

export type AiContextExpectation = {
  cursor: boolean;
  github: boolean;
};

/** Estado esperado de um projeto gerado pela CLI (`new` / `add`). */
export type ProjectExpectation = {
  appType: AppType;
  template: Template;
  auth: false | readonly AuthStrategy[];
  cache: CacheLevel;
  health: boolean;
  cronJobs: boolean;
  eventJobs: boolean;
  queueJobs: boolean;
  aiContext?: AiContextExpectation;
};

/** Infraestrutura E2E presente em todo projeto gerado. */
export const E2E_INFRA_PATHS = [
  'src/test/setup-e2e.ts',
  'src/test/create-e2e-test-app.ts',
  'src/test/e2e-context.ts',
  'src/test/utils/create-e2e-database.ts',
  'src/test/utils/e2e-database-client.ts',
  'src/test/host/controllers/app/app.e2e.spec.ts',
] as const;

/** Exemplos E2E do template CRUD (Person + auth). */
export const CRUD_E2E_EXAMPLE_PATHS = [
  'src/test/host/controllers/person/person.controller.e2e.spec.ts',
  'src/test/host/controllers/person/lazy-loading.e2e.spec.ts',
  'src/test/host/controllers/auth/auth.controller.e2e.spec.ts',
  'src/test/app-auth-test.module.ts',
  'src/test/create-auth-e2e-test-app.ts',
] as const;

/** Workspace pronto para abrir no VS Code e subir a API. */
export const WORKSPACE_SETUP_PATHS = [
  '.vscode/launch.json',
  '.vscode/settings.json',
  '.vscode/tasks.json',
  '.vscode/extensions.json',
  '.env',
  'Dockerfile',
  'entrypoint.sh',
] as const;

/** Contexto AI gerado pela CLI (Cursor / GitHub Copilot). */
export const AI_CONTEXT_AGENTS_REQUIRED_PATHS = [AI_CONTEXT_AGENTS_PATH] as const;

export const AI_CONTEXT_CURSOR_REQUIRED_PATHS = [
  ...AI_CONTEXT_CURSOR_RULE_PATHS,
] as const;

export const AI_CONTEXT_GITHUB_REQUIRED_PATHS = [
  AI_CONTEXT_GITHUB_PATH,
] as const;

/** Núcleo comum a qualquer projeto Koala Nest. */
export const CORE_REQUIRED_PATHS = [
  'src/core/env.ts',
  'src/core/common/list-response.base.ts',
  'src/core/utils/initialize-undefined-array-props.ts',
  'src/host/main.ts',
  'src/host/app.module.ts',
  'src/host/jobs/jobs.module.ts',
  'src/host/jobs/jobs-bootstrap.service.ts',
  'src/infra/infra.module.ts',
  'src/infra/repositories/repository.module.ts',
  'src/infra/database/data-source-factory.ts',
  'src/infra/database/migrations/load-all-entities.ts',
  'src/infra/database/migrations/migration-datasource.ts',
  'src/infra/database/migrations/generate-migration.ts',
] as const;

/** Paths HTTP exclusivos do perfil API. */
export const CORE_API_REQUIRED_PATHS = [
  'src/core/http/rate-limit.middleware.ts',
  'src/core/utils/resolve-cors-origins.ts',
  'src/host/bootstrap/apply-http-middleware.ts',
  'src/host/open-api/define-documentation.ts',
] as const;

/** Paths HTTP que o Worker não deve ter. */
export const WORKER_FORBIDDEN_HTTP_PATHS = [
  ...CORE_API_REQUIRED_PATHS,
  'src/host/controllers/common/controller.base.ts',
  'src/test/utils/configure-test-app.ts',
] as const;

export const CORE_PACKAGE_DEPENDENCIES = [
  '@koalarx/utils',
  'zod',
  'typeorm',
  'tsc-alias',
] as const;

export const CORE_API_PACKAGE_DEPENDENCIES = [
  '@scalar/nestjs-api-reference',
  'helmet',
] as const;

/** Template default — sem exemplo Person. */
export const DEFAULT_TEMPLATE_FORBIDDEN_PATHS = [
  'src/host/controllers/person/person.module.ts',
  'src/infra/repositories/person.repository.ts',
] as const;

/** Template CRUD — exemplo Person completo. */
export const CRUD_TEMPLATE_REQUIRED_PATHS = [
  'src/host/controllers/person/person.module.ts',
  'src/host/controllers/person/delete-person.controller.ts',
  'src/application/person/jobs/cron/create-person.job.ts',
  'src/application/person/jobs/cron/delete-inactive.job.ts',
  'src/application/person/jobs/events/person/person-event.job.ts',
  'src/application/person/jobs/events/person/inactive-person/inactive-person.handler.ts',
  'src/application/person/jobs/events/person/inactive-person/inactive-person.event.ts',
] as const;

export const CRUD_TEMPLATE_FORBIDDEN_PATHS = [
  'src/application/person/events',
] as const;

export const CRUD_BUNDLED_PACKAGES = [
  'ioredis',
  'cron-parser',
] as const;

/** Cache Redis explícito (`--features cache`). */
export const CACHE_REDIS_REQUIRED_PATHS = [
  'src/infra/common/redis-cache.service.ts',
] as const;

export const CACHE_REDIS_PACKAGES = ['ioredis'] as const;

/** Health check (`--features health`). */
export const HEALTH_REQUIRED_PATHS = [
  'src/host/controllers/health-check/health-check.controller.ts',
  'src/infra/services/database.indicator.service.ts',
] as const;

export const HEALTH_REDIS_INDICATOR_PATH =
  'src/infra/services/redis.indicator.service.ts';

export const HEALTH_PACKAGES = ['@nestjs/terminus', '@nestjs/axios'] as const;

/** Cron jobs (`--features cron` / bundled no CRUD). */
export const CRON_REQUIRED_PATHS = [
  'src/core/utils/cron-expression-to-boolean.ts',
  'src/core/background-services/cron-service/cron-job.handler.base.ts',
] as const;

export const CRON_PACKAGES = ['cron-parser'] as const;

/** Event jobs (`--features events` / bundled no CRUD). */
export const EVENTS_REQUIRED_PATHS = [
  'src/core/background-services/event-service/event-handler.base.ts',
] as const;

/** Queue jobs (`--features queue`). */
export const QUEUE_REQUIRED_PATHS = [
  'src/core/background-services/queue-service/queue.base.ts',
  'src/domain/common/iqueue.service.ts',
  'src/infra/services/queue.service.ts',
  'src/test/services/queue.fake-service.ts',
] as const;

export const QUEUE_ENV_KEYS = [
  'QUEUE_MAX_CONCURRENCY',
  'QUEUE_CAPACITY_DELAY_MS',
  'QUEUE_IDLE_DELAY_MS',
  'QUEUE_ERROR_DELAY_MS',
] as const;

export const AUTH_JWT_PACKAGES = [
  '@nestjs/jwt',
  'passport-jwt',
  'passport-custom',
] as const;

/** Combinações representativas do comando `new` para testes parametrizados. */
export const CLI_NEW_SELECTION_MATRIX: readonly {
  label: string;
  appType?: AppType;
  template: Template;
  auth: readonly AuthStrategy[];
  features: readonly ExtraFeature[];
}[] = [
  {
    label: 'default sem auth',
    template: Template.DEFAULT,
    auth: [],
    features: [],
  },
  {
    label: 'worker sem extras',
    appType: AppType.WORKER,
    template: Template.DEFAULT,
    auth: [],
    features: [],
  },
  {
    label: 'worker + queue + cron',
    appType: AppType.WORKER,
    template: Template.DEFAULT,
    auth: [],
    features: [ExtraFeature.QUEUE_JOBS, ExtraFeature.INTERNAL_CRON_JOBS],
  },
  {
    label: 'default sem auth + health',
    template: Template.DEFAULT,
    auth: [],
    features: [ExtraFeature.HEALTH_CHECK],
  },
  {
    label: 'default sem auth + cache',
    template: Template.DEFAULT,
    auth: [],
    features: [ExtraFeature.CACHE],
  },
  {
    label: 'default sem auth + cron',
    template: Template.DEFAULT,
    auth: [],
    features: [ExtraFeature.INTERNAL_CRON_JOBS],
  },
  {
    label: 'default sem auth + events',
    template: Template.DEFAULT,
    auth: [],
    features: [ExtraFeature.INTERNAL_EVENT_JOBS],
  },
  {
    label: 'default sem auth + queue',
    template: Template.DEFAULT,
    auth: [],
    features: [ExtraFeature.QUEUE_JOBS],
  },
  {
    label: 'default sem auth + cache + health + cron + events',
    template: Template.DEFAULT,
    auth: [],
    features: [
      ExtraFeature.CACHE,
      ExtraFeature.HEALTH_CHECK,
      ExtraFeature.INTERNAL_CRON_JOBS,
      ExtraFeature.INTERNAL_EVENT_JOBS,
    ],
  },
  {
    label: 'default jwt',
    template: Template.DEFAULT,
    auth: [AuthStrategy.JWT],
    features: [],
  },
  {
    label: 'default oauth2',
    template: Template.DEFAULT,
    auth: [AuthStrategy.OAUTH2],
    features: [],
  },
  {
    label: 'default jwt + oauth2',
    template: Template.DEFAULT,
    auth: [AuthStrategy.JWT, AuthStrategy.OAUTH2],
    features: [],
  },
  {
    label: 'default jwt + cache + health',
    template: Template.DEFAULT,
    auth: [AuthStrategy.JWT],
    features: [ExtraFeature.CACHE, ExtraFeature.HEALTH_CHECK],
  },
  {
    label: 'crud jwt',
    template: Template.CRUD_SAMPLE,
    auth: [AuthStrategy.JWT],
    features: [],
  },
  {
    label: 'crud oauth2',
    template: Template.CRUD_SAMPLE,
    auth: [AuthStrategy.OAUTH2],
    features: [],
  },
  {
    label: 'crud jwt + oauth2',
    template: Template.CRUD_SAMPLE,
    auth: [AuthStrategy.JWT, AuthStrategy.OAUTH2],
    features: [],
  },
] as const;

export function buildProjectExpectation(
  template: Template,
  auth: readonly AuthStrategy[],
  features: readonly ExtraFeature[],
  aiContext: AiContextExpectation = { cursor: false, github: false },
  appType: AppType = AppType.API,
): ProjectExpectation {
  const resolved = resolveNewProjectOptions(
    template,
    [...auth],
    [...features],
    appType,
  );
  const projectFeatures = resolveProjectFeatures(
    resolved.features,
    resolved.auth,
  );

  let cache: CacheLevel = false;

  if (projectFeatures.cacheWithRedis) {
    cache = 'redis';
  } else if (projectFeatures.cache) {
    cache = 'memory';
  }

  return {
    appType,
    template,
    auth: resolved.auth.length === 0 ? false : resolved.auth,
    cache,
    health: projectFeatures.health,
    cronJobs: projectFeatures.cronJobs,
    eventJobs: projectFeatures.eventJobs,
    queueJobs: projectFeatures.queueJobs,
    aiContext,
  };
}

export function requiredPathsForExpectation(
  expectation: ProjectExpectation,
): readonly string[] {
  const paths: string[] = [
    ...CORE_REQUIRED_PATHS,
    ...WORKSPACE_SETUP_PATHS,
    ...E2E_INFRA_PATHS,
  ];

  if (expectation.appType === AppType.API) {
    paths.push(...CORE_API_REQUIRED_PATHS);
  }

  if (expectation.template === Template.CRUD_SAMPLE) {
    paths.push(...CRUD_TEMPLATE_REQUIRED_PATHS, ...CRUD_E2E_EXAMPLE_PATHS);
  }

  if (expectation.cache === 'redis') {
    paths.push(...CACHE_REDIS_REQUIRED_PATHS);
  }

  if (expectation.health) {
    paths.push(...HEALTH_REQUIRED_PATHS);

    if (expectation.cache === 'redis') {
      paths.push(HEALTH_REDIS_INDICATOR_PATH);
    }
  }

  if (expectation.cronJobs) {
    paths.push(...CRON_REQUIRED_PATHS);
  }

  if (expectation.eventJobs) {
    paths.push(...EVENTS_REQUIRED_PATHS);
  }

  if (expectation.queueJobs) {
    paths.push(...QUEUE_REQUIRED_PATHS);
  }

  const aiContext = expectation.aiContext ?? { cursor: false, github: false };

  if (aiContext.cursor || aiContext.github) {
    paths.push(...AI_CONTEXT_AGENTS_REQUIRED_PATHS);
  }

  if (aiContext.cursor) {
    paths.push(...AI_CONTEXT_CURSOR_REQUIRED_PATHS);
  }

  if (aiContext.github) {
    paths.push(...AI_CONTEXT_GITHUB_REQUIRED_PATHS);
  }

  return paths;
}

export function forbiddenPathsForExpectation(
  expectation: ProjectExpectation,
): readonly string[] {
  const paths: string[] = [];

  if (expectation.appType === AppType.WORKER) {
    paths.push(...WORKER_FORBIDDEN_HTTP_PATHS);
  }

  if (expectation.template === Template.DEFAULT) {
    paths.push(...DEFAULT_TEMPLATE_FORBIDDEN_PATHS, ...CRUD_E2E_EXAMPLE_PATHS);
  } else {
    paths.push(...CRUD_TEMPLATE_FORBIDDEN_PATHS);
  }

  if (expectation.cache !== 'redis') {
    paths.push(...CACHE_REDIS_REQUIRED_PATHS);
  }

  if (!expectation.health) {
    paths.push(...HEALTH_REQUIRED_PATHS, HEALTH_REDIS_INDICATOR_PATH);
  } else if (expectation.cache !== 'redis') {
    paths.push(HEALTH_REDIS_INDICATOR_PATH);
  }

  if (!expectation.cronJobs) {
    paths.push(...CRON_REQUIRED_PATHS);
  }

  if (!expectation.eventJobs) {
    paths.push(...EVENTS_REQUIRED_PATHS);
  }

  if (!expectation.queueJobs) {
    paths.push(...QUEUE_REQUIRED_PATHS);
  }

  const aiContext = expectation.aiContext ?? { cursor: false, github: false };

  if (!aiContext.cursor && !aiContext.github) {
    paths.push(...AI_CONTEXT_AGENTS_REQUIRED_PATHS);
  }

  if (!aiContext.cursor) {
    paths.push(...AI_CONTEXT_CURSOR_REQUIRED_PATHS);
  }

  if (!aiContext.github) {
    paths.push(...AI_CONTEXT_GITHUB_REQUIRED_PATHS);
  }

  return paths;
}

export function requiredPackagesForExpectation(
  expectation: ProjectExpectation,
): readonly string[] {
  const packages = new Set<string>(CORE_PACKAGE_DEPENDENCIES);

  if (expectation.appType === AppType.API) {
    for (const pkg of CORE_API_PACKAGE_DEPENDENCIES) {
      packages.add(pkg);
    }
  }

  if (expectation.cache === 'redis') {
    for (const pkg of CACHE_REDIS_PACKAGES) {
      packages.add(pkg);
    }
  }

  if (expectation.health) {
    for (const pkg of HEALTH_PACKAGES) {
      packages.add(pkg);
    }
  }

  if (expectation.cronJobs) {
    for (const pkg of CRON_PACKAGES) {
      packages.add(pkg);
    }
  }

  if (expectation.auth !== false) {
    for (const pkg of AUTH_JWT_PACKAGES) {
      packages.add(pkg);
    }
  }

  return [...packages];
}

/** Conteúdo obrigatório em `src/host/main.ts` (boot Nest). */
export const MAIN_MUST_CONTAIN = ['@koalarx/utils/prototypes'] as const;

export const MAIN_API_MUST_CONTAIN = [
  'NestFactory.create(AppModule)',
  'applyHttpMiddleware',
] as const;

export const MAIN_WORKER_MUST_CONTAIN = ['createApplicationContext'] as const;

export const MAIN_WORKER_MUST_NOT_CONTAIN = [
  'app.listen',
  'applyHttpMiddleware',
  'defineDocumentation',
] as const;

/** E2E Worker: TestingModule.compile() já é INestApplicationContext. */
export const WORKER_E2E_MUST_CONTAIN = [
  'Test.createTestingModule',
  '.compile()',
] as const;

export const WORKER_E2E_MUST_NOT_CONTAIN = [
  'createNestApplicationContext',
  'createNestApplication()',
] as const;

export function appModuleMustContain(
  expectation: ProjectExpectation,
): readonly string[] {
  const patterns = ['JobsModule.register'];

  if (expectation.template === Template.CRUD_SAMPLE) {
    patterns.push(
      'PersonModule',
      'InactivePersonHandler',
      'CreatePersonJob',
      'DeleteInactiveJob',
    );
  } else if (expectation.auth === false) {
    patterns.push('InfraModule', 'eventHandlers: []', 'cronJobs: []');
  } else {
    patterns.push('eventHandlers: []', 'cronJobs: []');
  }

  if (expectation.health) {
    patterns.push('HealthCheckModule');
  }

  if (expectation.auth !== false) {
    patterns.push('SecurityModule', 'AuthModule');
  }

  return patterns;
}

export function appModuleMustNotContain(
  expectation: ProjectExpectation,
): readonly string[] {
  const patterns: string[] = [];

  if (expectation.template === Template.DEFAULT) {
    patterns.push('PersonModule');
  }

  if (expectation.auth === false) {
    patterns.push('SecurityModule', 'AuthModule');
  }

  if (!expectation.health) {
    patterns.push('HealthCheckModule');
  }

  return patterns;
}

export function infraModuleMustContain(
  expectation: ProjectExpectation,
): readonly string[] {
  const patterns: string[] = [];

  if (expectation.cache !== false) {
    patterns.push('ICacheService', 'CacheServiceProvider');
  }

  if (expectation.queueJobs) {
    patterns.push('IQueueService', 'QueueService');
  }

  return patterns;
}

export function infraModuleMustNotContain(
  expectation: ProjectExpectation,
): readonly string[] {
  const patterns: string[] = [];

  if (expectation.cache === false) {
    patterns.push('ICacheService', 'CacheServiceProvider');
  }

  if (!expectation.queueJobs) {
    patterns.push('IQueueService', 'QueueService');
  }

  return patterns;
}

export function healthControllerMustContain(
  expectation: ProjectExpectation,
): readonly string[] {
  if (!expectation.health) {
    return [];
  }

  return expectation.cache === 'redis' ? ['RedisIndicator'] : [];
}

export function healthControllerMustNotContain(
  expectation: ProjectExpectation,
): readonly string[] {
  if (!expectation.health || expectation.cache === 'redis') {
    return [];
  }

  return ['RedisIndicator'];
}
