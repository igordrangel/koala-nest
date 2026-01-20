import https from 'https'
import fs from 'fs'
import path from 'path'
import os from 'os'
import * as tar from 'tar'
import chalk from 'chalk'

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
  console.log(chalk.blue('\n📦 Installing Koala Nest MCP Server...\n'))

  try {
    // Buscar última release
    const release = await getLatestRelease()
    const version = release.tag_name.replace(MCP_SERVER_TAG_PREFIX, '')
    
    console.log(chalk.gray(`   Found version: ${version}`))

    // Verificar se já está instalado
    if (fs.existsSync(INSTALL_DIR)) {
      const currentVersion = await getInstalledVersion()
      if (currentVersion === version) {
        console.log(chalk.yellow(`   ⚠  MCP Server v${version} is already installed`))
        console.log(chalk.gray(`   Run 'koala-nest mcp update' to check for updates\n`))
        return
      }
      console.log(chalk.gray(`   Upgrading from v${currentVersion} to v${version}`))
    }

    // Baixar release
    const asset = release.assets.find(a => a.name.endsWith('.tar.gz'))
    if (!asset) {
      throw new Error('MCP Server package not found in release')
    }

    console.log(chalk.gray(`   Downloading...`))
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'koala-mcp-'))
    const tarballPath = path.join(tempDir, 'server.tar.gz')
    
    await downloadFile(asset.browser_download_url, tarballPath)

    // Extrair
    console.log(chalk.gray(`   Extracting...`))
    if (fs.existsSync(INSTALL_DIR)) {
      fs.rmSync(INSTALL_DIR, { recursive: true })
    }
    fs.mkdirSync(INSTALL_DIR, { recursive: true })

    await tar.extract({
      file: tarballPath,
      cwd: INSTALL_DIR
    })

    // Limpar
    fs.rmSync(tempDir, { recursive: true })

    // Salvar versão
    fs.writeFileSync(
      path.join(INSTALL_DIR, '.version'),
      version
    )

    console.log(chalk.green(`\n   ✅ MCP Server v${version} installed successfully!`))
    console.log(chalk.gray(`   Location: ${INSTALL_DIR}\n`))

    // Configurar mcp.json
    await configureMcpJson()

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

    https.get(options, (res) => {
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
    }).on('error', reject)
  })
}

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        file.close()
        fs.unlinkSync(dest)
        downloadFile(response.headers.location!, dest).then(resolve).catch(reject)
        return
      }
      
      response.pipe(file)
      file.on('finish', () => {
        file.close()
        resolve()
      })
    }).on('error', (err) => {
      file.close()
      fs.unlinkSync(dest)
      reject(err)
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

async function configureMcpJson(): Promise<void> {
  const mcpJsonPath = path.join(os.homedir(), 'mcp.json')
  const serverPath = path.join(INSTALL_DIR, 'dist', 'server.js')

  let config = { mcpServers: {} }

  // Ler arquivo existente se houver
  if (fs.existsSync(mcpJsonPath)) {
    try {
      config = JSON.parse(fs.readFileSync(mcpJsonPath, 'utf-8'))
      if (!config.mcpServers) {
        config.mcpServers = {}
      }
    } catch {
      console.log(chalk.yellow('   ⚠  Could not parse existing mcp.json, creating new one'))
    }
  }

  // Adicionar/atualizar servidor Koala Nest
  config.mcpServers['koala-nest-docs'] = {
    command: 'node',
    args: [serverPath]
  }

  // Salvar
  fs.writeFileSync(mcpJsonPath, JSON.stringify(config, null, 2))

  console.log(chalk.gray(`   📝 Updated mcp.json configuration`))
  console.log(chalk.gray(`      Location: ${mcpJsonPath}`))
}

export function getMcpServerPath(): string | null {
  if (fs.existsSync(INSTALL_DIR)) {
    return path.join(INSTALL_DIR, 'dist', 'server.js')
  }
  return null
}
