import type { AddArg } from './detect-project-state';
import {
  AddArgKind,
  ExtraFeature,
  FEATURE_INSTALL_ORDER,
} from '@cli/constants/domain';

/** Garante mesma ordem de instalação do `kl-nest new` ao usar `kl-nest add`. */
export function normalizeAddArgs(args: AddArg[]): AddArg[] {
  const auth = args.find(
    (item): item is Extract<AddArg, { kind: typeof AddArgKind.AUTH }> =>
      item.kind === AddArgKind.AUTH,
  );
  const selectedFeatures = new Set(
    args
      .filter(
        (item): item is Extract<AddArg, { kind: typeof AddArgKind.FEATURE }> =>
          item.kind === AddArgKind.FEATURE,
      )
      .map((item) => item.feature),
  );

  const ordered: AddArg[] = [];

  for (const feature of FEATURE_INSTALL_ORDER) {
    if (selectedFeatures.has(feature)) {
      ordered.push({ kind: AddArgKind.FEATURE, feature });
    }
  }

  if (auth) {
    const cacheIndex = ordered.findIndex(
      (item) =>
        item.kind === AddArgKind.FEATURE && item.feature === ExtraFeature.CACHE,
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
