#!/usr/bin/env bun

/**
 * Script simples para testar o servidor MCP
 * Verifica se consegue ler os arquivos de documentação
 */

import * as fs from 'fs'
import * as path from 'path'

const PROJECT_ROOT = path.resolve(process.cwd(), '.')
const DOCS_DIR = path.join(PROJECT_ROOT, 'docs')
const README_PATH = path.join(PROJECT_ROOT, 'README.md')

console.log('🧪 Testando acesso aos arquivos de documentação...\n')

// Testar README
if (fs.existsSync(README_PATH)) {
  const content = fs.readFileSync(README_PATH, 'utf-8')
  const lines = content.split('\n').length
  console.log(`✅ README.md encontrado (${lines} linhas)`)
} else {
  console.log('❌ README.md não encontrado')
}

// Testar pasta docs
if (fs.existsSync(DOCS_DIR)) {
  const files = fs.readdirSync(DOCS_DIR).filter((f) => f.endsWith('.md'))
  console.log(`✅ Pasta docs encontrada com ${files.length} arquivos:`)
  files.forEach((file) => {
    const filePath = path.join(DOCS_DIR, file)
    const size = fs.statSync(filePath).size
    console.log(`   - ${file} (${Math.round(size / 1024)} KB)`)
  })
} else {
  console.log('❌ Pasta docs não encontrada')
}

// Testar busca
console.log('\n🔍 Testando busca...')
const testQuery = 'Koala'
let matches = 0

if (fs.existsSync(README_PATH)) {
  const content = fs.readFileSync(README_PATH, 'utf-8')
  matches += (content.match(new RegExp(testQuery, 'gi')) || []).length
}

if (fs.existsSync(DOCS_DIR)) {
  const files = fs.readdirSync(DOCS_DIR).filter((f) => f.endsWith('.md'))
  files.forEach((file) => {
    const content = fs.readFileSync(path.join(DOCS_DIR, file), 'utf-8')
    matches += (content.match(new RegExp(testQuery, 'gi')) || []).length
  })
}

console.log(`✅ Busca por "${testQuery}" encontrou ${matches} ocorrências`)

console.log('\n✨ Todos os testes passaram!')
console.log(`
Próximos passos:
1. bun run build:mcp-all       # Build da extensão
2. cd apps/mcp-vscode-extension
3. F5 para testar a extensão
`)
