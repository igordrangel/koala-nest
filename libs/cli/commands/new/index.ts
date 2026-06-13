import * as p from "@clack/prompts";
import color from "picocolors";
import type { PackageManager } from "../../types/index.ts";
import { assertNotCancel } from "../../utils/cancel.ts";
import { applyOptionalFeatures } from "../../utils/apply-optional-features.ts";
import { createEmptyNestProject } from "./create-empty-nest-project.ts";
import { createDDDStructure } from "./create-ddd-structure.ts";
import {
  CRUD_BUNDLED_FEATURES,
  installModule,
  Modules,
  resolveNewProjectOptions,
  resolveProjectFeatures,
  type ExtraFeature,
  type Template,
} from "../../utils/install-module.ts";
import { fixLintConfig } from "./fix-lint-config.ts";

async function promptAuthStrategy(template: Template) {
  const isCrud = template === "crudSample";

  return assertNotCancel(
    await p.select({
      message: isCrud
        ? "Estratégia de autenticação (incluída no exemplo CRUD)"
        : "Estratégia de autenticação",
      options: [
        {
          value: "jwt",
          label: "JWT",
          hint: "RS256 + guards globais",
        },
        {
          value: "oauth2",
          label: "OAuth2",
          hint: "JWT + OAuth2 genérico",
        },
        {
          value: "api-key",
          label: "API Key",
          hint: "em breve",
          disabled: true,
        },
        ...(isCrud
          ? []
          : [{ value: "none" as const, label: "Nenhuma" }]),
      ],
    }),
  ) as "jwt" | "oauth2" | "none";
}

async function promptExtraFeatures(template: Template) {
  if (template === "crudSample") {
    const bundled = CRUD_BUNDLED_FEATURES.map((feature) => {
      switch (feature) {
        case "cache":
          return "cache (Redis)";
        case "internal-cron-jobs":
          return "cron jobs";
        case "internal-event-jobs":
          return "event jobs";
      }
    }).join(", ");

    p.note(
      `O exemplo CRUD já inclui: ${bundled} e autenticação.\n` +
        "Escolha abaixo apenas funcionalidades adicionais.",
      "Incluso no template",
    );

    return assertNotCancel(
      await p.multiselect({
        message: "Funcionalidades extras adicionais",
        options: [
          {
            value: "health-check",
            label: "Health check (GET /health)",
          },
        ],
        required: false,
      }),
    ) as ExtraFeature[];
  }

  return assertNotCancel(
    await p.multiselect({
      message: "Funcionalidades extras",
      options: [
        {
          value: "cache",
          label: "Cache (Redis)",
          hint: "ICacheService + ioredis",
        },
        {
          value: "health-check",
          label: "Health check (GET /health)",
        },
        {
          value: "internal-cron-jobs",
          label: "Jobs internos (Cron)",
          hint: "cron-parser + bases",
        },
        {
          value: "internal-event-jobs",
          label: "Jobs internos (Eventos)",
          hint: "EventJob + bases",
        },
      ],
      required: false,
    }),
  ) as ExtraFeature[];
}

export async function runNew(): Promise<void> {
  p.intro(
    `${color.bgCyan(color.black(" koala-nest "))} ${color.dim("Criar novo projeto")}`,
  );

  const project = await p.group(
    {
      name: () =>
        p.text({
          message: "Nome do projeto",
          placeholder: "my-api",
          validate: (value) => (value ? undefined : "Campo obrigatório"),
        }),
      packageManager: () =>
        p.select<PackageManager>({
          message: "Gerenciador de pacotes",
          options: [
            { value: "bun", label: "Bun", hint: "recomendado" },
            { value: "npm", label: "npm" },
            { value: "pnpm", label: "pnpm" },
          ],
        }),
      template: () =>
        p.select<Template>({
          message: "Template",
          options: [
            {
              value: "default",
              label: "Padrão",
              hint: "sem código de exemplo",
            },
            {
              value: "crudSample",
              label: "Exemplo de CRUD",
              hint: "Person + auth, cache e jobs",
            },
          ],
        }),
    },
    {
      onCancel: () => {
        p.cancel("Operação cancelada.");
        process.exit(0);
      },
    },
  );

  const auth = await promptAuthStrategy(project.template);
  const selectedFeatures = await promptExtraFeatures(project.template);
  const { auth: authChoice, features } = resolveNewProjectOptions(
    project.template,
    auth,
    selectedFeatures,
  );

  const spinner = p.spinner();

  spinner.start("Criando projeto...");

  await createEmptyNestProject(project.name, project.packageManager);

  spinner.message("Definindo estrutura de pastas...");

  await createDDDStructure(project.name, project.packageManager);

  spinner.message("Aplicando configuração de lint...");

  fixLintConfig(project.name);

  spinner.message("Instalando módulo core...");

  await installModule(Modules.CORE, project.template, project.name);

  spinner.message("Instalando funcionalidades opcionais...");

  await applyOptionalFeatures({
    projectName: project.name,
    template: project.template,
    auth: authChoice,
    features,
  });

  spinner.stop("Projeto criado com sucesso!");

  const projectFeatures = resolveProjectFeatures(features, authChoice);

  const extrasSummary = [
    project.template === "crudSample" ? color.dim("exemplo Person completo") : null,
    projectFeatures.cacheWithRedis ? "cache (Redis)" : null,
    projectFeatures.cache && !projectFeatures.cacheWithRedis
      ? color.dim("cache em memória")
      : null,
    projectFeatures.health ? "health-check" : null,
    projectFeatures.cronJobs ? "cron jobs" : null,
    projectFeatures.eventJobs ? "event jobs" : null,
  ]
    .filter(Boolean)
    .join(", ");

  p.note(
    [
      `${color.bold("Projeto:")} ${project.name}`,
      `${color.bold("Template:")} ${project.template === "crudSample" ? "Exemplo de CRUD" : "Padrão"}`,
      `${color.bold("Gerenciador:")} ${project.packageManager}`,
      `${color.bold("Autenticação:")} ${authChoice}`,
      `${color.bold("Extras:")} ${extrasSummary || color.dim("nenhum")}`,
      `${color.dim("Depois:")} cd ${project.name} && kl-nest add <feature>`,
    ].join("\n"),
    "Resumo",
  );
}
