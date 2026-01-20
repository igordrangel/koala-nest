import chalk from 'chalk'
import { execSync } from 'node:child_process'
import { cpSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import inquirer from 'inquirer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Caminho para o template base (startup-project gerado de apps/example)
// De: src/commands/new-project/index.ts
// Para: dist-cli/templates/startup-project
// Relativo: ../../templates/startup-project
const TEMPLATE_BASE = join(__dirname, '../../templates/startup-project')
// De: src/commands/new-project/index.ts
// Para: dist-cli/templates
// Relativo: ../../templates
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
      // Extrair o caminho relativo ao template
      const relativePath = src.replace(TEMPLATE_BASE, '')
      
      // Ignorar node_modules e pasta .git dentro do template
      const isBlacklisted =
        relativePath.includes('/node_modules/') ||
        relativePath === '/.git' ||
        relativePath.startsWith('/.git/')
      
      return !isBlacklisted
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
    execSync(`cd ${projectName} && bun run build:prisma`, {
      stdio: 'inherit',
    })
  } catch {
    console.log(chalk.red('⚠️  Erro ao instalar dependências. Execute manualmente:'))
    console.log(chalk.gray(`  cd ${projectName}`))
    console.log(chalk.gray(`  bun install`))
    console.log(chalk.gray(`  bun run build:prisma`))
  }

  // 8. Perguntar sobre instalação do MCP Server
  const installMcp = await inquirer
    .prompt([
      {
        type: 'confirm',
        name: 'install',
        message: 'Deseja instalar o Koala Nest MCP Server localmente?',
        default: true,
      },
    ])
    .then((answers) => answers.install)

  if (installMcp) {
    const { installMcpServer } = await import('../mcp.js')
    try {
      await installMcpServer()
    } catch {
      console.log(chalk.red('⚠️  Erro ao instalar MCP Server'))
      console.log(chalk.gray('  Você pode instalar manualmente depois com:'))
      console.log(chalk.gray('  koala-nest mcp install'))
    }
  }

  console.log(chalk.green('\n✅ Projeto criado com sucesso!'))
  console.log(chalk.cyan('\n📚 Próximos passos:'))
  console.log(chalk.gray(`  cd ${projectName}`))
  console.log(chalk.gray(`  bun run prisma:deploy  # Executar migrations no banco`))
  console.log(chalk.gray(`  bun run start:dev       # Iniciar aplicação`))
  if (!installMcp) {
    console.log(chalk.gray(`\n💡 Para instalar o MCP Server depois:`))
    console.log(chalk.gray(`  koala-nest mcp install`))
  }
  console.log(chalk.gray(`\n📖 Documentação: https://github.com/igordrangel/koala-nest\n`))
}
