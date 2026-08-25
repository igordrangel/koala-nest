import { chmodSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { PackageManager } from '@cli/types';
import { resolveProjectPath } from './resolve-project-path';

const ENTRYPOINT = `#!/bin/sh
set -e

exec node dist/host/main
`;

function dockerfileForBun(): string {
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

EXPOSE 3000

RUN chmod +x entrypoint.sh
CMD ["./entrypoint.sh"]
`;
}

function dockerfileForNpm(): string {
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

USER node

EXPOSE 3000

CMD ["./entrypoint.sh"]
`;
}

function dockerfileForPnpm(): string {
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

USER node

EXPOSE 3000

CMD ["./entrypoint.sh"]
`;
}

export function buildDockerfile(packageManager: PackageManager): string {
  switch (packageManager) {
    case 'bun':
      return dockerfileForBun();
    case 'npm':
      return dockerfileForNpm();
    case 'pnpm':
      return dockerfileForPnpm();
  }
}

export function writeDockerAssets(
  projectName: string,
  packageManager: PackageManager,
): void {
  const projectRoot = resolveProjectPath(projectName);
  const dockerfilePath = path.join(projectRoot, 'Dockerfile');
  const entrypointPath = path.join(projectRoot, 'entrypoint.sh');

  writeFileSync(dockerfilePath, buildDockerfile(packageManager));
  writeFileSync(entrypointPath, ENTRYPOINT);
  chmodSync(entrypointPath, 0o755);
}
