import * as vscode from 'vscode'
import { McpConfigManager } from './mcp-config-manager'

const outputChannel = vscode.window.createOutputChannel('Koala Nest Documentation')

export async function activate(context: vscode.ExtensionContext) {
  outputChannel.appendLine('🚀 Extension "Koala Nest Documentation MCP" is now active!')

  // Inicializar gerenciador de configuração MCP
  const configManager = new McpConfigManager()
  
  try {
    outputChannel.appendLine('📝 Checking MCP configuration...')
    const configured = await configManager.ensureConfigured()
    
    if (configured) {
      outputChannel.appendLine('✅ MCP Server configured!')
      outputChannel.appendLine('📦 Server will be installed via NPM when needed')
      outputChannel.appendLine('🔧 Command: bunx @koalarx/mcp-server')
    }
  } catch (error) {
    outputChannel.appendLine(`❌ Failed to configure MCP Server: ${error}`)
    vscode.window.showErrorMessage(
      'Failed to configure Koala Nest MCP Server. Check output for details.'
    )
  }

  // Registrar comando para abrir a documentação
  const openDocsCommand = vscode.commands.registerCommand(
    'koala-nest-mcp.openDocs',
    () => {
      outputChannel.appendLine('📖 Opening Koala Nest Documentation...')
      vscode.window.showInformationMessage(
        'Koala Nest Documentation is now available through your MCP client (GitHub Copilot, Claude Desktop, etc.)!',
      )
    },
  )

  // Registrar comando para reconfigurar
  const reconfigureCommand = vscode.commands.registerCommand(
    'koala-nest-mcp.reconfigure',
    async () => {
      try {
        outputChannel.appendLine('🔄 Reconfiguring MCP Server...')
        await configManager.configure(true)
        vscode.window.showInformationMessage(
          'MCP Server reconfigured successfully!',
        )
      } catch (error) {
        outputChannel.appendLine(`❌ Reconfiguration failed: ${error}`)
        vscode.window.showErrorMessage('Failed to reconfigure MCP Server')
      }
    }
  )

  context.subscriptions.push(openDocsCommand)
  context.subscriptions.push(reconfigureCommand)
  context.subscriptions.push(outputChannel)

  // Mostrar mensagem de boas-vindas
  vscode.window.showInformationMessage(
    'Koala Nest Documentation MCP is ready! The server will be installed via NPM when your MCP client starts.',
  )
}

export function deactivate() {
  outputChannel.appendLine('👋 Extension "Koala Nest Documentation MCP" is now deactivated')
}
