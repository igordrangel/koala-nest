#!/usr/bin/env bun

import { printHelp } from "./commands/help.ts";
import { runNew } from "./commands/new/index.ts";
import { runVersion } from "./commands/version.ts";

const [, , command] = process.argv;

async function main(): Promise<void> {
  switch (command) {
    case undefined:
    case "help":
    case "--help":
    case "-h":
      printHelp();
      break;

    case "version":
    case "--version":
    case "-v":
      runVersion();
      break;

    case "new":
    case "--new":
    case "-n":
      await runNew();
      break;

    default:
      console.error(`Comando desconhecido: ${command}\n`);
      printHelp();
      process.exit(1);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
