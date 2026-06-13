import { AuthChoice, ExtraFeature, Template } from '@cli/constants/domain';
import {
  installModule,
  mapExtraFeatureToModule,
  Modules,
  resolveProjectFeatures,
} from './install-module.ts';
import { adjustCrudPersonModule } from './patch-person-features.ts';
import { cleanDefaultTemplateWithoutAuth } from './remove-sample-parts.ts';
import { formatCode } from './format-code.ts';

export type ApplyOptionalFeaturesOptions = {
  projectName?: string;
  template: Template;
  auth: AuthChoice;
  features: ExtraFeature[];
};

export async function applyOptionalFeatures(
  options: ApplyOptionalFeaturesOptions,
): Promise<void> {
  const projectName = options.projectName ?? '';
  const projectFeatures = resolveProjectFeatures(
    options.features,
    options.auth,
  );

  if (options.template === Template.CRUD_SAMPLE) {
    adjustCrudPersonModule(projectName, {
      cache: projectFeatures.cacheForCrud,
      cronJobs: projectFeatures.cronJobs,
      eventJobs: projectFeatures.eventJobs,
      auth: options.auth !== AuthChoice.NONE,
    });
  }

  if (projectFeatures.cache) {
    await installModule(Modules.CACHE, options.template, projectName, {
      withRedis: projectFeatures.cacheWithRedis,
    });
  }

  if (options.auth !== AuthChoice.NONE) {
    await installModule(Modules.AUTH, options.template, projectName, {
      authStrategy: options.auth,
    });
  }

  for (const feature of options.features) {
    if (feature === ExtraFeature.CACHE) {
      continue;
    }

    await installModule(
      mapExtraFeatureToModule(feature),
      options.template,
      projectName,
      feature === ExtraFeature.HEALTH_CHECK
        ? { withRedisIndicator: projectFeatures.cache }
        : {},
    );
  }

  if (
    options.template === Template.DEFAULT &&
    options.auth === AuthChoice.NONE
  ) {
    await cleanDefaultTemplateWithoutAuth(projectName);
  }

  await formatCode(projectName);
}

export { addProjectFeatures } from './add-project-features.ts';
