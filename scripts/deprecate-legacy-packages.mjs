#!/usr/bin/env bun

/**
 * Marca pacotes legados como descontinuados no npm.
 *
 * Uso:
 *   NPM_TOKEN=<token> bun scripts/deprecate-legacy-packages.mjs
 *
 * Requer permissão de publicação nos pacotes @koalarx/nest-cli e @koalarx/mcp-server.
 */

import { spawnSync } from 'node:child_process';

const deprecations = [
  {
    name: '@koalarx/nest-cli',
    message:
      'Descontinuado na v4: use @koalarx/nest (comando kl-nest). Veja https://github.com/igordrangel/koala-nest',
  },
  {
    name: '@koalarx/mcp-server',
    message:
      'Descontinuado na v4: use https://nest.koalarx.com/llm.txt para documentação de agentes de IA',
  },
];

function deprecatePackage(name, message) {
  const result = spawnSync('npm', ['deprecate', name, message], {
    stdio: 'inherit',
    env: process.env,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (!process.env.NPM_TOKEN) {
  console.error('Defina NPM_TOKEN antes de executar este script.');
  process.exit(1);
}

for (const item of deprecations) {
  console.log(`Deprecating ${item.name}...`);
  deprecatePackage(item.name, item.message);
}

console.log('Pacotes legados marcados como descontinuados.');
