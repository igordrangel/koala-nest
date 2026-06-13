export const supportedLocales = ['pt', 'en'];

export const defaultLocale = 'pt';

export const categoryOrder = [
  'intro',
  'inicio',
  'core',
  'domain',
  'application',
  'host',
  'infra',
  'guias',
];

export const categoryLabelsByLocale = {
  pt: {
    intro: 'Introdução',
    inicio: 'Primeiros passos',
    core: 'Core',
    domain: 'Domain',
    application: 'Application',
    host: 'Host',
    infra: 'Infra',
    guias: 'Guias',
  },
  en: {
    intro: 'Introduction',
    inicio: 'Getting Started',
    core: 'Core',
    domain: 'Domain',
    application: 'Application',
    host: 'Host',
    infra: 'Infra',
    guias: 'Guides',
  },
};

export const llmsIndexHeaderByLocale = {
  pt: [
    '# Koala Nest',
    '',
    '> Facilitador para criar APIs NestJS com arquitetura DDD. A CLI copia módulos prontos para dentro do projeto — código que você pode ler, adaptar e manter.',
    '',
    'Documentação otimizada para LLMs. Cada tópico aponta para o arquivo Markdown correspondente — sem duplicar conteúdo.',
    '',
  ].join('\n'),
  en: [
    '# Koala Nest',
    '',
    '> A facilitator for building NestJS APIs with DDD architecture. The CLI copies ready-made modules into your project — code you can read, adapt, and maintain.',
    '',
    'Documentation optimized for LLMs. Each topic links to the corresponding Markdown file — no duplicated content.',
    '',
  ].join('\n'),
};

/** @deprecated Use categoryLabelsByLocale */
export const categoryLabels = categoryLabelsByLocale.pt;

export function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };
  const meta = {};
  for (const line of match[1].split('\n')) {
    const [key, ...rest] = line.split(':');
    if (key && rest.length) meta[key.trim()] = rest.join(':').trim();
  }
  return { meta, body: match[2] };
}

export function toPosix(p) {
  return p.split(/[/\\]/).join('/');
}

export function getCategoryLabels(locale) {
  return categoryLabelsByLocale[locale] ?? categoryLabelsByLocale[defaultLocale];
}
