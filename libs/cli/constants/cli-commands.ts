export const CliCommand = {
  HELP: 'help',
  NEW: 'new',
  ADD: 'add',
  VERSION: 'version',
} as const;

export type CliCommand = (typeof CliCommand)[keyof typeof CliCommand];

export const CliFlag = {
  HELP: '--help',
  HELP_SHORT: '-h',
  VERBOSE: '--verbose',
  NEW: '--new',
  NEW_SHORT: '-n',
  ADD: '--add',
  ADD_SHORT: '-a',
  VERSION: '--version',
  VERSION_SHORT: '-v',
  TEMPLATE: '--template',
  TEMPLATE_SHORT: '-t',
  PACKAGE_MANAGER: '--package-manager',
  PACKAGE_MANAGER_SHORT: '--pm',
  AUTH: '--auth',
  FEATURES: '--features',
  FEATURE: '--feature',
} as const;
