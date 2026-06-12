import color from 'picocolors';

import { CLI_VERSION } from '../constants/version.ts';

export function runVersion(): void {
  console.log(`${color.bold('kl-nest')} ${color.dim(`v${CLI_VERSION}`)}`);
}
