import * as vscode from 'vscode'
import { McpServerManager } from './mcp-server-manager'

const outputChannel = vscode.window.createOutputChannel('Koala Nest Documentation')

export async function activate(context: vscode.ExtensionContext) {
  outputChannel.appendLine('🚀 Extension "Koala Nest Documentation MCP" is now active!')

  // Inicializar gerenciador do MCP Server
  const mcpManager = new McpServerManager(context)
  
  try {
    outputChannel.appendLine('📥 Checking MCP Server...')
    await mcpManager.initialize()
    outputChannel.appendLine('✅ MCP Server ready!')
  } catch (error) {
    outputChannel.appendLine(`❌ Failed to initialize MCP Server: ${error}`)
    vscode.window.showErrorMessage(
      'Failed to initialize Koala Nest MCP Server. Check output for details.'
    )
  }

  // Registrar comando para abrir a documentação
  const openDocsCommand = vscode.commands.registerCommand(
    'koala-nest-mcp.openDocs',
    () => {
      outputChannel.appendLine('📖 Opening Koala Nest Documentation...')
      vscode.window.showInformationMessage(
        'Koala Nest Documentation is now available through Claude in the Chat interface!',
      )
    },
  )

  // Registrar comando para forçar atualização do servidor
  const updateServerCommand = vscode.commands.registerCommand(
    'koala-nest-mcp.updateServer',
    async () => {
      try {
        outputChannel.appendLine('🔄 Forcing MCP Server update...')
        await mcpManager.forceUpdate()
        vscode.window.showInformationMessage(
          'MCP Server updated! Please reload VS Code.',
          'Reload'
        ).then(choice => {
          if (choice === 'Reload') {
            vscode.commands.executeCommand('workbench.action.reloadWindow')
          }
        })
      } catch (error) {
        outputChannel.appendLine(`❌ Update failed: ${error}`)
        vscode.window.showErrorMessage('Failed to update MCP Server')
      }
    }
  )

  context.subscriptions.push(openDocsCommand)
  context.subscriptions.push(updateServerCommand)
  context.subscriptions.push(outputChannel)

  // Mostrar mensagem de boas-vindas
  vscode.window.showInformationMessage(
    'Koala Nest Documentation MCP extension is ready! Use the Command Palette (Ctrl+Shift+P) to access documentation commands.',
  )
}

export function deactivate() {
  outputChannel.appendLine('👋 Extension "Koala Nest Documentation MCP" is now deactivated')
}
