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
  assertAuthStrategiesCombination,
  Template,
  TEMPLATE_LABELS,
} from '@cli/constants/domain';
import {
  AI_CONTEXT_PROMPT_LABELS,
  AiContextPromptChoice,
  formatAiContextTargets,
  resolveAiContextTargetsFromPrompt,
  type AiContextTarget,
} from '@cli/constants/ai-context';
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
          value: AuthStrategy.API_KEY,
          label: 'API Key',
          hint: 'aditiva (requer JWT e/ou OAuth2)',
        },
      ],
      required: isCrud,
    }),
  ) as AuthStrategy[];
}

async function promptApiKeyInternalSubnet(strategies: AuthStrategy[]) {
  if (!strategies.includes(AuthStrategy.API_KEY)) {
    return false;
  }

  return assertNotCancel(
    await p.confirm({
      message:
        'Incluir bypass de subnet interna (comunicação entre pods/microserviços)?',
      initialValue: false,
    }),
  );
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

async function promptAiContext(): Promise<AiContextTarget[]> {
  const choice = assertNotCancel(
    await p.select({
      message: 'Contexto AI (Cursor / GitHub Copilot)',
      options: [
        {
          value: AiContextPromptChoice.NONE,
          label: AI_CONTEXT_PROMPT_LABELS[AiContextPromptChoice.NONE],
        },
        {
          value: AiContextPromptChoice.CURSOR,
          label: AI_CONTEXT_PROMPT_LABELS[AiContextPromptChoice.CURSOR],
          hint: '.cursor/rules + AGENTS.md',
        },
        {
          value: AiContextPromptChoice.GITHUB,
          label: AI_CONTEXT_PROMPT_LABELS[AiContextPromptChoice.GITHUB],
          hint: '.github/copilot-instructions.md + AGENTS.md',
        },
        {
          value: AiContextPromptChoice.BOTH,
          label: AI_CONTEXT_PROMPT_LABELS[AiContextPromptChoice.BOTH],
        },
      ],
    }),
  ) as AiContextPromptChoice;

  return resolveAiContextTargetsFromPrompt(choice);
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
    const auth = parsed.auth ?? (await promptAuthStrategies(template));
    assertAuthStrategiesCombination(auth);
    const apiKeyInternalSubnet =
      parsed.apiKeyInternalSubnet ||
      (parsed.auth
        ? parsed.apiKeyInternalSubnet
        : await promptApiKeyInternalSubnet(auth));
    const features =
      parsed.features.length > 0
        ? parsed.features
        : await promptExtraFeatures(template);
    const aiContext = await promptAiContext();

    return buildNewProjectConfig(parsed, {
      name,
      packageManager,
      template,
      auth,
      features,
      apiKeyInternalSubnet,
      aiContext,
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
    aiContext: [],
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
    apiKeyInternalSubnet: project.apiKeyInternalSubnet,
  });

  spinner.message('Configurando workspace (.vscode, .env e contexto AI)...');

  finalizeNewProjectSetup(
    project.name,
    project.packageManager,
    project.aiContext,
  );

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

  const summaryLines = [
    `${color.bold('Projeto:')} ${project.name}`,
    `${color.bold('Template:')} ${TEMPLATE_LABELS[project.template]}`,
    `${color.bold('Gerenciador:')} ${project.packageManager}`,
    `${color.bold('Autenticação:')} ${formatAuthStrategies(authStrategies)}`,
    `${color.bold('Extras:')} ${extrasSummary || color.dim('nenhum')}`,
    `${color.bold('Contexto AI:')} ${formatAiContextTargets(project.aiContext)}`,
    `${color.dim('Depois:')} cd ${project.name} && ${project.packageManager} start`,
    `${color.dim('Extras:')} kl-nest add <feature>`,
  ];

  if (projectFeatures.cronJobs) {
    summaryLines.push(
      `${color.dim('Cron jobs:')} desligados — defina CRON_JOBS_ENABLED=true no .env para ligar`,
    );
  }

  p.note(summaryLines.join('\n'), 'Resumo');
}
