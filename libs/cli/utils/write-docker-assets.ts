import { chmodSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { PackageManager } from '@cli/types';
import { AppType } from '@cli/constants/domain';
import { resolveProjectPath } from './resolve-project-path';

const ENTRYPOINT = `#!/bin/sh
set -e

exec node dist/host/main
`;

function dockerfileForBun(exposeHttp: boolean): string {
  const expose = exposeHttp ? '\nEXPOSE 3000\n' : '\n';

  return `ARG BUN_IMAGE=oven/bun:1.3.6-debian

# ====== STAGE 1: BUILDER ======
FROM \${BUN_IMAGE} AS builder

WORKDIR /home/bun/app

USER root
RUN chown -R bun:bun /home/bun/app
USER bun

COPY --chown=bun:bun . .

RUN bun ci
RUN bun run build

# ====== STAGE 2: RUNTIME ======
FROM \${BUN_IMAGE}

WORKDIR /home/bun/app

COPY --from=builder --chown=bun:bun /home/bun/app/node_modules ./node_modules
COPY --from=builder --chown=bun:bun /home/bun/app/dist ./dist
COPY --from=builder --chown=bun:bun /home/bun/app/package.json ./package.json
COPY --from=builder --chown=bun:bun /home/bun/app/entrypoint.sh ./entrypoint.sh

USER bun
${expose}
RUN chmod +x entrypoint.sh
CMD ["./entrypoint.sh"]
`;
}

function dockerfileForNpm(exposeHttp: boolean): string {
  const expose = exposeHttp ? '\nEXPOSE 3000\n' : '\n';

  return `FROM node:22-bookworm-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-bookworm-slim

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/entrypoint.sh ./entrypoint.sh

RUN chmod +x entrypoint.sh
USER node
${expose}
CMD ["./entrypoint.sh"]
`;
}

function dockerfileForPnpm(exposeHttp: boolean): string {
  const expose = exposeHttp ? '\nEXPOSE 3000\n' : '\n';

  return `FROM node:22-bookworm-slim AS builder

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

FROM node:22-bookworm-slim

WORKDIR /app

RUN corepack enable

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/entrypoint.sh ./entrypoint.sh

RUN chmod +x entrypoint.sh
USER node
${expose}
CMD ["./entrypoint.sh"]
`;
}

export function buildDockerfile(
  packageManager: PackageManager,
  appType: AppType = AppType.API,
): string {
  const exposeHttp = appType === AppType.API;

  switch (packageManager) {
    case 'bun':
      return dockerfileForBun(exposeHttp);
    case 'npm':
      return dockerfileForNpm(exposeHttp);
    case 'pnpm':
      return dockerfileForPnpm(exposeHttp);
  }
}

export function writeDockerAssets(
  projectName: string,
  packageManager: PackageManager,
  appType: AppType = AppType.API,
): void {
  const projectRoot = resolveProjectPath(projectName);
  const dockerfilePath = path.join(projectRoot, 'Dockerfile');
  const entrypointPath = path.join(projectRoot, 'entrypoint.sh');

  writeFileSync(dockerfilePath, buildDockerfile(packageManager, appType));
  writeFileSync(entrypointPath, ENTRYPOINT);
  chmodSync(entrypointPath, 0o755);
}
