import color from 'picocolors';

import { CLI_VERSION } from '@cli/constants/version.ts';

export function printHelp(): void {
  console.log(`
${color.bold('Koala Nest CLI')} ${color.dim(`v${CLI_VERSION}`)}

${color.cyan('Uso:')}
  kl-nest ${color.dim('<comando>')} ${color.dim('[opções]')}

${color.cyan('Opções globais:')}
  ${color.dim('--verbose')}   Exibe a saída dos comandos externos (npm, bun, nest, …)

${color.cyan('New — opções:')}
  ${color.dim('-y, --yes')}          Pula perguntas e cria com os argumentos informados
  ${color.dim('<nome>')}              Nome do projeto (não pergunta de novo se já informado)
  ${color.dim('--template, -t')}     ${color.dim('default')} ou ${color.dim('crud')}
  ${color.dim('--pm')}                 ${color.dim('bun')}, ${color.dim('npm')} ou ${color.dim('pnpm')}
  ${color.dim('--auth')}               ${color.dim('none')}, ${color.dim('jwt')} ou ${color.dim('oauth2')}
  ${color.dim('--features')}           ${color.dim('cache,health,cron,events')} (vírgula)

${color.cyan('Comandos:')}
  ${color.green('new')}       Cria um novo projeto
  ${color.green('add')}       Adiciona funcionalidades a um projeto existente
  ${color.green('version')}   Exibe a versão da CLI
  ${color.green('help')}      Exibe esta ajuda

${color.cyan('Add — funcionalidades:')}
  ${color.dim('auth jwt|oauth2')}   Autenticação
  ${color.dim('cache')}             Cache Redis (+ exemplos no CRUD)
  ${color.dim('health')}            GET /health
  ${color.dim('cron')}              Jobs com expressão cron
  ${color.dim('events')}            Jobs reativos a eventos

${color.cyan('Exemplos:')}
  kl-nest new example
  kl-nest new my-api -y --template default --pm bun --auth none
  kl-nest new my-api -y --template crud --pm bun --auth jwt
  kl-nest new --verbose
  kl-nest add cache
  kl-nest add auth jwt health --verbose
  kl-nest add cron events
  kl-nest version
`);
}
