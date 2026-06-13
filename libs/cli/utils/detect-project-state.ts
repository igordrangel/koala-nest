import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { AuthStrategy } from "./patch-auth-install";
import type { ExtraFeature, Template } from "./install-module";
import { resolveProjectPath } from "./resolve-project-path";

export type CacheLevel = false | "memory" | "redis";

export type ProjectState = {
  template: Template;
  auth: false | AuthStrategy;
  cache: CacheLevel;
  health: boolean;
  cronJobs: boolean;
  eventJobs: boolean;
};

export function assertKoalaProject(projectName = ""): string {
  const root = resolveProjectPath(projectName);
  const envPath = path.join(root, "src/core/env.ts");

  if (!existsSync(envPath)) {
    throw new Error(
      "Projeto Koala Nest não encontrado. Execute o comando na raiz do projeto (com src/core/env.ts).",
    );
  }

  return root;
}

function readProjectFile(projectName: string, relativePath: string) {
  return readFileSync(
    path.join(resolveProjectPath(projectName), relativePath),
    "utf8",
  );
}

export function detectProjectState(projectName = ""): ProjectState {
  assertKoalaProject(projectName);

  const appModule = readProjectFile(projectName, "src/host/app.module.ts");
  const authModulePath = path.join(
    resolveProjectPath(projectName),
    "src/host/controllers/auth/auth.module.ts",
  );
  const authModule = existsSync(authModulePath)
    ? readFileSync(authModulePath, "utf8")
    : "";

  const hasPersonModule =
    appModule.includes("PersonModule") ||
    existsSync(
      path.join(
        resolveProjectPath(projectName),
        "src/host/controllers/person/person.module.ts",
      ),
    );

  let auth: ProjectState["auth"] = false;

  if (appModule.includes("SecurityModule")) {
    auth = authModule.includes("OAuthAuthLinkHandler") ? "oauth2" : "jwt";
  }

  let cache: CacheLevel = false;
  const infraModule = readProjectFile(projectName, "src/infra/infra.module.ts");

  if (infraModule.includes("CacheServiceProvider")) {
    const hasRedisFile = existsSync(
      path.join(
        resolveProjectPath(projectName),
        "src/infra/common/redis-cache.service.ts",
      ),
    );

    cache = hasRedisFile ? "redis" : "memory";
  }

  return {
    template: hasPersonModule ? "crudSample" : "default",
    auth,
    cache,
    health: appModule.includes("HealthCheckModule"),
    cronJobs: existsSync(
      path.join(
        resolveProjectPath(projectName),
        "src/core/utils/cron-expression-to-boolean.ts",
      ),
    ),
    eventJobs: existsSync(
      path.join(
        resolveProjectPath(projectName),
        "src/core/background-services/event-service/event-handler.base.ts",
      ),
    ),
  };
}

export function listAvailableAddOptions(state: ProjectState) {
  const features: ExtraFeature[] = [];

  if (state.cache !== "redis") {
    features.push("cache");
  }

  if (!state.health) {
    features.push("health-check");
  }

  if (!state.cronJobs) {
    features.push("internal-cron-jobs");
  }

  if (!state.eventJobs) {
    features.push("internal-event-jobs");
  }

  return {
    auth: !state.auth,
    features,
  };
}

export type AddArg =
  | { kind: "auth"; strategy: AuthStrategy }
  | { kind: "feature"; feature: ExtraFeature };

const FEATURE_ALIASES: Record<string, ExtraFeature> = {
  cache: "cache",
  redis: "cache",
  health: "health-check",
  "health-check": "health-check",
  cron: "internal-cron-jobs",
  "internal-cron-jobs": "internal-cron-jobs",
  events: "internal-event-jobs",
  "internal-event-jobs": "internal-event-jobs",
};

export function parseAddArgs(args: string[]): AddArg[] {
  const parsed: AddArg[] = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]?.toLowerCase();

    if (!arg) {
      continue;
    }

    if (arg === "auth") {
      const strategy = args[index + 1]?.toLowerCase();

      if (strategy !== "jwt" && strategy !== "oauth2") {
        throw new Error(
          'Use: kl-nest add auth jwt  ou  kl-nest add auth oauth2',
        );
      }

      parsed.push({ kind: "auth", strategy });
      index += 1;
      continue;
    }

    const feature = FEATURE_ALIASES[arg];

    if (!feature) {
      throw new Error(
        `Opção desconhecida: "${args[index]}". Use: cache, auth, health, cron, events.`,
      );
    }

    parsed.push({ kind: "feature", feature });
  }

  return parsed;
}

export function dedupeAddArgs(args: AddArg[]): AddArg[] {
  const seenFeatures = new Set<ExtraFeature>();
  const result: AddArg[] = [];

  for (const arg of args) {
    if (arg.kind === "auth") {
      if (!result.some((item) => item.kind === "auth")) {
        result.push(arg);
      }
      continue;
    }

    if (!seenFeatures.has(arg.feature)) {
      seenFeatures.add(arg.feature);
      result.push(arg);
    }
  }

  return result;
}
