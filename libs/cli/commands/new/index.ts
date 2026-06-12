import * as p from "@clack/prompts";
import color from "picocolors";
import type { PackageManager } from "../../types/index.ts";
import { assertNotCancel } from "../../utils/cancel.ts";
import { createEmptyNestProject } from "./create-empty-nest-project.ts";

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
          hint: "em breve",
          disabled: true,
        },
        {
          value: "oauth2",
          label: "OAuth2",
          hint: "em breve",
          disabled: true,
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
          value: "tests",
          label: "Estrutura de testes unitários e E2E",
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

  const documentation = assertNotCancel(
    await p.select({
      message: "Builder de documentação",
      options: [
        { value: "scalar", label: "Scalar", hint: "em breve", disabled: true },
        {
          value: "swagger",
          label: "Swagger",
          hint: "em breve",
          disabled: true,
        },
        { value: "none", label: "Nenhuma" },
      ],
    }),
  );

  const spinner = p.spinner();

  spinner.start("Criando projeto...");

  await createEmptyNestProject(project.name, project.packageManager);

  if (auth !== "none") {
    spinner.message("Configurando autenticação...");
    await Bun.sleep(300);
  }

  if (features.length > 0) {
    spinner.message("Instalando funcionalidades extras...");
    await Bun.sleep(300);
  }

  if (documentation !== "none") {
    spinner.message("Configurando documentação...");
    await Bun.sleep(300);
  }

  spinner.stop("Projeto criado com sucesso!");

  p.note(
    [
      `${color.bold("Projeto:")} ${project.name}`,
      `${color.bold("Gerenciador:")} ${project.packageManager}`,
      `${color.bold("Autenticação:")} ${auth}`,
      `${color.bold("Extras:")} ${features.length ? features.join(", ") : color.dim("nenhum")}`,
      `${color.bold("Documentação:")} ${documentation}`,
    ].join("\n"),
    "Resumo",
  );
}
