import {
  AddArgKind,
  AuthStrategy,
  ExtraFeature,
  FEATURE_LABELS,
  formatAuthStrategies,
  mergeAuthStrategies,
  Template,
} from '@cli/constants/domain';
import {
  installModule,
  Modules,
  type Template as TemplateType,
} from './install-module';
import {
  detectProjectState,
  type AddArg,
  type ProjectState,
} from './detect-project-state';
import { formatCode } from './format-code';
import { runCommand } from './run-command';
import { getPackageManager } from './get-package-manager';
import { resolveProjectPath } from './resolve-project-path';
import { CACHE_PACKAGES } from '@cli/constants/core-packages';
import {
  restorePersonAuthExample,
  restorePersonCacheFeatures,
  restorePersonCronJobs,
  restorePersonEventJobs,
  upgradeCacheToRedis,
} from './restore-person-features';
import { normalizeAddArgs } from './normalize-add-args';
import { restoreRedisHealthCheck } from './patch-health-module';
import { patchAuthInstall } from './patch-auth-install';

async function ensureMemoryCache(projectName: string, template: TemplateType) {
  const state = detectProjectState(projectName);

  if (state.cache) {
    return;
  }

  await installModule(Modules.CACHE, template, projectName, {
    withRedis: false,
  });
}

async function installRedisCache(
  projectName: string,
  template: TemplateType,
  state: ProjectState,
) {
  if (state.cache === 'redis') {
    return { installed: false, reason: 'Cache Redis já está instalado.' };
  }

  if (state.cache === 'memory') {
    await upgradeCacheToRedis(projectName);
    const packageManager = getPackageManager(projectName);
    await runCommand(
      [packageManager, 'add', ...CACHE_PACKAGES],
      resolveProjectPath(projectName),
    );
  } else {
    await installModule(Modules.CACHE, template, projectName, {
      withRedis: true,
    });
  }

  if (template === Template.CRUD_SAMPLE) {
    await restorePersonCacheFeatures(projectName);
  }

  if (state.health) {
    restoreRedisHealthCheck(projectName);
  }

  return { installed: true };
}

export type AddFeatureResult = {
  label: string;
  installed: boolean;
  reason?: string;
};

export async function addProjectFeatures(
  projectName = '',
  args: AddArg[],
): Promise<AddFeatureResult[]> {
  const results: AddFeatureResult[] = [];
  let state = detectProjectState(projectName);
  const template = state.template;
  const orderedArgs = normalizeAddArgs(args);

  for (const arg of orderedArgs) {
    if (arg.kind === AddArgKind.AUTH) {
      const current = state.auth === false ? [] : state.auth;
      const missing = arg.strategies.filter(
        (strategy) => !current.includes(strategy),
      );

      if (missing.length === 0) {
        results.push({
          label: `auth (${formatAuthStrategies(arg.strategies)})`,
          installed: false,
          reason: `Autenticação ${formatAuthStrategies(current)} já está instalada.`,
        });
        continue;
      }

      const next = mergeAuthStrategies(current, missing);

      if (current.length === 0) {
        await ensureMemoryCache(projectName, template);

        await installModule(Modules.AUTH, template, projectName, {
          authStrategies: next,
        });

        if (template === Template.CRUD_SAMPLE) {
          await restorePersonAuthExample(projectName);
        }
      } else {
        await patchAuthInstall(projectName, next);
      }

      results.push({
        label: `auth (${formatAuthStrategies(missing)})`,
        installed: true,
      });
      state = detectProjectState(projectName);
      continue;
    }

    switch (arg.feature) {
      case ExtraFeature.CACHE: {
        const cacheResult = await installRedisCache(
          projectName,
          template,
          state,
        );
        results.push({
          label: FEATURE_LABELS[ExtraFeature.CACHE],
          installed: cacheResult.installed,
          reason: cacheResult.reason,
        });
        break;
      }
      case ExtraFeature.HEALTH_CHECK: {
        if (state.health) {
          results.push({
            label: FEATURE_LABELS[ExtraFeature.HEALTH_CHECK],
            installed: false,
            reason: 'Health check já está instalado.',
          });
          break;
        }

        await installModule(Modules.HEALTH, template, projectName, {
          withRedisIndicator: Boolean(state.cache),
        });
        results.push({
          label: FEATURE_LABELS[ExtraFeature.HEALTH_CHECK],
          installed: true,
        });
        break;
      }
      case ExtraFeature.INTERNAL_CRON_JOBS: {
        if (state.cronJobs) {
          results.push({
            label: FEATURE_LABELS[ExtraFeature.INTERNAL_CRON_JOBS],
            installed: false,
            reason: 'Cron jobs já estão instalados.',
          });
          break;
        }

        await ensureMemoryCache(projectName, template);
        await installModule(Modules.INTERNAL_CRON_JOBS, template, projectName);

        if (template === Template.CRUD_SAMPLE) {
          await restorePersonCronJobs(projectName);
        }

        results.push({
          label: FEATURE_LABELS[ExtraFeature.INTERNAL_CRON_JOBS],
          installed: true,
        });
        break;
      }
      case ExtraFeature.INTERNAL_EVENT_JOBS: {
        if (state.eventJobs) {
          results.push({
            label: FEATURE_LABELS[ExtraFeature.INTERNAL_EVENT_JOBS],
            installed: false,
            reason: 'Event jobs já estão instalados.',
          });
          break;
        }

        await installModule(Modules.INTERNAL_EVENT_JOBS, template, projectName);

        if (template === Template.CRUD_SAMPLE) {
          await restorePersonEventJobs(projectName);
        }

        results.push({
          label: FEATURE_LABELS[ExtraFeature.INTERNAL_EVENT_JOBS],
          installed: true,
        });
        break;
      }
    }

    state = detectProjectState(projectName);
  }

  await formatCode(projectName);
  return results;
}
