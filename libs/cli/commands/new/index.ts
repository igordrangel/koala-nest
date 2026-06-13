import * as p from "@clack/prompts";
import color from "picocolors";
import type { PackageManager } from "../../types/index.ts";
import { assertNotCancel } from "../../utils/cancel.ts";
import { createEmptyNestProject } from "./create-empty-nest-project.ts";
import { createDDDStructure } from "./create-ddd-structure.ts";
import {
  installModule,
  Modules,
  type Template,
} from "../../utils/install-module.ts";
import { fixLintConfig } from "./fix-lint-config.ts";

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
            { value: "default", label: "Padrão" },
            { value: "crudSample", label: "Exemplo de CRUD" },
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

  const auth = assertNotCancel(
    await p.select({
      message: "Estratégia de autenticação",
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
        { value: "none", label: "Nenhuma" },
      ],
    }),
  );

  const features = assertNotCancel(
    await p.multiselect({
      message: "Funcionalidades extras",
      options: [
        {
          value: "cache",
          label: "Cache (Redis)",
          hint: "em breve",
          disabled: true,
        },
        {
          value: "health-check",
          label: "Health check (GET /health)",
          hint: "em breve",
          disabled: true,
        },
        {
          value: "internal-cron-jobs",
          label: "Jobs internos (Cron)",
          hint: "em breve",
          disabled: true,
        },
        {
          value: "internal-event-jobs",
          label: "Jobs internos (Eventos)",
          hint: "em breve",
          disabled: true,
        },
      ],
      required: false,
    }),
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

  if (auth !== "none") {
    spinner.message("Configurando autenticação...");
    await installModule(Modules.AUTH, project.template, project.name, {
      authStrategy: auth as "jwt" | "oauth2",
    });
  }

  if (features.length > 0) {
    spinner.message("Instalando funcionalidades extras...");
    await Bun.sleep(300);
  }

  spinner.stop("Projeto criado com sucesso!");

  p.note(
    [
      `${color.bold("Projeto:")} ${project.name}`,
      `${color.bold("Gerenciador:")} ${project.packageManager}`,
      `${color.bold("Autenticação:")} ${auth}`,
      `${color.bold("Extras:")} ${features.length ? features.join(", ") : color.dim("nenhum")}`,
    ].join("\n"),
    "Resumo",
  );
}
