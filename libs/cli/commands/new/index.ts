import * as p from '@clack/prompts';
import color from 'picocolors';
import type { PackageManager } from '@cli/types/index.ts';
import { assertNotCancel } from '@cli/utils/cancel.ts';
import { applyOptionalFeatures } from '@cli/utils/apply-optional-features.ts';
import {
  buildNewProjectConfig,
  parseNewArgs,
} from '@cli/utils/parse-new-args.ts';
import { createEmptyNestProject } from './create-empty-nest-project.ts';
import { createDDDStructure } from './create-ddd-structure.ts';
import {
  AuthStrategy,
  CRUD_BUNDLED_FEATURES,
  DEFAULT_PACKAGE_MANAGER,
  ExtraFeature,
  FEATURE_LABELS,
  FEATURE_PROMPT_LABELS,
  formatAuthStrategies,
  Template,
  TEMPLATE_LABELS,
} from '@cli/constants/domain';
import {
  installModule,
  Modules,
  resolveNewProjectOptions,
  resolveProjectFeatures,
} from '@cli/utils/install-module.ts';
import { fixLintConfig } from './fix-lint-config.ts';
import { finalizeNewProjectSetup } from '@cli/utils/install-workspace-config.ts';

async function promptAuthStrategies(template: Template) {
  const isCrud = template === Template.CRUD_SAMPLE;

  return assertNotCancel(
    await p.multiselect({
      message: isCrud
        ? 'Estratégias de autenticação (incluídas no exemplo CRUD)'
        : 'Estratégias de autenticação',
      options: [
        {
          value: AuthStrategy.JWT,
          label: 'JWT',
          hint: 'RS256 + guards globais',
        },
        {
          value: AuthStrategy.OAUTH2,
          label: 'OAuth2',
          hint: 'JWT + OAuth2 genérico',
        },
        {
          value: 'api-key',
          label: 'API Key',
          hint: 'em breve',
          disabled: true,
        },
      ],
      required: isCrud,
    }),
  ) as AuthStrategy[];
}

async function promptExtraFeatures(template: Template) {
  if (template === Template.CRUD_SAMPLE) {
    const bundled = CRUD_BUNDLED_FEATURES.map(
      (feature) => FEATURE_LABELS[feature],
    ).join(', ');

    p.note(
      `O exemplo CRUD já inclui: ${bundled} e autenticação.\n` +
        'Escolha abaixo apenas funcionalidades adicionais.',
      'Incluso no template',
    );

    return assertNotCancel(
      await p.multiselect({
        message: 'Funcionalidades extras adicionais',
        options: [
          {
            value: ExtraFeature.HEALTH_CHECK,
            label: FEATURE_PROMPT_LABELS[ExtraFeature.HEALTH_CHECK],
          },
        ],
        required: false,
      }),
    ) as ExtraFeature[];
  }

  return assertNotCancel(
    await p.multiselect({
      message: 'Funcionalidades extras',
      options: [
        {
          value: ExtraFeature.CACHE,
          label: FEATURE_PROMPT_LABELS[ExtraFeature.CACHE],
          hint: 'ICacheService + ioredis',
        },
        {
          value: ExtraFeature.HEALTH_CHECK,
          label: FEATURE_PROMPT_LABELS[ExtraFeature.HEALTH_CHECK],
        },
        {
          value: ExtraFeature.INTERNAL_CRON_JOBS,
          label: FEATURE_PROMPT_LABELS[ExtraFeature.INTERNAL_CRON_JOBS],
          hint: 'cron-parser + bases',
        },
        {
          value: ExtraFeature.INTERNAL_EVENT_JOBS,
          label: FEATURE_PROMPT_LABELS[ExtraFeature.INTERNAL_EVENT_JOBS],
          hint: 'EventJob + bases',
        },
      ],
      required: false,
    }),
  ) as ExtraFeature[];
}

async function promptProjectName() {
  return assertNotCancel(
    await p.text({
      message: 'Nome do projeto',
      placeholder: 'my-api',
      validate: (value) => (value ? undefined : 'Campo obrigatório'),
    }),
  );
}

async function promptPackageManager() {
  return assertNotCancel(
    await p.select<PackageManager>({
      message: 'Gerenciador de pacotes',
      options: [
        { value: 'bun', label: 'Bun', hint: 'recomendado' },
        { value: 'npm', label: 'npm' },
        { value: 'pnpm', label: 'pnpm' },
      ],
    }),
  );
}

async function promptTemplate() {
  return assertNotCancel(
    await p.select<Template>({
      message: 'Template',
      options: [
        {
          value: Template.DEFAULT,
          label: TEMPLATE_LABELS[Template.DEFAULT],
          hint: 'sem código de exemplo',
        },
        {
          value: Template.CRUD_SAMPLE,
          label: TEMPLATE_LABELS[Template.CRUD_SAMPLE],
          hint: 'Person + auth, cache e jobs',
        },
      ],
    }),
  );
}

async function resolveProjectInput(args: string[]) {
  const parsed = parseNewArgs(args);

  if (parsed.interactive) {
    const name = parsed.projectName ?? (await promptProjectName());
    const packageManager =
      parsed.packageManager ?? (await promptPackageManager());
    const template = parsed.template ?? (await promptTemplate());
    const auth =
      parsed.auth ??
      (await promptAuthStrategies(template));
    const features =
      parsed.features.length > 0
        ? parsed.features
        : await promptExtraFeatures(template);

    return buildNewProjectConfig(parsed, {
      name,
      packageManager,
      template,
      auth,
      features,
    });
  }

  if (!parsed.projectName) {
    throw new Error(
      'Informe o nome do projeto com -y. Ex.: kl-nest new my-api -y --template default --pm bun --auth none',
    );
  }

  return buildNewProjectConfig(parsed, {
    name: parsed.projectName,
    packageManager: DEFAULT_PACKAGE_MANAGER,
    template: Template.DEFAULT,
    auth: [],
    features: [],
  });
}

export async function runNew(args: string[] = []): Promise<void> {
  p.intro(
    `${color.bgCyan(color.black(' koala-nest '))} ${color.dim('Criar novo projeto')}`,
  );

  let project: Awaited<ReturnType<typeof resolveProjectInput>>;

  try {
    project = await resolveProjectInput(args);
  } catch (error) {
    p.cancel(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  const { auth: authStrategies, features } = resolveNewProjectOptions(
    project.template,
    project.auth,
    project.features,
  );

  const spinner = p.spinner();

  spinner.start('Criando projeto...');

  await createEmptyNestProject(project.name, project.packageManager);

  spinner.message('Definindo estrutura de pastas...');

  await createDDDStructure(project.name, project.packageManager);

  spinner.message('Aplicando configuração de lint...');

  fixLintConfig(project.name);

  spinner.message('Instalando módulo core...');

  await installModule(Modules.CORE, project.template, project.name);

  spinner.message('Instalando funcionalidades opcionais...');

  await applyOptionalFeatures({
    projectName: project.name,
    template: project.template,
    auth: authStrategies,
    features,
  });

  spinner.message('Configurando workspace (.vscode e .env)...');

  finalizeNewProjectSetup(project.name, project.packageManager);

  spinner.stop('Projeto criado com sucesso!');

  const projectFeatures = resolveProjectFeatures(features, authStrategies);

  const extrasSummary = [
    project.template === Template.CRUD_SAMPLE
      ? color.dim('exemplo Person completo')
      : null,
    projectFeatures.cacheWithRedis ? FEATURE_LABELS[ExtraFeature.CACHE] : null,
    projectFeatures.cache && !projectFeatures.cacheWithRedis
      ? color.dim('cache em memória')
      : null,
    projectFeatures.health ? FEATURE_LABELS[ExtraFeature.HEALTH_CHECK] : null,
    projectFeatures.cronJobs
      ? FEATURE_LABELS[ExtraFeature.INTERNAL_CRON_JOBS]
      : null,
    projectFeatures.eventJobs
      ? FEATURE_LABELS[ExtraFeature.INTERNAL_EVENT_JOBS]
      : null,
  ]
    .filter(Boolean)
    .join(', ');

  p.note(
    [
      `${color.bold('Projeto:')} ${project.name}`,
      `${color.bold('Template:')} ${TEMPLATE_LABELS[project.template]}`,
      `${color.bold('Gerenciador:')} ${project.packageManager}`,
      `${color.bold('Autenticação:')} ${formatAuthStrategies(authStrategies)}`,
      `${color.bold('Extras:')} ${extrasSummary || color.dim('nenhum')}`,
      `${color.dim('Depois:')} cd ${project.name} && ${project.packageManager} start`,
      `${color.dim('Extras:')} kl-nest add <feature>`,
    ].join('\n'),
    'Resumo',
  );
}
