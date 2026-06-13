import type { Locale } from '../models/locale.types';

export const UI_COPY = {
  pt: {
    home: 'Início',
    docs: 'Documentação',
    search: 'Buscar',
    searchPlaceholder: 'Buscar na documentação...',
    searchNoResults: 'Nenhum resultado encontrado.',
    copyAiIndex: 'Copy AI docs index',
    copyAiShort: 'Copy AI',
    copied: 'Copied!',
    copyForAi: 'Copy for AI',
    language: 'Idioma',
    notFound: 'Página não encontrada.',
    goToInstallGuide: 'Ir para o guia de instalação',
    onThisPage: 'Nesta página',
    metaDescription:
      'Facilitador para APIs NestJS com DDD e TypeORM. A CLI copia módulos prontos para o seu repositório.',
    seo: {
      landingTitle: 'Koala Nest — APIs NestJS com DDD e TypeORM',
    },
    footer: {
      description:
        'Facilitador para criar APIs NestJS com arquitetura DDD. Código copiado para o seu repositório — legível, adaptável e sob seu controle.',
      creatorRole: 'Design, back-end e estratégia de produto.',
      docsAi: 'Docs & AI',
      installGuide: 'Guia de instalação',
      quickCommands: 'Comandos rápidos',
      quickCommandsHint: 'CLI global e scripts no projeto gerado',
      quickCommandsList: [
        'bun install -g @koalarx/nest',
        'kl-nest new',
        'kl-nest add cache',
        'bun run migration:run  # template CRUD',
        'kl-nest --help',
      ],
      tagline: 'Feito para desenvolvedores NestJS e fluxos assistidos por IA.',
    },
    landing: {
      heroBadge: 'kl-nest new',
      heroLead: 'O próximo nível das suas APIs ',
      heroGradient: 'NestJS',
      heroTrail: '',
      heroSubtitle:
        'A experiência shadcn/ui, feita nativamente para NestJS. Com DDD e TypeORM. Copie módulos para o seu repositório — sem dependências opacas.',
      gettingStarted: 'Começar agora',
      viewDocs: 'Ver documentação',
      whatIsTitle: 'O que é o Koala Nest?',
      whatIsSubtitle:
        'Um facilitador para APIs NestJS com DDD — módulos copiados para o projeto, não escondidos atrás de uma biblioteca caixa-preta.',
      cliTitle: 'CLI poderosa',
      cliSubtitle:
        'Crie um novo projeto de API em segundos. Escolha um template e receba estrutura DDD, TypeORM, OpenAPI e validação no seu repositório.',
      aiTitle: 'Pronto para IA',
      aiSubtitle:
        'Documentação otimizada para desenvolvimento assistido por IA — índice e contexto por página sem duplicar conteúdo.',
      exploreTitle: 'Explore a documentação',
      exploreSubtitle: 'Acesse os tópicos mais úteis ao construir ou estender uma API.',
      exploreDdd: 'Arquitetura DDD',
      exploreCrud: 'Fluxo CRUD Person',
      exploreOpenApi: 'OpenAPI / Scalar',
      exploreMapping: 'Sistema de mapeamento',
    },
    whatIsCards: [
      {
        title: 'Copie, não instale',
        description:
          'Como shadcn/ui para backends — a CLI copia módulos para o repositório. Você é dono do código e adapta livremente.',
      },
      {
        title: 'DDD por padrão',
        description:
          'Projetos com camadas claras: domain, application, host e infra. Handlers, validators e repositórios seguem os mesmos padrões.',
      },
      {
        title: 'TypeORM + PostgreSQL',
        description:
          'Validação de env com Zod, migrations, contratos de repositório e implementações TypeORM — prontos no primeiro dia.',
      },
      {
        title: 'OpenAPI incluso',
        description:
          'Todo projeto gerado expõe documentação interativa em /doc via Scalar (OpenAPI gerado com @nestjs/swagger).',
      },
    ],
    cliBenefits: [
      {
        title: 'Scaffolding inteligente',
        description:
          'Fluxo interativo para nome, gerenciador de pacotes (Bun recomendado), template, autenticação (JWT/OAuth2) e extras (cache, health, cron, eventos). API Key em breve.',
      },
      {
        title: 'Templates úteis',
        description:
          'Comece com estrutura DDD limpa ou com o exemplo CRUD de Person — referência completa em todas as camadas.',
      },
      {
        title: 'Foco no desenvolvedor',
        description:
          'Use com npx ou instale globalmente. Comandos claros, versionamento e código que você pode ler e manter.',
      },
    ],
    aiCards: [
      {
        title: 'Links diretos para LLMs',
        description:
          'Use Copy AI docs index no header para compartilhar o llms.txt com seu assistente e mapear toda a documentação.',
      },
      {
        title: 'Contexto por página',
        description:
          'Use Copy for AI em cada página para enviar a URL do Markdown daquele tópico (markdown/pt/.../*.md).',
      },
    ],
  },
  en: {
    home: 'Home',
    docs: 'Documentation',
    search: 'Search',
    searchPlaceholder: 'Search documentation...',
    searchNoResults: 'No results found.',
    copyAiIndex: 'Copy AI docs index',
    copyAiShort: 'Copy AI',
    copied: 'Copied!',
    copyForAi: 'Copy for AI',
    language: 'Language',
    notFound: 'Page not found.',
    goToInstallGuide: 'Go to installation guide',
    onThisPage: 'On this page',
    metaDescription:
      'A facilitator for building NestJS APIs with DDD and TypeORM. The CLI copies modules into your repository.',
    seo: {
      landingTitle: 'Koala Nest — NestJS APIs with DDD and TypeORM',
    },
    footer: {
      description:
        'A facilitator for building NestJS APIs with DDD architecture. Code copied into your repository — readable, adaptable, and under your control.',
      creatorRole: 'Design, back-end, and product strategy.',
      docsAi: 'Docs & AI',
      installGuide: 'Installation guide',
      quickCommands: 'Quick Commands',
      quickCommandsHint: 'Global CLI and scripts in the generated project',
      quickCommandsList: [
        'bun install -g @koalarx/nest',
        'kl-nest new',
        'kl-nest add cache',
        'bun run migration:run  # CRUD template',
        'kl-nest --help',
      ],
      tagline: 'Built for NestJS developers and AI-assisted workflows.',
    },
    landing: {
      heroBadge: 'kl-nest new',
      heroLead: 'The Next Level for Your ',
      heroGradient: 'NestJS',
      heroTrail: ' APIs.',
      heroSubtitle:
        'The shadcn/ui experience, built natively for NestJS. Powered by DDD and TypeORM. Copy modules into your repo — no opaque dependencies.',
      gettingStarted: 'Getting Started',
      viewDocs: 'View Documentation',
      whatIsTitle: 'What is Koala Nest?',
      whatIsSubtitle:
        'A facilitator for NestJS APIs with DDD — modules copied into your project, not hidden behind a black-box library.',
      cliTitle: 'Powerful CLI',
      cliSubtitle:
        'Create a new API project in seconds. Pick a template and get DDD structure, TypeORM, OpenAPI, and validation in your repository.',
      aiTitle: 'AI Ready',
      aiSubtitle:
        'Documentation optimized for AI-assisted development — index and per-page context without duplicating content.',
      exploreTitle: 'Explore the docs',
      exploreSubtitle: 'Jump into the topics that matter when building or extending an API.',
      exploreDdd: 'DDD Architecture',
      exploreCrud: 'Person CRUD Flow',
      exploreOpenApi: 'OpenAPI / Scalar',
      exploreMapping: 'Mapping system',
    },
    whatIsCards: [
      {
        title: 'Copy, Don\'t Install',
        description:
          'Like shadcn/ui for backends — the CLI copies modules into your repo. You own the code and adapt freely.',
      },
      {
        title: 'DDD by Default',
        description:
          'Projects ship with clear layers: domain, application, host, and infra. Handlers, validators, and repositories follow the same patterns.',
      },
      {
        title: 'TypeORM + PostgreSQL',
        description:
          'Env validation with Zod, migrations, repository contracts, and TypeORM implementations — ready on day one.',
      },
      {
        title: 'OpenAPI Built In',
        description:
          'Every generated project exposes interactive docs at /doc via Scalar (OpenAPI generated with @nestjs/swagger).',
      },
    ],
    cliBenefits: [
      {
        title: 'Smart Scaffolding',
        description:
          'Interactive flow for project name, package manager (Bun recommended), template, auth (JWT/OAuth2), and extras (cache, health, cron, events). API Key coming soon.',
      },
      {
        title: 'Useful Templates',
        description:
          'Start from a clean DDD structure or the Person CRUD example — a full reference module across every layer.',
      },
      {
        title: 'Developer Friendly',
        description:
          'Run with npx or install globally. Clear commands, versioning, and a codebase you can read and maintain.',
      },
    ],
    aiCards: [
      {
        title: 'Direct Links for LLMs',
        description:
          'Use Copy AI docs index in the header to share llms.txt with your assistant and map the full documentation.',
      },
      {
        title: 'Page-Level Context',
        description:
          'Use Copy for AI on each doc page to send the focused Markdown URL (markdown/en/.../*.md) for that topic.',
      },
    ],
  },
} as const satisfies Record<Locale, unknown>;
