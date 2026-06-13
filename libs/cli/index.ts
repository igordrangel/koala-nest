#!/usr/bin/env bun

import { CliCommand, CliFlag } from './constants/cli-commands.ts';
import { printHelp } from './commands/help.ts';
import { runAdd } from './commands/add/index.ts';
import { runNew } from './commands/new/index.ts';
import { runVersion } from './commands/version.ts';
import { parseCliArgs } from './utils/cli-options.ts';

const HELP_COMMANDS = new Set<string>([
  CliCommand.HELP,
  CliFlag.HELP,
  CliFlag.HELP_SHORT,
]);

const VERSION_COMMANDS = new Set<string>([
  CliCommand.VERSION,
  CliFlag.VERSION,
  CliFlag.VERSION_SHORT,
]);

const NEW_COMMANDS = new Set<string>([
  CliCommand.NEW,
  CliFlag.NEW,
  CliFlag.NEW_SHORT,
]);

const ADD_COMMANDS = new Set<string>([
  CliCommand.ADD,
  CliFlag.ADD,
  CliFlag.ADD_SHORT,
]);

async function main(): Promise<void> {
  const { command, commandArgs } = parseCliArgs(process.argv.slice(2));

  if (command === undefined || HELP_COMMANDS.has(command)) {
    printHelp();
    return;
  }

  if (VERSION_COMMANDS.has(command)) {
    runVersion();
    return;
  }

  if (NEW_COMMANDS.has(command)) {
    await runNew(commandArgs);
    return;
  }

  if (ADD_COMMANDS.has(command)) {
    await runAdd(commandArgs);
    return;
  }

  console.error(`Comando desconhecido: ${command}\n`);
  printHelp();
  process.exit(1);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
