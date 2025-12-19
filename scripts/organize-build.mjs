import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const distDir = path.resolve(__dirname, '../dist')
const srcDir = path.resolve(distDir, 'apps/koala-nest/src')

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
    // Verificar se a pasta apps/koala-nest/src existe
    const srcDirExists = await fs
      .stat(srcDir)
      .then(() => true)
      .catch(() => false)

    if (!srcDirExists) {
      console.log('Pasta de origem não encontrada:', srcDir)
      return
    }

    // Copiar recursivamente de src para dist
    const files = await fs.readdir(srcDir)
    for (const file of files) {
      const srcPath = path.join(srcDir, file)
      const destPath = path.join(distDir, file)
      await copyRecursively(srcPath, destPath)
    }

    // Remover pastas de apps e prisma
    await fs.rm(path.join(distDir, 'apps'), { recursive: true, force: true })
    await fs.rm(path.join(distDir, 'prisma'), { recursive: true, force: true })

    console.log('Build organizado com sucesso!')
  } catch (error) {
    console.error('Erro ao organizar build:', error)
    process.exit(1)
  }
}

organizeDistFolder()
