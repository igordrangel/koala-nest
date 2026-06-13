import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import {
  AddArgKind,
  ExtraFeature,
  FEATURE_ALIASES,
  isAuthStrategy,
  ProjectMarker,
  resolveAuthStrategyFromModule,
  Template,
  type AuthStrategy as AuthStrategyType,
} from '@cli/constants/domain';
import { resolveProjectPath } from './resolve-project-path';

export type CacheLevel = false | 'memory' | 'redis';

export type ProjectState = {
  template: Template;
  auth: false | AuthStrategyType;
  cache: CacheLevel;
  health: boolean;
  cronJobs: boolean;
  eventJobs: boolean;
};

export function assertKoalaProject(projectName = ''): string {
  const root = resolveProjectPath(projectName);
  const envPath = path.join(root, 'src/core/env.ts');

  if (!existsSync(envPath)) {
    throw new Error(
      'Projeto Koala Nest não encontrado. Execute o comando na raiz do projeto (com src/core/env.ts).',
    );
  }

  return root;
}

function readProjectFile(projectName: string, relativePath: string) {
  return readFileSync(
    path.join(resolveProjectPath(projectName), relativePath),
    'utf8',
  );
}

export function detectProjectState(projectName = ''): ProjectState {
  assertKoalaProject(projectName);

  const appModule = readProjectFile(projectName, 'src/host/app.module.ts');
  const authModulePath = path.join(
    resolveProjectPath(projectName),
    'src/host/controllers/auth/auth.module.ts',
  );
  const authModule = existsSync(authModulePath)
    ? readFileSync(authModulePath, 'utf8')
    : '';

  const hasPersonModule =
    appModule.includes(ProjectMarker.PERSON_MODULE) ||
    existsSync(
      path.join(
        resolveProjectPath(projectName),
        'src/host/controllers/person/person.module.ts',
      ),
    );

  let auth: ProjectState['auth'] = false;

  if (
    existsSync(authModulePath) &&
    appModule.includes(ProjectMarker.SECURITY_MODULE)
  ) {
    auth = resolveAuthStrategyFromModule(authModule);
  }

  let cache: CacheLevel = false;
  const infraModule = readProjectFile(projectName, 'src/infra/infra.module.ts');

  if (infraModule.includes(ProjectMarker.CACHE_SERVICE_PROVIDER)) {
    const hasRedisFile = existsSync(
      path.join(
        resolveProjectPath(projectName),
        'src/infra/common/redis-cache.service.ts',
      ),
    );

    cache = hasRedisFile ? 'redis' : 'memory';
  }

  return {
    template: hasPersonModule ? Template.CRUD_SAMPLE : Template.DEFAULT,
    auth,
    cache,
    health: appModule.includes(ProjectMarker.HEALTH_CHECK_MODULE),
    cronJobs: existsSync(
      path.join(
        resolveProjectPath(projectName),
        'src/core/utils/cron-expression-to-boolean.ts',
      ),
    ),
    eventJobs: existsSync(
      path.join(
        resolveProjectPath(projectName),
        'src/core/background-services/event-service/event-handler.base.ts',
      ),
    ),
  };
}

export function listAvailableAddOptions(state: ProjectState) {
  const features: ExtraFeature[] = [];

  if (state.cache !== 'redis') {
    features.push(ExtraFeature.CACHE);
  }

  if (!state.health) {
    features.push(ExtraFeature.HEALTH_CHECK);
  }

  if (!state.cronJobs) {
    features.push(ExtraFeature.INTERNAL_CRON_JOBS);
  }

  if (!state.eventJobs) {
    features.push(ExtraFeature.INTERNAL_EVENT_JOBS);
  }

  return {
    auth: !state.auth,
    features,
  };
}

export type AddArg =
  | { kind: typeof AddArgKind.AUTH; strategy: AuthStrategyType }
  | { kind: typeof AddArgKind.FEATURE; feature: ExtraFeature };

export function parseAddArgs(args: string[]): AddArg[] {
  const parsed: AddArg[] = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]?.toLowerCase();

    if (!arg) {
      continue;
    }

    if (arg === AddArgKind.AUTH) {
      const strategy = args[index + 1]?.toLowerCase();

      if (!strategy || !isAuthStrategy(strategy)) {
        throw new Error(
          'Use: kl-nest add auth jwt  ou  kl-nest add auth oauth2',
        );
      }

      parsed.push({ kind: AddArgKind.AUTH, strategy });
      index += 1;
      continue;
    }

    const feature = FEATURE_ALIASES[arg];

    if (!feature) {
      throw new Error(
        `Opção desconhecida: "${args[index]}". Use: cache, auth, health, cron, events.`,
      );
    }

    parsed.push({ kind: AddArgKind.FEATURE, feature });
  }

  return parsed;
}

export function dedupeAddArgs(args: AddArg[]): AddArg[] {
  const seenFeatures = new Set<ExtraFeature>();
  const result: AddArg[] = [];

  for (const arg of args) {
    if (arg.kind === AddArgKind.AUTH) {
      if (!result.some((item) => item.kind === AddArgKind.AUTH)) {
        result.push(arg);
      }
      continue;
    }

    if (!seenFeatures.has(arg.feature)) {
      seenFeatures.add(arg.feature);
      result.push(arg);
    }
  }

  return result;
}
