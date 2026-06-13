import {
  installModule,
  Modules,
  type Template,
} from "./install-module";
import type { AuthStrategy } from "./patch-auth-install";
import {
  detectProjectState,
  type AddArg,
  type ProjectState,
} from "./detect-project-state";
import { formatCode } from "./format-code";
import { runCommand } from "./run-command";
import { getPackageManager } from "./get-package-manager";
import { resolveProjectPath } from "./resolve-project-path";
import { CACHE_PACKAGES } from "../constants/core-packages";
import {
  restorePersonAuthExample,
  restorePersonCacheFeatures,
  restorePersonCronJobs,
  restorePersonEventJobs,
  upgradeCacheToRedis,
} from "./restore-person-features";
import { normalizeAddArgs } from "./normalize-add-args";

async function ensureMemoryCache(projectName: string, template: Template) {
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
  template: Template,
  state: ProjectState,
) {
  if (state.cache === "redis") {
    return { installed: false, reason: "Cache Redis já está instalado." };
  }

  if (state.cache === "memory") {
    await upgradeCacheToRedis(projectName);
    const packageManager = getPackageManager(projectName);
    await runCommand(
      [packageManager, "add", ...CACHE_PACKAGES],
      resolveProjectPath(projectName),
    );
  } else {
    await installModule(Modules.CACHE, template, projectName, {
      withRedis: true,
    });
  }

  if (template === "crudSample") {
    await restorePersonCacheFeatures(projectName);
  }

  return { installed: true };
}

export type AddFeatureResult = {
  label: string;
  installed: boolean;
  reason?: string;
};

export async function addProjectFeatures(
  projectName = "",
  args: AddArg[],
): Promise<AddFeatureResult[]> {
  const results: AddFeatureResult[] = [];
  let state = detectProjectState(projectName);
  const template = state.template;
  const orderedArgs = normalizeAddArgs(args);

  for (const arg of orderedArgs) {
    if (arg.kind === "auth") {
      if (state.auth) {
        results.push({
          label: `auth (${arg.strategy})`,
          installed: false,
          reason: `Autenticação ${state.auth} já está instalada.`,
        });
        continue;
      }

      if (arg.strategy === "oauth2") {
        await ensureMemoryCache(projectName, template);
      }

      await installModule(Modules.AUTH, template, projectName, {
        authStrategy: arg.strategy,
      });

      if (template === "crudSample") {
        await restorePersonAuthExample(projectName);
      }

      results.push({ label: `auth (${arg.strategy})`, installed: true });
      state = detectProjectState(projectName);
      continue;
    }

    switch (arg.feature) {
      case "cache": {
        const cacheResult = await installRedisCache(projectName, template, state);
        results.push({
          label: "cache (Redis)",
          installed: cacheResult.installed,
          reason: cacheResult.reason,
        });
        break;
      }
      case "health-check": {
        if (state.health) {
          results.push({
            label: "health-check",
            installed: false,
            reason: "Health check já está instalado.",
          });
          break;
        }

        await installModule(Modules.HEALTH, template, projectName);
        results.push({ label: "health-check", installed: true });
        break;
      }
      case "internal-cron-jobs": {
        if (state.cronJobs) {
          results.push({
            label: "cron jobs",
            installed: false,
            reason: "Cron jobs já estão instalados.",
          });
          break;
        }

        await ensureMemoryCache(projectName, template);
        await installModule(Modules.INTERNAL_CRON_JOBS, template, projectName);

        if (template === "crudSample") {
          await restorePersonCronJobs(projectName);
        }

        results.push({ label: "cron jobs", installed: true });
        break;
      }
      case "internal-event-jobs": {
        if (state.eventJobs) {
          results.push({
            label: "event jobs",
            installed: false,
            reason: "Event jobs já estão instalados.",
          });
          break;
        }

        await installModule(Modules.INTERNAL_EVENT_JOBS, template, projectName);

        if (template === "crudSample") {
          await restorePersonEventJobs(projectName);
        }

        results.push({ label: "event jobs", installed: true });
        break;
      }
    }

    state = detectProjectState(projectName);
  }

  await formatCode(projectName);
  return results;
}
