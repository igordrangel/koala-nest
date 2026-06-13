import type { PackageManager } from '@cli/types/index.ts';
import {
  AuthChoice,
  FEATURE_ALIASES,
  type ExtraFeature,
  Template,
  TEMPLATE_ALIASES,
} from '@cli/constants/domain';

export type ParsedNewArgs = {
  projectName?: string;
  packageManager?: PackageManager;
  template?: Template;
  auth?: AuthChoice;
  features: ExtraFeature[];
  interactive: boolean;
};

function parseFeatures(value: string): ExtraFeature[] {
  return value
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .map((item) => {
      const feature = FEATURE_ALIASES[item];

      if (!feature) {
        throw new Error(
          `Feature desconhecida: "${item}". Use: cache, health, cron, events.`,
        );
      }

      return feature;
    });
}

function parseTemplate(value: string): Template {
  const template = TEMPLATE_ALIASES[value.toLowerCase()];

  if (!template) {
    throw new Error(`Template desconhecido: "${value}". Use: default, crud.`);
  }

  return template;
}

function parsePackageManager(value: string): PackageManager {
  if (value === 'bun' || value === 'npm' || value === 'pnpm') {
    return value;
  }

  throw new Error(`Gerenciador desconhecido: "${value}". Use: bun, npm, pnpm.`);
}

function parseAuth(value: string, template?: Template) {
  if (
    value === AuthChoice.NONE ||
    value === AuthChoice.JWT ||
    value === AuthChoice.OAUTH2
  ) {
    if (template === Template.CRUD_SAMPLE && value === AuthChoice.NONE) {
      throw new Error(
        'Template CRUD exige autenticação. Use: --auth jwt ou --auth oauth2.',
      );
    }

    return value;
  }

  throw new Error(
    `Autenticação desconhecida: "${value}". Use: none, jwt, oauth2.`,
  );
}

export function parseNewArgs(args: string[]): ParsedNewArgs {
  let projectName: string | undefined;
  let packageManager: PackageManager | undefined;
  let template: Template | undefined;
  let auth: ParsedNewArgs['auth'];
  let features: ExtraFeature[] = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (!arg) {
      continue;
    }

    if (arg === '--template' || arg === '-t') {
      const value = args[index + 1];

      if (!value) {
        throw new Error('Valor ausente para --template.');
      }

      template = parseTemplate(value);
      index += 1;
      continue;
    }

    if (arg === '--package-manager' || arg === '--pm') {
      const value = args[index + 1];

      if (!value) {
        throw new Error('Valor ausente para --package-manager.');
      }

      packageManager = parsePackageManager(value);
      index += 1;
      continue;
    }

    if (arg === '--auth') {
      const value = args[index + 1];

      if (!value) {
        throw new Error('Valor ausente para --auth.');
      }

      auth = parseAuth(value, template);
      index += 1;
      continue;
    }

    if (arg === '--features') {
      const value = args[index + 1];

      if (!value) {
        throw new Error('Valor ausente para --features.');
      }

      features = parseFeatures(value);
      index += 1;
      continue;
    }

    if (arg.startsWith('-')) {
      throw new Error(`Flag desconhecida: ${arg}`);
    }

    if (!projectName) {
      projectName = arg;
    }
  }

  if (auth && template === Template.CRUD_SAMPLE && auth === AuthChoice.NONE) {
    throw new Error(
      'Template CRUD exige autenticação. Use: --auth jwt ou --auth oauth2.',
    );
  }

  return {
    projectName,
    packageManager,
    template,
    auth,
    features,
    interactive: !projectName,
  };
}

export function assertNewArgsComplete(
  args: ParsedNewArgs,
): asserts args is ParsedNewArgs & {
  projectName: string;
  packageManager: PackageManager;
  template: Template;
  auth: AuthChoice;
  features: ExtraFeature[];
} {
  if (!args.projectName) {
    throw new Error('Nome do projeto é obrigatório.');
  }

  if (!args.packageManager) {
    throw new Error('Gerenciador de pacotes é obrigatório.');
  }

  if (!args.template) {
    throw new Error('Template é obrigatório.');
  }

  if (!args.auth) {
    throw new Error('Autenticação é obrigatória.');
  }
}

export function buildNewProjectConfig(
  parsed: ParsedNewArgs,
  overrides: {
    name: string;
    packageManager: PackageManager;
    template: Template;
    auth: AuthChoice;
    features: ExtraFeature[];
  },
) {
  return {
    name: overrides.name,
    packageManager: parsed.packageManager ?? overrides.packageManager,
    template: parsed.template ?? overrides.template,
    auth: parsed.auth ?? overrides.auth,
    features: parsed.features.length > 0 ? parsed.features : overrides.features,
  };
}
