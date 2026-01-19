import * as vscode from 'vscode'

export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "koala-nest-mcp-docs" is now active!')

  // Registrar comando para abrir a documentação
  const command = vscode.commands.registerCommand(
    'koala-nest-mcp.openDocs',
    () => {
      vscode.window.showInformationMessage(
        'Koala Nest Documentation is now available through Claude in the Chat interface!',
      )
    },
  )

  context.subscriptions.push(command)
}

export function deactivate() {}
