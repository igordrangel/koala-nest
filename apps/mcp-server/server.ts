import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import * as fs from 'fs'
import * as path from 'path'
import { dirname, resolve } from 'path'

// Configurar caminhos para os arquivos de documentação
// Usando dirname de __filename para obter o diretório do arquivo
const __filename = resolve(process.argv[1])
const __dirname = dirname(__filename)
const PROJECT_ROOT = path.resolve(__dirname, '../../')
const DOCS_DIR = path.join(PROJECT_ROOT, 'docs')
const README_PATH = path.join(PROJECT_ROOT, 'README.md')

interface DocumentationResource {
  uri: string
  name: string
  description: string
  mimeType: string
}

interface SearchResult {
  file: string
  content: string
  matches: number
}

class KoalaMCPServer {
  private server: Server
  private documentationResources: Map<string, DocumentationResource> = new Map()

  constructor() {
    this.server = new Server(
      {
        name: 'koala-nest-docs',
        version: '1.0.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      },
    )

    this.setupHandlers()
    this.loadDocumentation()
  }

  private loadDocumentation(): void {
    // Carregar README.md
    if (fs.existsSync(README_PATH)) {
      this.documentationResources.set('README', {
        uri: 'docs://README',
        name: 'README.md',
        description: 'Documentação principal do projeto Koala Nest',
        mimeType: 'text/markdown',
      })
    }

    // Carregar arquivos da pasta docs
    if (fs.existsSync(DOCS_DIR)) {
      const files = fs.readdirSync(DOCS_DIR)
      files.forEach((file) => {
        if (file.endsWith('.md')) {
          const resourceId = file.replace('.md', '')
          this.documentationResources.set(resourceId, {
            uri: `docs://${resourceId}`,
            name: file,
            description: `Documentação: ${file}`,
            mimeType: 'text/markdown',
          })
        }
      })
    }
  }

  private setupHandlers(): void {
    // Handler para listar recursos disponíveis
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      const resources = Array.from(this.documentationResources.values()).map(
        (resource) => ({
          uri: resource.uri,
          name: resource.name,
          description: resource.description,
          mimeType: resource.mimeType,
        }),
      )

      return { resources }
    })

    // Handler para ler um recurso específico
    this.server.setRequestHandler(
      ReadResourceRequestSchema,
      async (request: any) => {
        const uri = request.params.uri
        let filePath: string
        let resourceId: string

        if (uri === 'docs://README') {
          filePath = README_PATH
          resourceId = 'README'
        } else if (uri.startsWith('docs://')) {
          resourceId = uri.replace('docs://', '')
          filePath = path.join(DOCS_DIR, `${resourceId}.md`)
        } else {
          throw new Error(`Resource not found: ${uri}`)
        }

        if (!fs.existsSync(filePath)) {
          throw new Error(`File not found: ${filePath}`)
        }

        const content = fs.readFileSync(filePath, 'utf-8')
        const resource = this.documentationResources.get(resourceId)

        return {
          contents: [
            {
              uri,
              mimeType: resource?.mimeType || 'text/markdown',
              text: content,
            },
          ],
        }
      },
    )

    // Handler para listar ferramentas disponíveis
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools: Tool[] = [
        {
          name: 'search_documentation',
          description:
            'Busca por um termo específico em toda a documentação do Koala Nest',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Termo de busca',
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'list_documentation_files',
          description: 'Lista todos os arquivos de documentação disponíveis',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
      ]

      return { tools }
    })

    // Handler para executar ferramentas
    this.server.setRequestHandler(
      CallToolRequestSchema,
      async (request: any) => {
        const { name, arguments: args } = request.params

        if (name === 'search_documentation') {
          const query = (args as { query: string })?.query
          if (!query) {
            throw new Error('query parameter is required')
          }
          return await this.searchDocumentation(query)
        } else if (name === 'list_documentation_files') {
          return this.listDocumentationFiles()
        }

        throw new Error(`Unknown tool: ${name}`)
      },
    )
  }

  private searchDocumentation(query: string): {
    content: Array<{ type: string; text: string }>
  } {
    const results: SearchResult[] = []
    const lowerQuery = query.toLowerCase()

    // Buscar no README
    if (fs.existsSync(README_PATH)) {
      const content = fs.readFileSync(README_PATH, 'utf-8')
      const matches = (content.match(new RegExp(lowerQuery, 'gi')) || []).length
      if (matches > 0) {
        results.push({
          file: 'README.md',
          content: this.extractContext(content, query),
          matches,
        })
      }
    }

    // Buscar nos arquivos de docs
    if (fs.existsSync(DOCS_DIR)) {
      const files = fs.readdirSync(DOCS_DIR)
      files.forEach((file) => {
        if (file.endsWith('.md')) {
          const filePath = path.join(DOCS_DIR, file)
          const content = fs.readFileSync(filePath, 'utf-8')
          const matches = (content.match(new RegExp(lowerQuery, 'gi')) || [])
            .length
          if (matches > 0) {
            results.push({
              file,
              content: this.extractContext(content, query),
              matches,
            })
          }
        }
      })
    }

    const text =
      results.length > 0
        ? results
            .map((r) => `**${r.file}** (${r.matches} matches):\n${r.content}\n`)
            .join('\n---\n')
        : `Nenhum resultado encontrado para: "${query}"`

    return {
      content: [
        {
          type: 'text',
          text,
        },
      ],
    }
  }

  private extractContext(
    content: string,
    query: string,
    contextLines = 2,
  ): string {
    const lines = content.split('\n')
    const lowerQuery = query.toLowerCase()
    const matches: number[] = []

    lines.forEach((line, index) => {
      if (line.toLowerCase().includes(lowerQuery)) {
        matches.push(index)
      }
    })

    if (matches.length === 0) {
      return ''
    }

    const contextLines_ = new Set<number>()
    matches.forEach((matchIndex) => {
      for (
        let i = Math.max(0, matchIndex - contextLines);
        i <= Math.min(lines.length - 1, matchIndex + contextLines);
        i++
      ) {
        contextLines_.add(i)
      }
    })

    return Array.from(contextLines_)
      .sort((a, b) => a - b)
      .map((i) => lines[i])
      .join('\n')
  }

  private listDocumentationFiles(): {
    content: Array<{ type: string; text: string }>
  } {
    const files: string[] = []

    if (fs.existsSync(README_PATH)) {
      files.push('README.md')
    }

    if (fs.existsSync(DOCS_DIR)) {
      const docFiles = fs.readdirSync(DOCS_DIR)
      files.push(...docFiles.filter((f) => f.endsWith('.md')))
    }

    const text =
      files.length > 0
        ? files.map((f, i) => `${i + 1}. ${f}`).join('\n')
        : 'Nenhum arquivo de documentação encontrado'

    return {
      content: [
        {
          type: 'text',
          text,
        },
      ],
    }
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
    console.error('Koala Nest MCP Server running on stdio')
  }
}

async function main() {
  const server = new KoalaMCPServer()
  await server.start()
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
