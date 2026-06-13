import * as p from '@clack/prompts';
import color from 'picocolors';
import {
  AddArgKind,
  AuthPromptChoice,
  AuthStrategy,
  ExtraFeature,
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

  return results
    .map((result) => {
      if (result.installed) {
        return `${color.green('✓')} ${result.label}`;
      }

      return `${color.yellow('○')} ${result.label} — ${result.reason ?? 'já instalado'}`;
    })
    .join('\n');
}

async function resolveAddArgsFromPrompt(): Promise<AddArg[]> {
  const state = detectProjectState('.');
  const available = listAvailableAddOptions(state);
  const args: AddArg[] = [];

  if (available.auth) {
    const auth = assertNotCancel(
      await p.select({
        message: 'Adicionar autenticação?',
        options: [
          { value: AuthPromptChoice.SKIP, label: 'Não' },
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
        ],
      }),
    );

    if (auth !== AuthPromptChoice.SKIP) {
      args.push({ kind: AddArgKind.AUTH, strategy: auth });
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

  if (!available.auth && available.features.length === 0) {
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
