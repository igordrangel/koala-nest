import { spawn } from 'node:child_process';
import { isCliVerbose } from './cli-options';

export type RunCommandOptions = {
  verbose?: boolean;
};

export function runCommand(
  command: string[],
  cwd = process.cwd(),
  options: RunCommandOptions = {},
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const verbose = options.verbose ?? isCliVerbose();
    const childProcess = spawn(command[0]!, command.slice(1), {
      cwd,
      stdio: verbose ? 'inherit' : 'pipe',
    });

    let stderr = '';

    childProcess.stderr?.on('data', (chunk: Buffer | string) => {
      if (verbose) {
        return;
      }

      stderr += chunk.toString();
    });

    childProcess.on('close', (code) => {
      if (code !== 0) {
        if (!verbose && stderr.trim()) {
          process.stderr.write(stderr);
        }

        reject(
          new Error(`Command ${command.join(' ')} failed with code ${code}`),
        );
        return;
      }

      resolve();
    });

    childProcess.on('error', (error) => {
      reject(error);
    });
  });
}
