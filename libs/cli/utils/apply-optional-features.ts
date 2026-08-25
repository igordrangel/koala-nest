import {
  AppType,
  AuthStrategy,
  ExtraFeature,
  Template,
} from '@cli/constants/domain';
import { applyWorkerProfile } from './apply-worker-profile.ts';
import {
  installModule,
  mapExtraFeatureToModule,
  Modules,
  resolveProjectFeatures,
} from './install-module.ts';
import { stripEnvForWorker } from './patch-env.ts';
import { stripJobsInfrastructure } from './patch-jobs-module.ts';
import { adjustCrudPersonModule } from './patch-person-features.ts';
import { cleanDefaultTemplateWithoutAuth } from './remove-sample-parts.ts';
import { formatCode } from './format-code.ts';

export type ApplyOptionalFeaturesOptions = {
  projectName?: string;
  appType?: AppType;
  template: Template;
  auth: AuthStrategy[];
  features: ExtraFeature[];
  apiKeyInternalSubnet?: boolean;
  skipPackages?: boolean;
};

export async function applyOptionalFeatures(
  options: ApplyOptionalFeaturesOptions,
): Promise<void> {
  const projectName = options.projectName ?? '';
  const appType = options.appType ?? AppType.API;
  const projectFeatures = resolveProjectFeatures(
    options.features,
    options.auth,
  );

  if (options.template === Template.CRUD_SAMPLE) {
    adjustCrudPersonModule(projectName, {
      cache: projectFeatures.cacheForCrud,
      cronJobs: projectFeatures.cronJobs,
      eventJobs: projectFeatures.eventJobs,
      auth: options.auth.length > 0,
    });
  }

  if (projectFeatures.cache) {
    await installModule(Modules.CACHE, options.template, projectName, {
      withRedis: projectFeatures.cacheWithRedis,
      skipPackages: options.skipPackages,
      appType,
    });
  }

  if (options.auth.length > 0) {
    await installModule(Modules.AUTH, options.template, projectName, {
      authStrategies: options.auth,
      apiKeyInternalSubnet: options.apiKeyInternalSubnet,
      skipPackages: options.skipPackages,
      appType,
    });
  }

  for (const feature of options.features) {
    if (feature === ExtraFeature.CACHE) {
      continue;
    }

    if (
      appType === AppType.WORKER &&
      feature === ExtraFeature.HEALTH_CHECK
    ) {
      continue;
    }

    await installModule(
      mapExtraFeatureToModule(feature),
      options.template,
      projectName,
      feature === ExtraFeature.HEALTH_CHECK
        ? {
            withRedisIndicator: projectFeatures.cache,
            skipPackages: options.skipPackages,
            appType,
          }
        : { skipPackages: options.skipPackages, appType },
    );
  }

  if (
    options.template === Template.DEFAULT &&
    options.auth.length === 0
  ) {
    await cleanDefaultTemplateWithoutAuth(projectName);
  }

  // JobsModule é só para cron/events — queue usa QueueBase + IQueueService.
  if (!projectFeatures.cronJobs && !projectFeatures.eventJobs) {
    stripJobsInfrastructure(projectName);
  }

  if (appType === AppType.WORKER) {
    applyWorkerProfile(projectName);
    stripEnvForWorker(projectName);
  }

  await formatCode(projectName);
}

export { addProjectFeatures } from './add-project-features.ts';
