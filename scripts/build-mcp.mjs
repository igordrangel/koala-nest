#!/usr/bin/env bun

import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'

const rootDir = process.cwd()
const mcpServerDir = path.join(rootDir, 'apps/mcp-server')
const mcpExtensionDir = path.join(rootDir, 'apps/mcp-vscode-extension')

console.log('🔨 Building MCP Server...')
try {
  execSync(`${path.join(rootDir, 'node_modules/.bin/tsc')}`, {
    cwd: mcpServerDir,
    stdio: 'inherit',
  })
  console.log('✅ MCP Server built successfully')
} catch {
  console.error('❌ Failed to build MCP Server')
  process.exit(1)
}

console.log('\n🔨 Building VS Code Extension...')
try {
  // Instalar dependências se não existirem
  if (!fs.existsSync(path.join(mcpExtensionDir, 'node_modules'))) {
    console.log('📦 Installing extension dependencies...')
    execSync('bun install', { cwd: mcpExtensionDir, stdio: 'inherit' })
  }

  execSync(`${path.join(mcpExtensionDir, 'node_modules/.bin/tsc')} -p .`, {
    cwd: mcpExtensionDir,
    stdio: 'inherit',
  })
  console.log('✅ VS Code Extension built successfully')
} catch {
  console.error('❌ Failed to build VS Code Extension')
  process.exit(1)
}

console.log('\n📦 Organizing builds...')

// Criar diretório de saída para a extensão
const extensionDistDir = path.join(mcpExtensionDir, 'dist')
const serverDistDir = path.join(mcpServerDir, 'dist')

if (!fs.existsSync(extensionDistDir)) {
  fs.mkdirSync(extensionDistDir, { recursive: true })
}

// Copiar servidor compilado para a extensão
const serverDestPath = path.join(extensionDistDir, 'server.js')
const serverSrcPath = path.join(serverDistDir, 'server.js')

if (fs.existsSync(serverSrcPath)) {
  fs.copyFileSync(serverSrcPath, serverDestPath)
  console.log('✅ Server copied to extension dist')
}

console.log('\n✨ Build complete!')
console.log(`
📍 MCP Server: ${serverDistDir}
📍 VS Code Extension: ${extensionDistDir}

Next steps:
1. Test the extension: F5 in VS Code Extension folder
2. Package extension: vsce package
3. Publish: vsce publish
`)
