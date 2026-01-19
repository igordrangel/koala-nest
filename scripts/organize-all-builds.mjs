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
      
      console.log('✅ koala-nest lib reorganizado')
    }

    // ========================================
    // PASSO 2.5: Copiar README e package.json para dist
    // ========================================
    const rootReadme = path.resolve(__dirname, '../README.md')
    const distReadme = path.join(distDir, 'README.md')
    
    await fs.copyFile(rootReadme, distReadme)
    
    // Copiar package.json do apps/koala-nest para dist e adicionar dependências
    const appPackageJsonPath = path.resolve(__dirname, '../apps/koala-nest/package.json')
    const rootPackageJsonPath = path.resolve(__dirname, '../package.json')
    const distPackageJsonPath = path.join(distDir, 'package.json')
    
    const appPackageJson = JSON.parse(await fs.readFile(appPackageJsonPath, 'utf-8'))
    const rootPackageJson = JSON.parse(await fs.readFile(rootPackageJsonPath, 'utf-8'))
    
    // Remover campos que não devem estar no pacote publicado
    delete appPackageJson.publishConfig
    
    // Adicionar peerDependencies (libs que já vem por padrão no NestJS)
    appPackageJson.peerDependencies = {
      '@nestjs/common': rootPackageJson.dependencies['@nestjs/common'],
      '@nestjs/core': rootPackageJson.dependencies['@nestjs/core'],
      '@nestjs/platform-express': rootPackageJson.dependencies['@nestjs/platform-express'],
      'reflect-metadata': rootPackageJson.dependencies['reflect-metadata'],
      'rxjs': rootPackageJson.dependencies['rxjs']
    }
    
    // Adicionar dependencies (libs específicas do koala-nest)
    appPackageJson.dependencies = {
      '@koalarx/utils': rootPackageJson.dependencies['@koalarx/utils'],
      '@nestjs/config': rootPackageJson.dependencies['@nestjs/config'],
      '@nestjs/mapped-types': rootPackageJson.dependencies['@nestjs/mapped-types'],
      '@nestjs/passport': rootPackageJson.dependencies['@nestjs/passport'],
      '@nestjs/swagger': rootPackageJson.dependencies['@nestjs/swagger'],
      '@prisma/adapter-pg': rootPackageJson.dependencies['@prisma/adapter-pg'],
      '@prisma/client': rootPackageJson.dependencies['@prisma/client'],
      '@scalar/nestjs-api-reference': rootPackageJson.dependencies['@scalar/nestjs-api-reference'],
      'consola': rootPackageJson.dependencies['consola'],
      'dotenv': rootPackageJson.dependencies['dotenv'],
      'express-basic-auth': rootPackageJson.dependencies['express-basic-auth'],
      'ioredis': rootPackageJson.dependencies['ioredis'],
      'ngrok': rootPackageJson.dependencies['ngrok'],
      'passport': rootPackageJson.dependencies['passport'],
      'passport-custom': rootPackageJson.dependencies['passport-custom'],
      'pg': rootPackageJson.dependencies['pg'],
      'rimraf': rootPackageJson.dependencies['rimraf'],
      'zod': rootPackageJson.dependencies['zod'],
      'zod-validation-error': rootPackageJson.dependencies['zod-validation-error']
    }
    
    await fs.writeFile(distPackageJsonPath, JSON.stringify(appPackageJson, null, 2))
    
    console.log('📄 README.md e package.json copiados para dist')

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
