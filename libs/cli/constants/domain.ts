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

export function resolveAuthStrategyFromModule(
  authModuleSource: string,
): AuthStrategy {
  return authModuleSource.includes(ProjectMarker.OAUTH_AUTH_LINK_HANDLER)
    ? AuthStrategy.OAUTH2
    : AuthStrategy.JWT;
}

export function mergeCrudSampleFeatures(
  features: ExtraFeature[],
): ExtraFeature[] {
  return Array.from(new Set([...CRUD_BUNDLED_FEATURES, ...features]));
}

export function resolveNewProjectOptions(
  template: Template,
  auth: AuthChoice,
  features: ExtraFeature[],
): { auth: AuthChoice; features: ExtraFeature[] } {
  if (template !== Template.CRUD_SAMPLE) {
    return { auth, features };
  }

  return {
    auth: auth === AuthChoice.NONE ? AuthChoice.JWT : auth,
    features: mergeCrudSampleFeatures(features),
  };
}
