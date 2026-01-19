import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Koala Nest",
  description: "Framework NestJS com DDD e Prisma",
  base: '/',
  
  themeConfig: {
    logo: {
      light: '/logo.svg',
      dark: '/logo-dark.svg'
    },
    
    nav: [
      { text: 'Início', link: '/' },
      { text: 'Documentação', link: '/01-guia-instalacao' },
      { text: 'Koalarx', link: 'https://koalarx.com' },
      { text: 'GitHub', link: 'https://github.com/koalarx/koala-nest' }
    ],

    sidebar: [
      {
        text: 'Introdução',
        items: [
          { text: 'CLI Reference', link: '/00-cli-reference' },
          { text: 'Guia de Instalação', link: '/01-guia-instalacao' },
          { text: 'Configuração Inicial', link: '/02-configuracao-inicial' }
        ]
      },
      {
        text: 'Recursos',
        items: [
          { text: 'Tratamento de Erros', link: '/04-tratamento-erros' },
          { text: 'Features Avançadas', link: '/05-features-avancadas' },
          { text: 'Decoradores', link: '/06-decoradores' }
        ]
      },
      {
        text: 'Guias',
        items: [
          { text: 'Guia Bun', link: '/07-guia-bun' },
          { text: 'Prisma Client', link: '/08-prisma-client' },
          { text: 'MCP VS Code Extension', link: '/09-mcp-vscode-extension' },
          { text: 'CLI Integration', link: '/10-cli-integration' }
        ]
      },
      {
        text: 'Exemplos',
        items: [
          { text: 'Exemplo Completo', link: '/EXAMPLE' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/koalarx/koala-nest' }
    ],

    footer: {
      message: 'Desenvolvido com ❤️ para a comunidade',
      copyright: 'Copyright © 2026 Koala Nest'
    },

    search: {
      provider: 'local'
    }
  }
})
