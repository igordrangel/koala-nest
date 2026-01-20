import https from 'https'
import fs from 'fs'
import path from 'path'
import os from 'os'
import * as tar from 'tar'
import chalk from 'chalk'
import { execSync } from 'child_process'

const GITHUB_REPO = 'igordrangel/koala-nest'
const MCP_SERVER_TAG_PREFIX = 'mcp-server@'
const INSTALL_DIR = path.join(os.homedir(), '.koala-nest', 'mcp-server')

interface GitHubRelease {
  tag_name: string
  assets: Array<{
    name: string
    browser_download_url: string
  }>
}

export async function installMcpServer(): Promise<void> {
  try {
    // Buscar última release
    const release = await getLatestRelease()
    const version = release.tag_name.replace(MCP_SERVER_TAG_PREFIX, '')
    
    console.log(chalk.gray(`\n   Found version: ${version}\n`))

    // Verificar se já está instalado
    if (fs.existsSync(INSTALL_DIR)) {
      const currentVersion = await getInstalledVersion()
      if (currentVersion === version) {
        console.log(chalk.yellow(`   ⚠  MCP Server v${version} is already installed`))
        console.log(chalk.gray(`   Run 'koala-nest mcp:update' to check for updates\n`))
        return
      }
      console.log(chalk.gray(`   Upgrading from v${currentVersion} to v${version}\n`))
    }

    // Baixar release
    const asset = release.assets.find(a => a.name.endsWith('.tar.gz'))
    if (!asset) {
      throw new Error('MCP Server package not found in release')
    }

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'koala-mcp-'))
    const tarballPath = path.join(tempDir, 'server.tar.gz')
    
    process.stdout.write(chalk.blue(`   📥 Downloading MCP Server v${version}...`))
    await downloadFile(asset.browser_download_url, tarballPath)
    process.stdout.write('\r' + chalk.green(`   ✅ Downloaded MCP Server v${version}   \n`))

    // Extrair
    process.stdout.write(chalk.blue(`   📦 Extracting files...`))
    if (fs.existsSync(INSTALL_DIR)) {
      fs.rmSync(INSTALL_DIR, { recursive: true })
    }
    fs.mkdirSync(INSTALL_DIR, { recursive: true })

    await tar.extract({
      file: tarballPath,
      cwd: INSTALL_DIR
    })
    process.stdout.write('\r' + chalk.green(`   ✅ Files extracted successfully   \n`))

    // Limpar
    fs.rmSync(tempDir, { recursive: true })

    // Instalar dependências do servidor
    process.stdout.write(chalk.blue(`   📦 Installing server dependencies...\n`))
    try {
      execSync('npm install --omit=dev', {
        cwd: INSTALL_DIR,
        stdio: 'inherit'
      })
      console.log(chalk.green(`   ✅ Dependencies installed`))
    } catch (error) {
      console.log(chalk.yellow(`   ⚠  Could not install dependencies`))
      console.log(chalk.gray(`   You may need to run: cd ${INSTALL_DIR} && npm install`))
    }

    // Salvar versão
    fs.writeFileSync(
      path.join(INSTALL_DIR, '.version'),
      version
    )

    console.log(chalk.green(`   ✅ MCP Server v${version} installed successfully!`))
    console.log(chalk.gray(`   📂 Installation directory: ${INSTALL_DIR}`))

    // Configurar mcp.json
    await configureMcpJson()
    
    console.log(chalk.cyan(`\n✨ Installation completed successfully!\n`))

  } catch (error) {
    console.error(chalk.red(`\n   ❌ Installation failed:`), error)
    throw error
  }
}

export async function updateMcpServer(): Promise<void> {
  console.log(chalk.blue('\n🔄 Checking for MCP Server updates...\n'))

  try {
    const currentVersion = await getInstalledVersion()
    
    if (!currentVersion) {
      console.log(chalk.yellow('   ⚠  MCP Server not installed'))
      console.log(chalk.gray(`   Run 'koala-nest mcp install' to install it\n`))
      return
    }

    const release = await getLatestRelease()
    const latestVersion = release.tag_name.replace(MCP_SERVER_TAG_PREFIX, '')

    console.log(chalk.gray(`   Current version: v${currentVersion}`))
    console.log(chalk.gray(`   Latest version:  v${latestVersion}`))

    if (currentVersion === latestVersion) {
      console.log(chalk.green('\n   ✅ MCP Server is up to date!\n'))
      return
    }

    console.log(chalk.yellow(`\n   📥 Updating to v${latestVersion}...\n`))
    
    // Baixar e instalar nova versão
    const asset = release.assets.find(a => a.name.endsWith('.tar.gz'))
    if (!asset) {
      throw new Error('MCP Server package not found in release')
    }

    console.log(chalk.gray(`   Downloading...`))
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'koala-mcp-'))
    const tarballPath = path.join(tempDir, 'server.tar.gz')
    
    await downloadFile(asset.browser_download_url, tarballPath)

    console.log(chalk.gray(`   Extracting...`))
    fs.rmSync(INSTALL_DIR, { recursive: true })
    fs.mkdirSync(INSTALL_DIR, { recursive: true })

    await tar.extract({
      file: tarballPath,
      cwd: INSTALL_DIR
    })

    fs.rmSync(tempDir, { recursive: true })

    fs.writeFileSync(
      path.join(INSTALL_DIR, '.version'),
      latestVersion
    )

    console.log(chalk.green(`\n   ✅ Updated to v${latestVersion} successfully!\n`))

  } catch (error) {
    console.error(chalk.red(`\n   ❌ Update failed:`), error)
    throw error
  }
}

async function getLatestRelease(): Promise<GitHubRelease> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_REPO}/releases`,
      method: 'GET',
      headers: {
        'User-Agent': 'Koala-Nest-CLI',
        'Accept': 'application/vnd.github+json'
      }
    }

    const request = https.get(options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          const releases: GitHubRelease[] = JSON.parse(data)
          const mcpRelease = releases.find(r => r.tag_name.startsWith(MCP_SERVER_TAG_PREFIX))
          
          if (!mcpRelease) {
            reject(new Error('No MCP Server release found'))
            return
          }
          
          resolve(mcpRelease)
        } catch (error) {
          reject(error)
        }
      })
      res.on('error', reject)
    })
    
    request.on('error', reject)
    request.end()
  })
}

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    
    const request = https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        file.close(() => {
          fs.unlinkSync(dest)
          downloadFile(response.headers.location!, dest).then(resolve).catch(reject)
        })
        return
      }
      
      response.pipe(file)
      
      file.on('finish', () => {
        file.close(() => resolve())
      })
      
      file.on('error', (err) => {
        file.close(() => {
          if (fs.existsSync(dest)) fs.unlinkSync(dest)
          reject(err)
        })
      })
    })
    
    request.on('error', (err) => {
      file.close(() => {
        if (fs.existsSync(dest)) fs.unlinkSync(dest)
        reject(err)
      })
    })
  })
}

async function getInstalledVersion(): Promise<string | null> {
  const versionFile = path.join(INSTALL_DIR, '.version')
  
  if (fs.existsSync(versionFile)) {
    return fs.readFileSync(versionFile, 'utf-8').trim()
  }

  // Tentar ler do package.json
  const packagePath = path.join(INSTALL_DIR, 'package.json')
  if (fs.existsSync(packagePath)) {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'))
    return pkg.version
  }

  return null
}

function findMcpJsonInProject(dir: string, maxDepth = 5, currentDepth = 0): string | null {
  if (currentDepth > maxDepth) return null

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    
    // Procurar mcp.json no diretório atual
    const mcpJsonFile = entries.find(e => e.isFile() && e.name === 'mcp.json')
    if (mcpJsonFile) {
      return path.join(dir, 'mcp.json')
    }

    // Buscar recursivamente em subdiretórios (ignorar node_modules, .git, dist)
    for (const entry of entries) {
      if (entry.isDirectory() && !['node_modules', '.git', 'dist', 'build', '.next'].includes(entry.name)) {
        const result = findMcpJsonInProject(path.join(dir, entry.name), maxDepth, currentDepth + 1)
        if (result) return result
      }
    }
  } catch {
    // Ignorar erros de permissão
  }

  return null
}

async function configureMcpJson(): Promise<void> {
  console.log(chalk.blue(`   ⚙️  Configuring mcp.json...`))
  
  const serverPath = path.join(INSTALL_DIR, 'dist', 'server.js')
  
  let mcpJsonPath: string
  
  // Buscar mcp.json recursivamente no projeto
  const existingMcpJson = findMcpJsonInProject(process.cwd())
  
  if (existingMcpJson) {
    mcpJsonPath = existingMcpJson
    console.log(chalk.gray(`   📝 Found existing mcp.json at: ${path.relative(process.cwd(), existingMcpJson)}`))
  } else {
    // Criar no diretório atual por padrão
    mcpJsonPath = path.join(process.cwd(), 'mcp.json')
    console.log(chalk.gray(`   📝 Creating mcp.json in current directory`))
  }

  let config: any
  let serverKey = 'mcpServers' // padrão

  // Ler arquivo existente se houver
  if (fs.existsSync(mcpJsonPath)) {
    try {
      config = JSON.parse(fs.readFileSync(mcpJsonPath, 'utf-8'))
      
      // Detectar qual chave usar: "servers" ou "mcpServers"
      // Priorizar "servers" se já existir no arquivo
      if (config.servers) {
        serverKey = 'servers'
      } else if (config.mcpServers) {
        serverKey = 'mcpServers'
      } else {
        // Se não tem nenhuma, usar mcpServers como padrão
        serverKey = 'mcpServers'
      }
      
      // Garantir que a chave existe
      if (!config[serverKey]) {
        config[serverKey] = {}
      }
    } catch {
      console.log(chalk.yellow('   ⚠  Could not parse existing mcp.json, creating new one'))
      config = { mcpServers: {} }
    }
  } else {
    // Arquivo novo
    config = { mcpServers: {} }
  }

  // Adicionar/atualizar servidor Koala Nest
  config[serverKey]['koala-nest-docs'] = {
    command: 'node',
    args: [serverPath]
  }

  // Salvar
  fs.writeFileSync(mcpJsonPath, JSON.stringify(config, null, 2))

  console.log(chalk.green(`   ✅ MCP configuration completed!`))
  console.log(chalk.gray(`   📝 Configuration file: ${mcpJsonPath}`))
  console.log(chalk.gray(`   🚀 Server path: ${serverPath}`))
}

export async function uninstallMcpServer(): Promise<void> {
  console.log(chalk.blue('\n🗑️  Uninstalling Koala Nest MCP Server...\n'))

  try {
    if (!fs.existsSync(INSTALL_DIR)) {
      console.log(chalk.yellow('   ⚠  MCP Server is not installed\n'))
      return
    }

    const version = await getInstalledVersion()
    
    // Remover diretório de instalação
    console.log(chalk.gray(`   Removing installation directory...`))
    fs.rmSync(INSTALL_DIR, { recursive: true })
    console.log(chalk.green(`   ✅ MCP Server v${version || 'unknown'} removed`))

    // Perguntar se quer remover do mcp.json
    console.log(chalk.yellow('\n   Do you want to remove the server from mcp.json? (y/N)'))
    const inquirer = await import('inquirer')
    const { removeMcpJson } = await inquirer.default.prompt([{
      type: 'confirm',
      name: 'removeMcpJson',
      message: 'Remove from mcp.json?',
      default: false
    }])

    if (removeMcpJson) {
      const existingMcpJson = findMcpJsonInProject(process.cwd())
      if (existingMcpJson) {
        try {
          const config = JSON.parse(fs.readFileSync(existingMcpJson, 'utf-8'))
          
          // Detectar qual chave usar
          let removed = false
          if (config.servers && config.servers['koala-nest-docs']) {
            delete config.servers['koala-nest-docs']
            removed = true
          }
          if (config.mcpServers && config.mcpServers['koala-nest-docs']) {
            delete config.mcpServers['koala-nest-docs']
            removed = true
          }
          
          if (removed) {
            fs.writeFileSync(existingMcpJson, JSON.stringify(config, null, 2))
            console.log(chalk.green(`   ✅ Removed from ${path.relative(process.cwd(), existingMcpJson)}`))
          }
        } catch {
          console.log(chalk.yellow('   ⚠  Could not update mcp.json'))
        }
      }
    }

    console.log(chalk.green('\n   ✅ Uninstall completed!\n'))

  } catch (error) {
    console.error(chalk.red(`\n   ❌ Uninstall failed:`), error)
    throw error
  }
}

export function getMcpServerPath(): string | null {
  if (fs.existsSync(INSTALL_DIR)) {
    return path.join(INSTALL_DIR, 'dist', 'server.js')
  }
  return null
}
