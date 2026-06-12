import fs from 'node:fs';
import path from 'node:path';

const docRoot = path.resolve('libs/doc');
const markdownRoot = path.join(docRoot, 'markdown');
const txtRoot = path.join(docRoot, 'txt');

const categoryOrder = [
  'intro',
  'inicio',
  'core',
  'domain',
  'application',
  'host',
  'infra',
  'guias',
];

const categoryLabels = {
  intro: 'Introdução',
  inicio: 'Primeiros passos',
  core: 'Core',
  domain: 'Domain',
  application: 'Application',
  host: 'Host',
  infra: 'Infra',
  guias: 'Guias',
};

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {} };
  const meta = {};
  for (const line of match[1].split('\n')) {
    const [key, ...rest] = line.split(':');
    if (key && rest.length) meta[key.trim()] = rest.join(':').trim();
  }
  return { meta };
}

function toPosix(p) {
  return p.split(path.sep).join('/');
}

function mdPathFromMdRel(mdRel) {
  return toPosix(path.join('markdown', mdRel));
}

function removeStaleTxtFiles() {
  for (const entry of fs.readdirSync(txtRoot, { withFileTypes: true })) {
    const full = path.join(txtRoot, entry.name);
    if (entry.isDirectory()) {
      fs.rmSync(full, { recursive: true, force: true });
    } else if (entry.name.endsWith('.txt') && entry.name !== 'llm.txt' && entry.name !== 'llms.txt') {
      fs.unlinkSync(full);
    }
  }
}

const docs = [];

function walk(dir, rel = '') {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const relPath = path.join(rel, entry.name);
    if (entry.isDirectory()) {
      walk(full, relPath);
    } else if (entry.name.endsWith('.md')) {
      const content = fs.readFileSync(full, 'utf8');
      const { meta } = parseFrontmatter(content);
      docs.push({ ...meta, mdRel: toPosix(relPath) });
    }
  }
}

walk(markdownRoot);

docs.sort((a, b) => {
  const ca = categoryOrder.indexOf(a.category);
  const cb = categoryOrder.indexOf(b.category);
  if (ca !== cb) return ca - cb;
  return Number(a.order ?? 0) - Number(b.order ?? 0);
});

function buildIndexHeader() {
  return [
    '# Koala Nest',
    '',
    '> Facilitador para criar APIs NestJS com arquitetura DDD. A CLI copia módulos prontos para dentro do projeto — código que você pode ler, adaptar e manter.',
    '',
    'Documentação otimizada para LLMs. Cada tópico aponta para o arquivo Markdown correspondente — sem duplicar conteúdo.',
    '',
  ].join('\n');
}

function buildIndexSections() {
  return categoryOrder.flatMap((cat) => {
    const items = docs.filter((d) => d.category === cat);
    if (!items.length) return [];
    return [
      `## ${categoryLabels[cat] ?? cat}`,
      '',
      ...items.map(
        (d) => `- [${d.title}](${mdPathFromMdRel(d.mdRel)}): ${d.description ?? ''}`,
      ),
      '',
    ];
  });
}

fs.mkdirSync(txtRoot, { recursive: true });
removeStaleTxtFiles();

const llmsIndex = [buildIndexHeader(), ...buildIndexSections()].join('\n');

fs.writeFileSync(path.join(txtRoot, 'llms.txt'), llmsIndex);
fs.writeFileSync(path.join(txtRoot, 'llm.txt'), llmsIndex);

console.log(`Gerados llm.txt e llms.txt (${docs.length} tópicos)`);
