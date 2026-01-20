import * as vscode from 'vscode'
import * as https from 'https'
import * as fs from 'fs'
import * as path from 'path'
import * as tar from 'tar'

const GITHUB_REPO = 'igordrangel/koala-nest'
const MCP_SERVER_TAG_PREFIX = 'mcp-server@'
const CHECK_INTERVAL = 24 * 60 * 60 * 1000 // 24 horas

interface GitHubRelease {
  tag_name: string
  assets: Array<{
    name: string
    browser_download_url: string
  }>
}

export class McpServerManager {
  private context: vscode.ExtensionContext
  private serverPath: string | null = null
  private currentVersion: string | null = null

  constructor(context: vscode.ExtensionContext) {
    this.context = context
  }

  async initialize(): Promise<string> {
    const storagePath = this.context.globalStorageUri.fsPath
    
    // Criar diretório se não existir
    if (!fs.existsSync(storagePath)) {
      fs.mkdirSync(storagePath, { recursive: true })
    }

    this.serverPath = path.join(storagePath, 'mcp-server')
    
    // Verificar se o servidor já está instalado
    const serverExists = fs.existsSync(path.join(this.serverPath, 'dist', 'server.js'))
    
    if (!serverExists) {
      await this.downloadLatestVersion()
    } else {
      // Carregar versão atual
      this.currentVersion = await this.getInstalledVersion()
      
      // Verificar atualizações em background
      this.scheduleUpdateCheck()
    }

    return path.join(this.serverPath, 'dist', 'server.js')
  }

  private async downloadLatestVersion(): Promise<void> {
    try {
      const release = await this.getLatestRelease()
      const version = release.tag_name.replace(MCP_SERVER_TAG_PREFIX, '')
      
      vscode.window.showInformationMessage(
        `Downloading Koala Nest MCP Server v${version}...`
      )

      const asset = release.assets.find(a => a.name.endsWith('.tar.gz'))
      if (!asset) {
        throw new Error('MCP Server package not found in release')
      }

      const tarballPath = path.join(this.context.globalStorageUri.fsPath, 'server.tar.gz')
      await this.downloadFile(asset.browser_download_url, tarballPath)

      // Extrair
      if (fs.existsSync(this.serverPath!)) {
        fs.rmSync(this.serverPath!, { recursive: true })
      }
      fs.mkdirSync(this.serverPath!, { recursive: true })

      await tar.extract({
        file: tarballPath,
        cwd: this.serverPath!
      })

      fs.unlinkSync(tarballPath)

      this.currentVersion = version
      await this.context.globalState.update('mcpServerVersion', version)
      await this.context.globalState.update('lastUpdateCheck', Date.now())

      vscode.window.showInformationMessage(
        `Koala Nest MCP Server v${version} installed successfully!`
      )
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to download MCP Server: ${error instanceof Error ? error.message : String(error)}`
      )
      throw error
    }
  }

  private async getLatestRelease(): Promise<GitHubRelease> {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.github.com',
        path: `/repos/${GITHUB_REPO}/releases`,
        method: 'GET',
        headers: {
          'User-Agent': 'Koala-Nest-VSCode-Extension',
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

  private downloadFile(url: string, dest: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(dest)
      
      https.get(url, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          // Seguir redirect
          this.downloadFile(response.headers.location!, dest).then(resolve).catch(reject)
          return
        }
        
        response.pipe(file)
        file.on('finish', () => {
          file.close()
          resolve()
        })
      }).on('error', (err) => {
        fs.unlinkSync(dest)
        reject(err)
      })
    })
  }

  private async getInstalledVersion(): Promise<string | null> {
    const version = this.context.globalState.get<string>('mcpServerVersion')
    if (version) {
      return version
    }

    // Tentar ler do package.json
    try {
      const packagePath = path.join(this.serverPath!, 'package.json')
      if (fs.existsSync(packagePath)) {
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'))
        return pkg.version
      }
    } catch {
      console.error('Failed to read installed MCP Server version')
    }

    return null
  }

  private scheduleUpdateCheck() {
    // Verificar na ativação se já passou tempo suficiente
    const lastCheck = this.context.globalState.get<number>('lastUpdateCheck', 0)
    const now = Date.now()

    if (now - lastCheck > CHECK_INTERVAL) {
      this.checkForUpdates()
    }

    // Agendar próxima verificação
    setInterval(() => {
      this.checkForUpdates()
    }, CHECK_INTERVAL)
  }

  private async checkForUpdates() {
    try {
      const release = await this.getLatestRelease()
      const latestVersion = release.tag_name.replace(MCP_SERVER_TAG_PREFIX, '')

      if (this.currentVersion && latestVersion !== this.currentVersion) {
        const action = await vscode.window.showInformationMessage(
          `New version of Koala Nest MCP Server available: v${latestVersion} (current: v${this.currentVersion})`,
          'Update Now',
          'Later'
        )

        if (action === 'Update Now') {
          await this.downloadLatestVersion()
          vscode.window.showInformationMessage(
            'MCP Server updated successfully! Please reload VS Code.',
            'Reload'
          ).then(choice => {
            if (choice === 'Reload') {
              vscode.commands.executeCommand('workbench.action.reloadWindow')
            }
          })
        }
      }

      await this.context.globalState.update('lastUpdateCheck', Date.now())
    } catch (error) {
      console.error('Failed to check for updates:', error)
    }
  }

  async forceUpdate() {
    await this.downloadLatestVersion()
  }
}
