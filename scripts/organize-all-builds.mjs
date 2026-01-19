import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const distDir = path.resolve(__dirname, '../dist')

async function copyRecursively(src, dest) {
  const stat = await fs.stat(src)

  if (stat.isDirectory()) {
    await fs.mkdir(dest, { recursive: true })
    const files = await fs.readdir(src)

    for (const file of files) {
      const srcPath = path.join(src, file)
      const destPath = path.join(dest, file)
      await copyRecursively(srcPath, destPath)
    }
  } else {
    await fs.mkdir(path.dirname(dest), { recursive: true })
    await fs.copyFile(src, dest)
  }
}

async function organizeDistFolder() {
  try {
    console.log('🔨 Reorganizando estrutura de build...')

    // Verificar se dist existe
    const distExists = await fs
      .stat(distDir)
      .then(() => true)
      .catch(() => false)

    if (!distExists) {
      console.log('❌ Pasta dist não encontrada')
      return
    }

    // ========================================
    // PASSO 1: Mover src/app para apps/example (se existir nested)
    // ========================================
    const exampleSrcDir = path.join(distDir, 'apps/example/src')
    const exampleDirExists = await fs
      .stat(exampleSrcDir)
      .then(() => true)
      .catch(() => false)

    if (exampleDirExists) {
      console.log('🚀 Reorganizando exemplo app...')
      const files = await fs.readdir(exampleSrcDir)
      for (const file of files) {
        const srcPath = path.join(exampleSrcDir, file)
        const destPath = path.join(distDir, 'apps/example', file)
        await copyRecursively(srcPath, destPath)
      }
      // Remover a pasta src
      await fs.rm(exampleSrcDir, { recursive: true, force: true })
      console.log('✅ Exemplo app reorganizado')
    }

    // ========================================
    // PASSO 2: Reorganizar koala-nest lib
    // ========================================
    const libSrcDir = path.join(distDir, 'apps/koala-nest/src')
    const libSrcExists = await fs
      .stat(libSrcDir)
      .then(() => true)
      .catch(() => false)

    if (libSrcExists) {
      console.log('📦 Reorganizando koala-nest lib...')
      const files = await fs.readdir(libSrcDir)
      for (const file of files) {
        const srcPath = path.join(libSrcDir, file)
        const destPath = path.join(distDir, file)
        await copyRecursively(srcPath, destPath)
      }
      // Remover a pasta src
      await fs.rm(libSrcDir, { recursive: true, force: true })
      
      // Copiar README.md da raiz para dist
      const rootReadme = path.resolve(__dirname, '../README.md')
      const distReadme = path.join(distDir, 'README.md')
      await fs.copyFile(rootReadme, distReadme)
      
      console.log('✅ koala-nest lib reorganizado')
    }

    // ========================================
    // PASSO 3: Limpar estrutura desnecessária
    // ========================================
    console.log('🧹 Limpando estrutura...')

    // Remover prisma (não deve estar em dist de build)
    const prismaPath = path.join(distDir, 'prisma')
    const prismaStat = await fs
      .stat(prismaPath)
      .then(() => true)
      .catch(() => false)
    if (prismaStat) {
      await fs.rm(prismaPath, { recursive: true, force: true })
    }

    console.log('✨ Build organizado com sucesso!')
  } catch (error) {
    console.error('❌ Erro ao organizar build:', error.message)
    process.exit(1)
  }
}

organizeDistFolder()
