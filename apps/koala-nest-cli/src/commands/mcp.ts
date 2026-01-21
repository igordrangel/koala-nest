import fs from 'fs'
import path from 'path'
import chalk from 'chalk'

export async function installMcpServer(): Promise<void> {
  console.log(chalk.blue('\n🔧 Configuring Koala Nest MCP Server...\n'))

  try {
    // Configurar mcp.json
    await configureMcpJson()
    
    console.log(chalk.cyan(`\n✨ Configuration completed successfully!\n`))
    console.log(chalk.gray(`   The MCP server will be installed automatically via NPM when you start your MCP client.\n`))
    console.log(chalk.gray(`   Command: bunx @koalarx/mcp-server\n`))

  } catch (error) {
    console.error(chalk.red(`\n   ❌ Configuration failed:`), error)
    throw error
  }
}

async function configureMcpJson(): Promise<void> {
  const existingMcpJson = findMcpJsonInProject(process.cwd())
  
  if (existingMcpJson) {
    console.log(chalk.gray(`   Found existing mcp.json at: ${path.relative(process.cwd(), existingMcpJson)}`))
    
    try {
      const config = JSON.parse(fs.readFileSync(existingMcpJson, 'utf-8'))
      
      // Detectar qual chave usar (servers ou mcpServers)
      const hasServersKey = 'servers' in config
      const hasMcpServersKey = 'mcpServers' in config
      const targetKey = hasServersKey ? 'servers' : hasMcpServersKey ? 'mcpServers' : 'servers'
      
      if (!config[targetKey]) {
        config[targetKey] = {}
      }
      
      // Verificar se já existe
      if (config[targetKey]['koala-nest-docs']) {
        console.log(chalk.yellow(`   ⚠  koala-nest-docs already configured in mcp.json`))
        
        const inquirer = await import('inquirer')
        const { overwrite } = await inquirer.default.prompt([{
          type: 'confirm',
          name: 'overwrite',
          message: 'Overwrite existing configuration?',
          default: false
        }])
        
        if (!overwrite) {
          console.log(chalk.gray(`   Skipping configuration update`))
          return
        }
      }
      
      // Adicionar configuração do MCP Server
      config[targetKey]['koala-nest-docs'] = {
        command: 'bunx',
        args: ['@koalarx/mcp-server']
      }
      
      fs.writeFileSync(existingMcpJson, JSON.stringify(config, null, 2))
      console.log(chalk.green(`   ✅ Configuration added to ${path.relative(process.cwd(), existingMcpJson)}`))
    } catch (error) {
      console.error(chalk.red(`   ❌ Failed to update mcp.json:`), error)
      throw error
    }
  } else {
    // Criar novo mcp.json no diretório atual
    console.log(chalk.yellow(`   No mcp.json found in current project`))
    
    const inquirer = await import('inquirer')
    const { createNew } = await inquirer.default.prompt([{
      type: 'confirm',
      name: 'createNew',
      message: 'Create new mcp.json in current directory?',
      default: true
    }])
    
    if (!createNew) {
      console.log(chalk.gray(`   Skipping mcp.json creation`))
      return
    }
    
    const newConfig = {
      mcpServers: {
        'koala-nest-docs': {
          command: 'bunx',
          args: ['@koalarx/mcp-server']
        }
      }
    }
    
    const mcpJsonPath = path.join(process.cwd(), 'mcp.json')
    fs.writeFileSync(mcpJsonPath, JSON.stringify(newConfig, null, 2))
    console.log(chalk.green(`   ✅ Created mcp.json with koala-nest-docs configuration`))
  }
}

function findMcpJsonInProject(startDir: string, depth = 0): string | null {
  const maxDepth = 5
  
  if (depth > maxDepth) {
    return null
  }
  
  const mcpJsonPath = path.join(startDir, 'mcp.json')
  if (fs.existsSync(mcpJsonPath)) {
    return mcpJsonPath
  }
  
  // Procurar em subdiretórios (exceto node_modules, .git, dist, build, .next)
  const excludeDirs = ['node_modules', '.git', 'dist', 'build', '.next']
  
  try {
    const entries = fs.readdirSync(startDir, { withFileTypes: true })
    
    for (const entry of entries) {
      if (entry.isDirectory() && !excludeDirs.includes(entry.name)) {
        const found = findMcpJsonInProject(path.join(startDir, entry.name), depth + 1)
        if (found) {
          return found
        }
      }
    }
  } catch {
    // Ignora erros de permissão
  }
  
  return null
}
