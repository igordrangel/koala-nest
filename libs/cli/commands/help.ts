import color from "picocolors";

import { CLI_VERSION } from "../constants/version.ts";

export function printHelp(): void {
  console.log(`
${color.bold("Koala Nest CLI")} ${color.dim(`v${CLI_VERSION}`)}

${color.cyan("Uso:")}
  kl-nest ${color.dim("<comando>")} ${color.dim("[opções]")}

${color.cyan("Comandos:")}
  ${color.green("new")}       Cria um novo projeto
  ${color.green("add")}       Adiciona funcionalidades a um projeto existente
  ${color.green("version")}   Exibe a versão da CLI
  ${color.green("help")}      Exibe esta ajuda

${color.cyan("Add — funcionalidades:")}
  ${color.dim("auth jwt|oauth2")}   Autenticação
  ${color.dim("cache")}             Cache Redis (+ exemplos no CRUD)
  ${color.dim("health")}            GET /health
  ${color.dim("cron")}              Jobs com expressão cron
  ${color.dim("events")}            Jobs reativos a eventos

${color.cyan("Exemplos:")}
  kl-nest new
  kl-nest add cache
  kl-nest add auth jwt health
  kl-nest add cron events
  kl-nest version
`);
}
