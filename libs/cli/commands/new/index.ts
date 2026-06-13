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
  AuthChoice,
  AuthStrategy,
  CRUD_BUNDLED_FEATURES,
  DEFAULT_PACKAGE_MANAGER,
  ExtraFeature,
  FEATURE_LABELS,
  FEATURE_PROMPT_LABELS,
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

async function promptAuthStrategy(template: Template) {
  const isCrud = template === Template.CRUD_SAMPLE;

  return assertNotCancel(
    await p.select({
      message: isCrud
        ? 'Estratégia de autenticação (incluída no exemplo CRUD)'
        : 'Estratégia de autenticação',
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
        ...(isCrud ? [] : [{ value: AuthChoice.NONE, label: 'Nenhuma' }]),
      ],
    }),
  ) as AuthChoice;
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

async function promptProjectBasics() {
  return p.group(
    {
      name: () =>
        p.text({
          message: 'Nome do projeto',
          placeholder: 'my-api',
          validate: (value) => (value ? undefined : 'Campo obrigatório'),
        }),
      packageManager: () =>
        p.select<PackageManager>({
          message: 'Gerenciador de pacotes',
          options: [
            { value: 'bun', label: 'Bun', hint: 'recomendado' },
            { value: 'npm', label: 'npm' },
            { value: 'pnpm', label: 'pnpm' },
          ],
        }),
      template: () =>
        p.select<Template>({
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
    },
    {
      onCancel: () => {
        p.cancel('Operação cancelada.');
        process.exit(0);
      },
    },
  );
}

async function resolveProjectInput(args: string[]) {
  const parsed = parseNewArgs(args);

  if (parsed.interactive) {
    const project = await promptProjectBasics();
    const auth = await promptAuthStrategy(project.template);
    const features = await promptExtraFeatures(project.template);

    return buildNewProjectConfig(parsed, {
      name: project.name,
      packageManager: project.packageManager,
      template: project.template,
      auth,
      features,
    });
  }

  if (!parsed.projectName) {
    throw new Error(
      'Informe o nome do projeto. Ex.: kl-nest new my-api --template default --pm bun --auth none',
    );
  }

  return buildNewProjectConfig(parsed, {
    name: parsed.projectName,
    packageManager: DEFAULT_PACKAGE_MANAGER,
    template: Template.DEFAULT,
    auth: AuthChoice.NONE,
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

  const { auth: authChoice, features } = resolveNewProjectOptions(
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
    auth: authChoice,
    features,
  });

  spinner.stop('Projeto criado com sucesso!');

  const projectFeatures = resolveProjectFeatures(features, authChoice);

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
      `${color.bold('Autenticação:')} ${authChoice}`,
      `${color.bold('Extras:')} ${extrasSummary || color.dim('nenhum')}`,
      `${color.dim('Depois:')} cd ${project.name} && kl-nest add <feature>`,
    ].join('\n'),
    'Resumo',
  );
}
