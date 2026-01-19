import chalk from 'chalk'
import { execSync } from 'node:child_process'
import { cpSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Caminho para a pasta example no monorepo (será o template base)
const TEMPLATE_BASE = join(__dirname, '../../../example')
const TEMPLATES_DIR = join(__dirname, '../../templates')

export async function newProject(projectName: string) {
  const targetDir = join(process.cwd(), projectName)

  console.log(chalk.blue('🚀 Criando projeto Koala Nest...'))
  console.log(chalk.gray(`📁 Destino: ${targetDir}\n`))

  // 1. Copiar estrutura base do example
  console.log(chalk.yellow('📋 Copiando estrutura base...'))
  cpSync(TEMPLATE_BASE, targetDir, {
    recursive: true,
    filter: (src) => {
      // Ignorar node_modules e arquivos de build
      return !src.includes('node_modules') && 
             !src.includes('dist') && 
             !src.includes('.git')
    }
  })

  // 2. Adicionar arquivos extras dos templates
  console.log(chalk.yellow('📦 Adicionando configurações extras...'))
  
  // Copiar Dockerfile
  const dockerfilePath = join(TEMPLATES_DIR, 'startup-project', 'Dockerfile')
  try {
    cpSync(dockerfilePath, join(targetDir, 'Dockerfile'))
  } catch {
    console.log(chalk.red('⚠️  Dockerfile não encontrado nos templates, pulando...'))
  }

  // 3. Atualizar package.json
  console.log(chalk.yellow('⚙️  Configurando package.json...'))
  const packageJsonPath = join(targetDir, 'package.json')
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
  packageJson.name = projectName
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))

  // 4. Atualizar README.md
  console.log(chalk.yellow('📄 Atualizando README...'))
  const readmePath = join(targetDir, 'README.md')
  let readme = readFileSync(readmePath, 'utf-8')
  readme = readme.replace(/\[projectName\]/g, projectName)
  writeFileSync(readmePath, readme)

  // 5. Criar .env
  console.log(chalk.yellow('🔐 Criando arquivo .env...'))
  const envTemplate = readFileSync(join(TEMPLATES_DIR, 'env', 'config.txt'), 'utf-8')
  const envContent = envTemplate.replace(/\[projectName\]/g, projectName.replace(/-/g, '_'))
  writeFileSync(join(targetDir, '.env'), envContent)

  // 6. Criar .gitignore
  console.log(chalk.yellow('🚫 Criando .gitignore...'))
  const gitIgnoreContent = readFileSync(join(TEMPLATES_DIR, 'gitignore', 'config.txt'), 'utf-8')
  writeFileSync(join(targetDir, '.gitignore'), gitIgnoreContent)

  // 7. Instalar dependências e gerar Prisma
  console.log(chalk.yellow('\n📥 Instalando dependências...'))
  try {
    execSync(`cd ${projectName} && bun install`, {
      stdio: 'inherit',
    })

    console.log(chalk.yellow('🔨 Gerando Prisma Client...'))
    execSync(`cd ${projectName} && bun build:prisma`, {
      stdio: 'inherit',
    })
  } catch {
    console.log(chalk.red('⚠️  Erro ao instalar dependências. Execute manualmente:'))
    console.log(chalk.gray(`  cd ${projectName}`))
    console.log(chalk.gray(`  bun install`))
    console.log(chalk.gray(`  bun build:prisma`))
  }

  console.log(chalk.green('\n✅ Projeto criado com sucesso!'))
  console.log(chalk.cyan('\n📚 Próximos passos:'))
  console.log(chalk.gray(`  cd ${projectName}`))
  console.log(chalk.gray(`  bun run start:dev`))
  console.log(chalk.gray(`\n📖 Documentação: https://github.com/igordrangel/koala-nest\n`))
}
