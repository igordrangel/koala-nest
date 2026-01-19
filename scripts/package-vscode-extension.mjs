#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const extensionDir = join(rootDir, 'apps', 'mcp-vscode-extension');
const tempDir = join(rootDir, '.vscode-package-temp');

console.log('📦 Preparando extensão para empacotamento...\n');

// Limpar diretório temporário se existir
if (existsSync(tempDir)) {
  console.log('🧹 Limpando diretório temporário...');
  rmSync(tempDir, { recursive: true, force: true });
}

// Criar estrutura de diretórios
console.log('📁 Criando estrutura de diretórios...');
mkdirSync(tempDir, { recursive: true });
mkdirSync(join(tempDir, 'dist'), { recursive: true });

// Copiar arquivos necessários
console.log('📋 Copiando arquivos necessários...');

const filesToCopy = [
  { src: join(extensionDir, 'package.json'), dest: join(tempDir, 'package.json') },
  { src: join(extensionDir, 'README.md'), dest: join(tempDir, 'README.md') },
  { src: join(extensionDir, 'LICENSE'), dest: join(tempDir, 'LICENSE') },
  { src: join(extensionDir, 'dist', 'extension.js'), dest: join(tempDir, 'dist', 'extension.js') },
  { src: join(extensionDir, 'dist', 'server.js'), dest: join(tempDir, 'dist', 'server.js') },
];

filesToCopy.forEach(({ src, dest }) => {
  if (existsSync(src)) {
    copyFileSync(src, dest);
    console.log(`  ✅ ${src.replace(rootDir, '.')}`);
  } else {
    console.error(`  ❌ Arquivo não encontrado: ${src}`);
    process.exit(1);
  }
});

// Empacotar extensão
console.log('\n📦 Empacotando extensão...');
try {
  execSync('vsce package --no-dependencies', {
    cwd: tempDir,
    stdio: 'inherit'
  });

  // Mover .vsix para o diretório da extensão
  const { readdirSync } = await import('fs');
  const vsixFiles = readdirSync(tempDir).filter(f => f.endsWith('.vsix'));
  if (vsixFiles.length > 0) {
    const vsixFile = vsixFiles[0];
    const srcVsix = join(tempDir, vsixFile);
    const destVsix = join(extensionDir, vsixFile);
    
    if (existsSync(destVsix)) {
      rmSync(destVsix);
    }
    
    copyFileSync(srcVsix, destVsix);
    console.log(`\n✅ Extensão empacotada com sucesso: ${vsixFile}`);
    console.log(`📍 Localização: ${destVsix}`);
  }
} catch (error) {
  console.error('\n❌ Erro ao empacotar extensão:', error.message);
  process.exit(1);
}

// Limpar diretório temporário
console.log('\n🧹 Limpando arquivos temporários...');
rmSync(tempDir, { recursive: true, force: true });

console.log('\n✨ Concluído!\n');
