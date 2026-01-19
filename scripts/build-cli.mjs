import { rmSync, cpSync, writeFileSync, readFileSync, mkdirSync } from 'fs'
import { execSync } from 'child_process'
import { join } from 'path'

const cliDistDir = 'dist-cli'

console.log('🔨 Building CLI...\n')

// 1. Limpar dist anterior
if (rmSync) {
  rmSync(cliDistDir, { recursive: true, force: true })
}

// 2. Compilar TypeScript
console.log('📦 Compiling TypeScript...')
execSync('tsc -p apps/koala-nest-cli/tsconfig.json --outDir dist-cli', {
  stdio: 'inherit',
})

// Mover tsconfig.tsbuildinfo para dist-cli
try {
  const { renameSync, existsSync } = await import('fs')
  if (existsSync('tsconfig.tsbuildinfo')) {
    renameSync('tsconfig.tsbuildinfo', 'dist-cli/tsconfig.tsbuildinfo')
  }
} catch {
  // Ignora se o arquivo não existir
}

// 3. Copiar package.json e atualizar
console.log('📋 Copying package.json...')
const packageJson = JSON.parse(
  readFileSync('apps/koala-nest-cli/package.json', 'utf-8'),
)
const rootPackageJson = JSON.parse(readFileSync('package.json', 'utf-8'))

// Adicionar dependências necessárias
packageJson.dependencies = {
  chalk: rootPackageJson.dependencies.chalk,
  commander: rootPackageJson.dependencies.commander,
  inquirer: rootPackageJson.dependencies.inquirer,
  shelljs: rootPackageJson.dependencies.shelljs,
}

// Atualizar version do root
packageJson.version = rootPackageJson.version

writeFileSync(
  join(cliDistDir, 'package.json'),
  JSON.stringify(packageJson, null, 2),
)

// 4. Copiar templates (sem startup-project, que será gerado de apps/example)
console.log('📁 Copying templates...')
mkdirSync(join(cliDistDir, 'templates'), { recursive: true })
cpSync('apps/koala-nest-cli/templates', join(cliDistDir, 'templates'), {
  recursive: true,
  filter: (src) => {
    // Ignorar startup-project, será gerado de apps/example
    return !src.includes('startup-project')
  },
})

// 4.5. Gerar templates/startup-project a partir de apps/example (fonte única da verdade)
console.log('📁 Generating startup-project template from apps/example...')
mkdirSync(join(cliDistDir, 'templates', 'startup-project'), { recursive: true })
cpSync('apps/example', join(cliDistDir, 'templates', 'startup-project'), {
  recursive: true,
  filter: (src) => {
    return (
      !src.includes('node_modules') &&
      !src.includes('dist') &&
      !src.includes('.git')
    )
  },
})
cpSync(
  'apps/koala-nest-cli/templates/root-files-folders',
  join(cliDistDir, 'templates', 'startup-project'),
  { recursive: true },
)
rmSync(join(cliDistDir, 'templates', 'root-files-folders'), { recursive: true })

// 4.7. Copiar prisma/ (schema e config)
console.log('📁 Copying prisma schema...')
mkdirSync(join(cliDistDir, 'templates', 'startup-project', 'prisma'), {
  recursive: true,
})
cpSync('prisma', join(cliDistDir, 'templates', 'startup-project', 'prisma'), {
  recursive: true,
  filter: (src) => {
    return !src.includes('node_modules') && !src.includes('.git')
  },
})

// 4.8. Copiar prisma.config.ts para o template
console.log('📋 Copying prisma.config.ts...')
cpSync(
  'prisma.config.ts',
  join(cliDistDir, 'templates', 'startup-project', 'prisma.config.ts'),
  {
    force: true,
  },
)

// 4.9. Copiar eslint.config.mts para o template
console.log('📋 Copying eslint.config.mts...')
cpSync(
  'eslint.config.mts',
  join(cliDistDir, 'templates', 'startup-project', 'eslint.config.mts'),
  {
    force: true,
  },
)

// 4.10. Copiar .prettierrc para o template
console.log('📋 Copying .prettierrc.json...')
cpSync(
  '.prettierrc.json',
  join(cliDistDir, 'templates', 'startup-project', '.prettierrc.json'),
  {
    force: true,
  },
)

// 4.11. Atualizar versão do @koalarx/nest no template
console.log('📦 Updating @koalarx/nest version in template...')
const startupProjectPackageJsonPath = join(
  cliDistDir,
  'templates',
  'startup-project',
  'package.json',
)
const startupProjectPackageJson = JSON.parse(
  readFileSync(startupProjectPackageJsonPath, 'utf-8'),
)
startupProjectPackageJson.dependencies['@koalarx/nest'] =
  `^${rootPackageJson.version}`
writeFileSync(
  startupProjectPackageJsonPath,
  JSON.stringify(startupProjectPackageJson, null, 2),
)

// 5. Copiar README e LICENSE
console.log('📄 Copying README and LICENSE...')
cpSync('apps/koala-nest-cli/README.md', join(cliDistDir, 'README.md'), {
  force: true,
})
cpSync('LICENSE', join(cliDistDir, 'LICENSE'), { force: true })

// 6. Tornar index.js executável
console.log('🔧 Making CLI executable...')
try {
  execSync(`chmod +x ${join(cliDistDir, 'index.js')}`, { stdio: 'inherit' })
} catch {
  console.log('⚠️  Could not chmod (Windows?)')
}

console.log('\n✅ CLI build completed!')
console.log(`📍 Output: ${cliDistDir}/\n`)
