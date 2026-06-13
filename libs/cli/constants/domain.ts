/** Template de projeto gerado pela CLI. */
export const Template = {
  DEFAULT: 'default',
  CRUD_SAMPLE: 'crudSample',
} as const;

export type Template = (typeof Template)[keyof typeof Template];

/** Escolha de autenticação no `kl-nest new`. */
export const AuthChoice = {
  NONE: 'none',
  JWT: 'jwt',
  OAUTH2: 'oauth2',
} as const;

export type AuthChoice = (typeof AuthChoice)[keyof typeof AuthChoice];

/** Estratégia instalada pelo módulo auth (sem `none`). */
export const AuthStrategy = {
  JWT: AuthChoice.JWT,
  OAUTH2: AuthChoice.OAUTH2,
} as const;

export type AuthStrategy = (typeof AuthStrategy)[keyof typeof AuthStrategy];

/** Features opcionais expostas na CLI (`new` / `add`). */
export const ExtraFeature = {
  CACHE: 'cache',
  HEALTH_CHECK: 'health-check',
  INTERNAL_CRON_JOBS: 'internal-cron-jobs',
  INTERNAL_EVENT_JOBS: 'internal-event-jobs',
} as const;

export type ExtraFeature = (typeof ExtraFeature)[keyof typeof ExtraFeature];

/** Módulos instaláveis pela CLI (copia/patch de arquivos). */
export enum InstallModule {
  CORE = 'core',
  AUTH = 'auth',
  CACHE = 'cache',
  HEALTH = 'health',
  INTERNAL_CRON_JOBS = 'internal-cron-jobs',
  INTERNAL_EVENT_JOBS = 'internal-event-jobs',
}

/** Discriminador de argumentos do comando `add`. */
export const AddArgKind = {
  AUTH: 'auth',
  FEATURE: 'feature',
} as const;

export type AddArgKind = (typeof AddArgKind)[keyof typeof AddArgKind];

/** Valor especial do prompt interativo de auth no `add`. */
export const AuthPromptChoice = {
  SKIP: 'skip',
} as const;

/** Incluídas automaticamente no template CRUD. */
export const CRUD_BUNDLED_FEATURES: readonly ExtraFeature[] = [
  ExtraFeature.CACHE,
  ExtraFeature.INTERNAL_CRON_JOBS,
  ExtraFeature.INTERNAL_EVENT_JOBS,
];

/** Ordem de instalação no `kl-nest add`. */
export const FEATURE_INSTALL_ORDER: readonly ExtraFeature[] = [
  ExtraFeature.CACHE,
  ExtraFeature.HEALTH_CHECK,
  ExtraFeature.INTERNAL_CRON_JOBS,
  ExtraFeature.INTERNAL_EVENT_JOBS,
];

export const TEMPLATE_ALIASES: Record<string, Template> = {
  default: Template.DEFAULT,
  padrao: Template.DEFAULT,
  crud: Template.CRUD_SAMPLE,
  example: Template.CRUD_SAMPLE,
  sample: Template.CRUD_SAMPLE,
  'crud-sample': Template.CRUD_SAMPLE,
  crudsample: Template.CRUD_SAMPLE,
};

export const FEATURE_ALIASES: Record<string, ExtraFeature> = {
  cache: ExtraFeature.CACHE,
  redis: ExtraFeature.CACHE,
  health: ExtraFeature.HEALTH_CHECK,
  'health-check': ExtraFeature.HEALTH_CHECK,
  cron: ExtraFeature.INTERNAL_CRON_JOBS,
  'internal-cron-jobs': ExtraFeature.INTERNAL_CRON_JOBS,
  events: ExtraFeature.INTERNAL_EVENT_JOBS,
  'internal-event-jobs': ExtraFeature.INTERNAL_EVENT_JOBS,
};

export const FEATURE_LABELS: Record<ExtraFeature, string> = {
  [ExtraFeature.CACHE]: 'cache (Redis)',
  [ExtraFeature.HEALTH_CHECK]: 'health-check',
  [ExtraFeature.INTERNAL_CRON_JOBS]: 'cron jobs',
  [ExtraFeature.INTERNAL_EVENT_JOBS]: 'event jobs',
};

/** Rótulos para prompts interativos da CLI. */
export const FEATURE_PROMPT_LABELS: Record<ExtraFeature, string> = {
  [ExtraFeature.CACHE]: 'Cache (Redis)',
  [ExtraFeature.HEALTH_CHECK]: 'Health check (GET /health)',
  [ExtraFeature.INTERNAL_CRON_JOBS]: 'Jobs internos (Cron)',
  [ExtraFeature.INTERNAL_EVENT_JOBS]: 'Jobs internos (Eventos)',
};

export const TEMPLATE_LABELS: Record<Template, string> = {
  [Template.DEFAULT]: 'Padrão',
  [Template.CRUD_SAMPLE]: 'Exemplo de CRUD',
};

/** Marcadores de texto usados para detectar o estado do projeto gerado. */
export const ProjectMarker = {
  PERSON_MODULE: 'PersonModule',
  SECURITY_MODULE: 'SecurityModule',
  AUTH_MODULE: 'AuthModule',
  HEALTH_CHECK_MODULE: 'HealthCheckModule',
  CACHE_SERVICE_PROVIDER: 'CacheServiceProvider',
  OAUTH_AUTH_LINK_HANDLER: 'OAuthAuthLinkHandler',
  REDIS_INDICATOR: 'RedisIndicator',
} as const;

export const DDD_LAYER_FOLDERS = [
  'src/application',
  'src/domain',
  'src/infra',
  'src/host',
  'src/core',
  'src/test',
] as const;

export const DEFAULT_PACKAGE_MANAGER = 'bun' as const;

export function mapExtraFeatureToModule(feature: ExtraFeature): InstallModule {
  switch (feature) {
    case ExtraFeature.CACHE:
      return InstallModule.CACHE;
    case ExtraFeature.HEALTH_CHECK:
      return InstallModule.HEALTH;
    case ExtraFeature.INTERNAL_CRON_JOBS:
      return InstallModule.INTERNAL_CRON_JOBS;
    case ExtraFeature.INTERNAL_EVENT_JOBS:
      return InstallModule.INTERNAL_EVENT_JOBS;
  }
}

export function isAuthChoice(value: string): value is AuthChoice {
  return (
    value === AuthChoice.NONE ||
    value === AuthChoice.JWT ||
    value === AuthChoice.OAUTH2
  );
}

export function isAuthStrategy(value: string): value is AuthStrategy {
  return value === AuthStrategy.JWT || value === AuthStrategy.OAUTH2;
}

export function parseAuthStrategies(
  value: string,
  template?: Template,
): AuthStrategy[] {
  const normalized = value.trim().toLowerCase();

  if (normalized === AuthChoice.NONE || normalized === '') {
    if (template === Template.CRUD_SAMPLE) {
      throw new Error(
        'Template CRUD exige autenticação. Use: --auth jwt, --auth oauth2 ou --auth jwt,oauth2.',
      );
    }

    return [];
  }

  const strategies = normalized
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      if (isAuthStrategy(item)) {
        return item;
      }

      throw new Error(
        `Autenticação desconhecida: "${item}". Use: none, jwt, oauth2 ou jwt,oauth2.`,
      );
    });

  return Array.from(new Set(strategies));
}

export function formatAuthStrategies(strategies: readonly AuthStrategy[]): string {
  if (strategies.length === 0) {
    return AuthChoice.NONE;
  }

  return strategies.join(' + ');
}

export function resolveAuthStrategiesFromModule(
  authModuleSource: string,
): AuthStrategy[] {
  const strategies: AuthStrategy[] = [];

  if (authModuleSource.includes('LoginController')) {
    strategies.push(AuthStrategy.JWT);
  }

  if (authModuleSource.includes(ProjectMarker.OAUTH_AUTH_LINK_HANDLER)) {
    strategies.push(AuthStrategy.OAUTH2);
  }

  return strategies;
}

/** @deprecated use resolveAuthStrategiesFromModule */
export function resolveAuthStrategyFromModule(
  authModuleSource: string,
): AuthStrategy {
  return (
    resolveAuthStrategiesFromModule(authModuleSource)[0] ?? AuthStrategy.JWT
  );
}

export function mergeAuthStrategies(
  current: readonly AuthStrategy[],
  incoming: readonly AuthStrategy[],
): AuthStrategy[] {
  return Array.from(new Set([...current, ...incoming]));
}

export function listMissingAuthStrategies(
  installed: false | readonly AuthStrategy[],
): AuthStrategy[] {
  const current = installed === false ? [] : installed;

  return [AuthStrategy.JWT, AuthStrategy.OAUTH2].filter(
    (strategy) => !current.includes(strategy),
  );
}

export function mergeCrudSampleFeatures(
  features: ExtraFeature[],
): ExtraFeature[] {
  return Array.from(new Set([...CRUD_BUNDLED_FEATURES, ...features]));
}

export function resolveNewProjectOptions(
  template: Template,
  auth: AuthStrategy[],
  features: ExtraFeature[],
): { auth: AuthStrategy[]; features: ExtraFeature[] } {
  if (template !== Template.CRUD_SAMPLE) {
    return { auth, features };
  }

  return {
    auth: auth.length === 0 ? [AuthStrategy.JWT] : auth,
    features: mergeCrudSampleFeatures(features),
  };
}
