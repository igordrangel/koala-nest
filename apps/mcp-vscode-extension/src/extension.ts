import * as vscode from 'vscode'

const outputChannel = vscode.window.createOutputChannel('Koala Nest Documentation')

export function activate(context: vscode.ExtensionContext) {
  outputChannel.appendLine('🚀 Extension "Koala Nest Documentation MCP" is now active!')

  // Registrar comando para abrir a documentação
  const command = vscode.commands.registerCommand(
    'koala-nest-mcp.openDocs',
    () => {
      outputChannel.appendLine('📖 Opening Koala Nest Documentation...')
      vscode.window.showInformationMessage(
        'Koala Nest Documentation is now available through Claude in the Chat interface!',
      )
    },
  )

  context.subscriptions.push(command)
  context.subscriptions.push(outputChannel)

  // Mostrar mensagem de boas-vindas
  vscode.window.showInformationMessage(
    'Koala Nest Documentation MCP extension is ready! Use the Command Palette (Ctrl+Shift+P) to access documentation commands.',
  )
}

export function deactivate() {
  outputChannel.appendLine('👋 Extension "Koala Libs Documentation MCP" is now deactivated')
}
