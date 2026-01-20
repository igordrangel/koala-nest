#!/usr/bin/env bun

import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'

const rootDir = process.cwd()
const mcpServerDir = path.join(rootDir, 'apps/mcp-server')
const mcpExtensionDir = path.join(rootDir, 'apps/mcp-vscode-extension')

console.log('🔨 Building MCP Server...')
try {
  const tscPath = path.join(rootDir, 'node_modules/.bin/tsc')
  execSync(`"${tscPath}"`, {
    cwd: mcpServerDir,
    stdio: 'inherit',
    shell: '/bin/bash'
  })
  
  // Verificar se a dist foi criada
  const distDir = path.join(mcpServerDir, 'dist')
  if (!fs.existsSync(distDir)) {
    throw new Error('TypeScript compilation failed - dist folder not created')
  }
  
  // Verificar se server.js existe
  const serverJsPath = path.join(distDir, 'server.js')
  if (!fs.existsSync(serverJsPath)) {
    throw new Error('TypeScript compilation failed - server.js not found')
  }
  
  // Copiar pasta docs para dentro da dist do MCP Server
  const docsSourceDir = path.join(rootDir, 'docs')
  const docsDestDir = path.join(distDir, 'docs')
  
  if (fs.existsSync(docsSourceDir)) {
    // Remover pasta docs antiga se existir
    if (fs.existsSync(docsDestDir)) {
      fs.rmSync(docsDestDir, { recursive: true })
    }
    
    // Copiar pasta docs
    fs.mkdirSync(docsDestDir, { recursive: true })
    const docFiles = fs.readdirSync(docsSourceDir)
    docFiles.forEach(file => {
      const srcFile = path.join(docsSourceDir, file)
      const destFile = path.join(docsDestDir, file)
      if (fs.statSync(srcFile).isFile()) {
        fs.copyFileSync(srcFile, destFile)
      }
    })
    console.log('✅ Documentation files copied to dist/docs')
  }
  
  // Copiar README.md do root para dentro da dist do MCP Server
  const readmeSource = path.join(rootDir, 'README.md')
  const readmeDest = path.join(distDir, 'README-PROJECT.md')
  if (fs.existsSync(readmeSource)) {
    fs.copyFileSync(readmeSource, readmeDest)
    console.log('✅ README copied to dist/README-PROJECT.md')
  }
  
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

  const tscExtPath = path.join(rootDir, 'node_modules/.bin/tsc')
  execSync(`"${tscExtPath}" -p .`, {
    cwd: mcpExtensionDir,
    stdio: 'inherit',
    shell: '/bin/bash'
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
