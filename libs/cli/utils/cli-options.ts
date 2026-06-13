let verbose = false;

export function setCliVerbose(value: boolean) {
  verbose = value;
}

export function isCliVerbose() {
  return verbose;
}

export function resetCliVerbose() {
  verbose = false;
}

export type ParsedCliArgs = {
  command?: string;
  commandArgs: string[];
  verbose: boolean;
};

/** Remove flags globais e ativa o modo verbose quando presente. */
export function parseCliArgs(argv: string[]): ParsedCliArgs {
  let enabled = false;
  const rest: string[] = [];

  for (const arg of argv) {
    if (arg === '--verbose') {
      enabled = true;
      continue;
    }

    rest.push(arg);
  }

  setCliVerbose(enabled);

  return {
    command: rest[0],
    commandArgs: rest.slice(1),
    verbose: enabled,
  };
}
