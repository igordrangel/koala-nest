import {
  installModule,
  mapExtraFeatureToModule,
  Modules,
  resolveProjectFeatures,
  type ExtraFeature,
  type Template,
} from "./install-module.ts";
import { adjustCrudPersonModule } from "./patch-person-features.ts";
import { cleanDefaultTemplateWithoutAuth } from "./remove-sample-parts.ts";
import { formatCode } from "./format-code.ts";

export type ApplyOptionalFeaturesOptions = {
  projectName?: string;
  template: Template;
  auth: "none" | "jwt" | "oauth2";
  features: ExtraFeature[];
};

export async function applyOptionalFeatures(
  options: ApplyOptionalFeaturesOptions,
): Promise<void> {
  const projectName = options.projectName ?? "";
  const projectFeatures = resolveProjectFeatures(
    options.features,
    options.auth,
  );

  if (options.template === "crudSample") {
    adjustCrudPersonModule(projectName, {
      cache: projectFeatures.cacheForCrud,
      cronJobs: projectFeatures.cronJobs,
      eventJobs: projectFeatures.eventJobs,
      auth: options.auth !== "none",
    });
  }

  if (projectFeatures.cache) {
    await installModule(Modules.CACHE, options.template, projectName, {
      withRedis: projectFeatures.cacheWithRedis,
    });
  }

  if (options.auth !== "none") {
    await installModule(Modules.AUTH, options.template, projectName, {
      authStrategy: options.auth,
    });
  }

  for (const feature of options.features) {
    if (feature === "cache") {
      continue;
    }

    await installModule(
      mapExtraFeatureToModule(feature),
      options.template,
      projectName,
    );
  }

  if (options.template === "default" && options.auth === "none") {
    await cleanDefaultTemplateWithoutAuth(projectName);
  }

  await formatCode(projectName);
}

export { addProjectFeatures } from "./add-project-features.ts";