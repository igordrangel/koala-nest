import color from "picocolors";

import { CLI_VERSION } from "../constants/version.ts";

export function printHelp(): void {
  console.log(`
${color.bold("Koala Nest CLI")} ${color.dim(`v${CLI_VERSION}`)}

${color.cyan("Uso:")}
  kl-nest ${color.dim("<comando>")}

${color.cyan("Comandos:")}
  ${color.green("new")}       Cria um novo projeto
  ${color.green("version")}   Exibe a versão da CLI
  ${color.green("help")}      Exibe esta ajuda

${color.cyan("Exemplos:")}
  kl-nest version
  kl-nest --help
  kl-nest new
`);
}
