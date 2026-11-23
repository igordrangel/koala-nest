import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import {
  AGENTS_FILE_PATH,
  AGENTS_MARKER_PATH,
} from '@cli/constants/agents';
import {
  AddArgKind,
  AuthStrategy,
  ExtraFeature,
  FEATURE_ALIASES,
  isAuthStrategy,
  listMissingAuthStrategies,
  mergeAuthStrategies,
  ProjectMarker,
  resolveAuthStrategiesFromModule,
  Template,
  type AuthStrategy as AuthStrategyType,
} from '@cli/constants/domain';
import { resolveProjectPath } from './resolve-project-path';

export type CacheLevel = false | 'memory' | 'redis';

export type ProjectState = {
  template: Template;
  auth: false | AuthStrategyType[];
  cache: CacheLevel;
  health: boolean;
  cronJobs: boolean;
  eventJobs: boolean;
  queueJobs: boolean;
  agents: boolean;
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
    const securityModulePath = path.join(
      resolveProjectPath(projectName),
      'src/host/security/security.module.ts',
    );
    const securityModule = existsSync(securityModulePath)
      ? readFileSync(securityModulePath, 'utf8')
      : '';

    auth = resolveAuthStrategiesFromModule(authModule, {
      appModuleSource: appModule,
      securityModuleSource: securityModule,
    });
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

  const projectRoot = resolveProjectPath(projectName);

  return {
    template: hasPersonModule ? Template.CRUD_SAMPLE : Template.DEFAULT,
    auth,
    cache,
    health: appModule.includes(ProjectMarker.HEALTH_CHECK_MODULE),
    cronJobs: existsSync(
      path.join(projectRoot, 'src/core/utils/cron-expression-to-boolean.ts'),
    ),
    eventJobs: existsSync(
      path.join(
        projectRoot,
        'src/core/background-services/event-service/event-handler.base.ts',
      ),
    ),
    queueJobs: existsSync(
      path.join(
        projectRoot,
        'src/core/background-services/queue-service/queue.base.ts',
      ),
    ),
    agents:
      existsSync(path.join(projectRoot, AGENTS_FILE_PATH)) &&
      existsSync(path.join(projectRoot, AGENTS_MARKER_PATH)),
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

  if (!state.queueJobs) {
    features.push(ExtraFeature.QUEUE_JOBS);
  }

  const missing = listMissingAuthStrategies(state.auth);
  const installed = state.auth === false ? [] : state.auth;
  const hasHumanAuth =
    installed.includes(AuthStrategy.JWT) ||
    installed.includes(AuthStrategy.OAUTH2);

  return {
    authStrategies: missing.filter((strategy) => {
      if (strategy !== AuthStrategy.API_KEY) {
        return true;
      }

      return hasHumanAuth;
    }),
    features,
    /** Sempre disponível: `add agents` recria a estrutura por completo. */
    agents: true,
  };
}

export type AddArg =
  | {
      kind: typeof AddArgKind.AUTH;
      strategies: AuthStrategyType[];
      apiKeyInternalSubnet?: boolean;
    }
  | { kind: typeof AddArgKind.FEATURE; feature: ExtraFeature }
  | { kind: typeof AddArgKind.AGENTS };

export function parseAddArgs(args: string[]): AddArg[] {
  const parsed: AddArg[] = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]?.toLowerCase();

    if (!arg) {
      continue;
    }

    if (arg === AddArgKind.AUTH) {
      const strategies: AuthStrategyType[] = [];
      let cursor = index + 1;

      while (cursor < args.length) {
        const strategy = args[cursor]?.toLowerCase();

        if (!strategy || !isAuthStrategy(strategy)) {
          break;
        }

        strategies.push(strategy);
        cursor += 1;
      }

      if (strategies.length === 0) {
        throw new Error(
          'Use: kl-nest add auth jwt  ou  kl-nest add auth oauth2  ou  kl-nest add auth jwt api-key',
        );
      }

      let apiKeyInternalSubnet = false;

      if (args[cursor]?.toLowerCase() === '--api-key-internal-subnet') {
        apiKeyInternalSubnet = true;
        cursor += 1;
      }

      parsed.push({
        kind: AddArgKind.AUTH,
        strategies: Array.from(new Set(strategies)),
        apiKeyInternalSubnet,
      });
      index = cursor - 1;
      continue;
    }

    if (arg === AddArgKind.AGENTS) {
      parsed.push({ kind: AddArgKind.AGENTS });
      continue;
    }

    const feature = FEATURE_ALIASES[arg];

    if (!feature) {
      throw new Error(
        `Opção desconhecida: "${args[index]}". Use: cache, auth, health, cron, events, queue, agents.`,
      );
    }

    parsed.push({ kind: AddArgKind.FEATURE, feature });
  }

  return parsed;
}

export function dedupeAddArgs(args: AddArg[]): AddArg[] {
  const seenFeatures = new Set<ExtraFeature>();
  const authStrategies = new Set<AuthStrategyType>();
  let agents = false;
  let apiKeyInternalSubnet = false;
  const result: AddArg[] = [];

  for (const arg of args) {
    if (arg.kind === AddArgKind.AUTH) {
      for (const strategy of arg.strategies) {
        authStrategies.add(strategy);
      }

      if (arg.apiKeyInternalSubnet) {
        apiKeyInternalSubnet = true;
      }

      continue;
    }

    if (arg.kind === AddArgKind.AGENTS) {
      agents = true;
      continue;
    }

    if (!seenFeatures.has(arg.feature)) {
      seenFeatures.add(arg.feature);
      result.push(arg);
    }
  }

  if (authStrategies.size > 0) {
    result.unshift({
      kind: AddArgKind.AUTH,
      strategies: Array.from(authStrategies),
      apiKeyInternalSubnet,
    });
  }

  if (agents) {
    result.push({ kind: AddArgKind.AGENTS });
  }

  return result;
}

export { mergeAuthStrategies };
