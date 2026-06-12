import { spawn } from "node:child_process";

export function runCommand(
  command: string[],
  cwd = process.cwd(),
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const childProcess = spawn(command[0]!, command.slice(1), { cwd });

    childProcess.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Command ${command} failed with code ${code}`));
      }
      resolve();
    });
  });
}
