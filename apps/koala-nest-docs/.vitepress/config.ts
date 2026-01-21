import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Koala Nest',
  description: 'Framework NestJS com DDD e Prisma',
  base: '/',
  ignoreDeadLinks: true,
  cleanUrls: true,

  markdown: {
    languageAlias: {
      env: 'bash',
      dotenv: 'bash',
    },
  },

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
  ],

  rewrites: {
    '00-cli-reference.md': 'cli-reference.md',
    '01-guia-instalacao.md': 'guia-instalacao.md',
    '02-configuracao-inicial.md': 'configuracao-inicial.md',
    '04-tratamento-erros.md': 'tratamento-erros.md',
    '05-features-avancadas.md': 'features-avancadas.md',
    '06-decoradores.md': 'decoradores.md',
    '07-guia-bun.md': 'guia-bun.md',
    '08-prisma-client.md': 'prisma-client.md',
    '09-mcp-vscode-extension.md': 'mcp-vscode-extension.md',
    'EXAMPLE.md': 'exemplo.md',
  },

  themeConfig: {
    logo: {
      light: '/logo.svg',
      dark: '/logo-dark.svg',
    },

    nav: [
      { text: 'Início', link: '/' },
      { text: 'Documentação', link: '/guia-instalacao' },
      {
        text: '@koalarx/nest',
        link: 'https://www.npmjs.com/package/@koalarx/nest',
      },
      {
        text: '@koalarx/nest-cli',
        link: 'https://www.npmjs.com/package/@koalarx/nest-cli',
      },
    ],

    sidebar: [
      {
        text: 'Introdução',
        items: [
          { text: 'CLI Reference', link: '/cli-reference' },
          { text: 'Guia de Instalação', link: '/guia-instalacao' },
          { text: 'Configuração Inicial', link: '/configuracao-inicial' },
        ],
      },
      {
        text: 'Recursos',
        items: [
          { text: 'Tratamento de Erros', link: '/tratamento-erros' },
          { text: 'Features Avançadas', link: '/features-avancadas' },
          { text: 'Decoradores', link: '/decoradores' },
        ],
      },
      {
        text: 'Guias',
        items: [
          { text: 'Guia Bun', link: '/guia-bun' },
          { text: 'Prisma Client', link: '/prisma-client' },
          { text: 'MCP', link: '/mcp-vscode-extension' },
        ],
      },
      {
        text: 'Exemplos',
        items: [{ text: 'Exemplo Completo', link: '/exemplo' }],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/igordrangel/koala-nest' },
    ],

    footer: {
      message: 'Desenvolvido com ❤️ para a comunidade',
      copyright: 'Copyright © 2026 Koala Nest',
    },

    search: {
      provider: 'local',
    },
  },
})
