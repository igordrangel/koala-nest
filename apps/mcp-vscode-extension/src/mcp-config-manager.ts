import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'

export class McpConfigManager {
  private getMcpConfigPath(): string | null {
    const workspaceFolders = vscode.workspace.workspaceFolders
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return null
    }

    const workspaceRoot = workspaceFolders[0].uri.fsPath

    // Procurar mcp.json em vários locais
    const possiblePaths = [
      path.join(workspaceRoot, 'mcp.json'),
      path.join(workspaceRoot, '.vscode', 'mcp.json'),
    ]

    for (const configPath of possiblePaths) {
      if (fs.existsSync(configPath)) {
        return configPath
      }
    }

    // Se não encontrou, criar em .vscode/mcp.json
    return path.join(workspaceRoot, '.vscode', 'mcp.json')
  }

  async ensureConfigured(): Promise<boolean> {
    const configPath = this.getMcpConfigPath()

    if (!configPath) {
      vscode.window.showWarningMessage(
        'No workspace folder found. Please open a workspace to configure MCP.',
      )
      return false
    }

    // Verificar se já está configurado
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))

        // Verificar se koala-nest-docs já existe
        const hasConfig =
          (config.servers && config.servers['koala-nest-docs']) ||
          (config.mcpServers && config.mcpServers['koala-nest-docs'])

        if (hasConfig) {
          return true // Já está configurado
        }
      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed to parse mcp.json: ${error instanceof Error ? error.message : String(error)}`,
        )
        return false
      }
    }

    // Configurar automaticamente
    return await this.configure(false)
  }

  async configure(forceReconfigure: boolean): Promise<boolean> {
    const configPath = this.getMcpConfigPath()

    if (!configPath) {
      return false
    }

    let config: any = {}

    // Ler configuração existente
    if (fs.existsSync(configPath)) {
      try {
        config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed to parse existing mcp.json: ${error instanceof Error ? error.message : String(error)}`,
        )
        return false
      }
    }

    // Detectar qual chave usar
    const hasServersKey = 'servers' in config
    const hasMcpServersKey = 'mcpServers' in config
    const targetKey = hasServersKey
      ? 'servers'
      : hasMcpServersKey
        ? 'mcpServers'
        : 'mcpServers'

    if (!config[targetKey]) {
      config[targetKey] = {}
    }

    // Verificar se já existe
    if (config[targetKey]['koala-nest-docs'] && !forceReconfigure) {
      return true
    }

    // Adicionar/atualizar configuração
    config[targetKey]['koala-nest-docs'] = {
      command: 'bunx',
      args: ['@koalarx/mcp-server'],
    }

    // Criar diretório .vscode se necessário
    const configDir = path.dirname(configPath)
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true })
    }

    // Salvar configuração
    try {
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8')

      vscode.window.showInformationMessage(
        `Koala Nest MCP configured in ${path.basename(configPath)}`,
      )

      return true
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to write mcp.json: ${error instanceof Error ? error.message : String(error)}`,
      )
      return false
    }
  }
}
