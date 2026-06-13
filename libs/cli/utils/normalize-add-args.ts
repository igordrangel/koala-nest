import type { AddArg } from "./detect-project-state";
import type { ExtraFeature } from "./install-module";

const FEATURE_INSTALL_ORDER: ExtraFeature[] = [
  "cache",
  "health-check",
  "internal-cron-jobs",
  "internal-event-jobs",
];

/** Garante mesma ordem de instalação do `kl-nest new` ao usar `kl-nest add`. */
export function normalizeAddArgs(args: AddArg[]): AddArg[] {
  const auth = args.find(
    (item): item is Extract<AddArg, { kind: "auth" }> => item.kind === "auth",
  );
  const selectedFeatures = new Set(
    args
      .filter(
        (item): item is Extract<AddArg, { kind: "feature" }> =>
          item.kind === "feature",
      )
      .map((item) => item.feature),
  );

  const ordered: AddArg[] = [];

  for (const feature of FEATURE_INSTALL_ORDER) {
    if (selectedFeatures.has(feature)) {
      ordered.push({ kind: "feature", feature });
    }
  }

  if (auth) {
    const cacheIndex = ordered.findIndex(
      (item) => item.kind === "feature" && item.feature === "cache",
    );
    const authArg: AddArg = auth;

    if (cacheIndex >= 0) {
      ordered.splice(cacheIndex + 1, 0, authArg);
    } else {
      ordered.unshift(authArg);
    }
  }

  return ordered;
}
