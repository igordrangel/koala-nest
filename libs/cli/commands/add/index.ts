import * as p from '@clack/prompts';
import color from 'picocolors';
import {
  AI_CONTEXT_LABELS,
  type AiContextTarget as AiContextTargetType,
} from '@cli/constants/ai-context';
import {
  AddArgKind,
  AuthStrategy,
  ExtraFeature,
  FEATURE_LABELS,
  FEATURE_PROMPT_LABELS,
} from '@cli/constants/domain';
import { addProjectFeatures } from '@cli/utils/add-project-features.ts';
import { assertNotCancel } from '@cli/utils/cancel.ts';
import {
  assertKoalaProject,
  dedupeAddArgs,
  detectProjectState,
  listAvailableAddOptions,
  parseAddArgs,
  type AddArg,
} from '@cli/utils/detect-project-state.ts';

function formatResultSummary(
  results: Awaited<ReturnType<typeof addProjectFeatures>>,
) {
  if (results.length === 0) {
    return color.dim('Nenhuma alteração necessária.');
  }

  const lines = results.map((result) => {
    if (result.installed) {
      return `${color.green('✓')} ${result.label}`;
    }

    return `${color.yellow('○')} ${result.label} — ${result.reason ?? 'já instalado'}`;
  });

  const cronInstalled = results.some(
    (result) =>
      result.installed &&
      result.label === FEATURE_LABELS[ExtraFeature.INTERNAL_CRON_JOBS],
  );

  if (cronInstalled) {
    lines.push(
      `${color.dim('Cron jobs:')} desligados — defina CRON_JOBS_ENABLED=true no .env para ligar`,
    );
  }

  return lines.join('\n');
}

async function resolveAddArgsFromPrompt(): Promise<AddArg[]> {
  const state = detectProjectState('.');
  const available = listAvailableAddOptions(state);
  const args: AddArg[] = [];

  if (available.authStrategies.length > 0) {
    const authStrategies = assertNotCancel(
      await p.multiselect({
        message: 'Estratégias de autenticação para adicionar',
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
        ].filter((option) =>
          available.authStrategies.includes(option.value as AuthStrategy),
        ),
        required: false,
      }),
    ) as AuthStrategy[];

    if (authStrategies.length > 0) {
      let apiKeyInternalSubnet = false;

      if (authStrategies.includes(AuthStrategy.API_KEY)) {
        apiKeyInternalSubnet = assertNotCancel(
          await p.confirm({
            message:
              'Incluir bypass de subnet interna (comunicação entre pods/microserviços)?',
            initialValue: false,
          }),
        );
      }

      args.push({
        kind: AddArgKind.AUTH,
        strategies: authStrategies,
        apiKeyInternalSubnet,
      });
    }
  }

  if (available.features.length > 0) {
    const features = assertNotCancel(
      await p.multiselect({
        message: 'Funcionalidades para adicionar',
        options: available.features.map((feature) => ({
          value: feature,
          label: FEATURE_PROMPT_LABELS[feature],
        })),
        required: false,
      }),
    ) as ExtraFeature[];

    for (const feature of features) {
      args.push({ kind: AddArgKind.FEATURE, feature });
    }
  }

  if (available.aiContextTargets.length > 0) {
    const targets = assertNotCancel(
      await p.multiselect({
        message: 'Contexto AI',
        options: available.aiContextTargets.map((target) => ({
          value: target,
          label: AI_CONTEXT_LABELS[target],
        })),
        required: false,
      }),
    ) as AiContextTargetType[];

    if (targets.length > 0) {
      args.push({ kind: AddArgKind.AI_CONTEXT, targets });
    }
  }

  return dedupeAddArgs(args);
}

export async function runAdd(
  rawArgs: string[] = process.argv.slice(3),
): Promise<void> {
  p.intro(
    `${color.bgCyan(color.black(' koala-nest '))} ${color.dim('Adicionar funcionalidades')}`,
  );

  assertKoalaProject('.');

  const state = detectProjectState('.');
  const available = listAvailableAddOptions(state);

  if (
    available.authStrategies.length === 0 &&
    available.features.length === 0 &&
    available.aiContextTargets.length === 0
  ) {
    p.outro(
      color.green(
        'Este projeto já possui todas as funcionalidades disponíveis.',
      ),
    );
    return;
  }

  let args: AddArg[];

  try {
    args =
      rawArgs.length > 0
        ? dedupeAddArgs(parseAddArgs(rawArgs))
        : await resolveAddArgsFromPrompt();
  } catch (error) {
    p.cancel(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  if (args.length === 0) {
    p.cancel('Nenhuma funcionalidade selecionada.');
    process.exit(0);
  }

  const spinner = p.spinner();
  spinner.start('Instalando funcionalidades...');

  const results = await addProjectFeatures('.', args);

  spinner.stop('Instalação concluída.');

  p.note(formatResultSummary(results), 'Resumo');

  p.outro(
    color.green('Funcionalidades aplicadas.') +
      color.dim('\nRevise o .env e reinicie a aplicação se necessário.'),
  );
}
