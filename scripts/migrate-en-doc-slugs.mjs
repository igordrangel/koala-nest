import fs from 'node:fs';
import path from 'node:path';
import { parseFrontmatter } from '../libs/doc/shared/nav.mjs';

const markdownRoot = path.resolve('libs/doc/markdown');

const EN_DOCS = [
  { docKey: 'intro/visao-geral', category: 'intro', slug: 'overview', file: 'overview.md' },
  { docKey: 'intro/arquitetura-ddd', category: 'intro', slug: 'ddd-architecture', file: 'ddd-architecture.md' },
  {
    docKey: 'inicio/guia-de-instalacao',
    category: 'getting-started',
    slug: 'installation-guide',
    file: 'installation-guide.md',
  },
  {
    docKey: 'inicio/variaveis-de-ambiente',
    category: 'getting-started',
    slug: 'environment-variables',
    file: 'environment-variables.md',
  },
  {
    docKey: 'inicio/estrutura-do-projeto',
    category: 'getting-started',
    slug: 'project-structure',
    file: 'project-structure.md',
  },
  { docKey: 'core/bases-reutilizaveis', category: 'core', slug: 'reusable-bases', file: 'reusable-bases.md' },
  { docKey: 'core/object-class', category: 'core', slug: 'object-class', file: 'object-class.md' },
  { docKey: 'core/paginacao', category: 'core', slug: 'pagination', file: 'pagination.md' },
  { docKey: 'domain/entidades', category: 'domain', slug: 'entities', file: 'entities.md' },
  {
    docKey: 'domain/contratos-repositorio',
    category: 'domain',
    slug: 'repository-contracts',
    file: 'repository-contracts.md',
  },
  { docKey: 'application/handlers', category: 'application', slug: 'handlers', file: 'handlers.md' },
  { docKey: 'application/validators', category: 'application', slug: 'validators', file: 'validators.md' },
  {
    docKey: 'application/requests-responses',
    category: 'application',
    slug: 'requests-responses',
    file: 'requests-responses.md',
  },
  { docKey: 'application/mapeamento', category: 'application', slug: 'mapping', file: 'mapping.md' },
  { docKey: 'host/controllers', category: 'host', slug: 'controllers', file: 'controllers.md' },
  { docKey: 'host/rotas', category: 'host', slug: 'routes', file: 'routes.md' },
  { docKey: 'host/tratamento-de-erros', category: 'host', slug: 'error-handling', file: 'error-handling.md' },
  { docKey: 'host/openapi-scalar', category: 'host', slug: 'openapi-scalar', file: 'openapi-scalar.md' },
  { docKey: 'infra/banco-de-dados', category: 'infra', slug: 'database', file: 'database.md' },
  { docKey: 'infra/repositorios', category: 'infra', slug: 'repositories', file: 'repositories.md' },
  { docKey: 'infra/migrations', category: 'infra', slug: 'migrations', file: 'migrations.md' },
  { docKey: 'guias/fluxo-crud-person', category: 'guides', slug: 'person-crud-flow', file: 'person-crud-flow.md' },
];

const LINK_REPLACEMENTS = [
  ['guia-de-instalacao.md', 'installation-guide.md'],
  ['variaveis-de-ambiente.md', 'environment-variables.md'],
  ['estrutura-do-projeto.md', 'project-structure.md'],
  ['visao-geral.md', 'overview.md'],
  ['arquitetura-ddd.md', 'ddd-architecture.md'],
  ['bases-reutilizaveis.md', 'reusable-bases.md'],
  ['paginacao.md', 'pagination.md'],
  ['entidades.md', 'entities.md'],
  ['contratos-repositorio.md', 'repository-contracts.md'],
  ['mapeamento.md', 'mapping.md'],
  ['rotas.md', 'routes.md'],
  ['tratamento-de-erros.md', 'error-handling.md'],
  ['banco-de-dados.md', 'database.md'],
  ['repositorios.md', 'repositories.md'],
  ['fluxo-crud-person.md', 'person-crud-flow.md'],
];

function updateFrontmatter(content, updates) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error('Frontmatter ausente');

  const lines = match[1].split('\n');
  const body = match[2];
  const meta = {};

  for (const line of lines) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    meta[key] = value;
  }

  Object.assign(meta, updates);

  const orderedKeys = ['title', 'slug', 'category', 'docKey', 'order', 'description'];
  const frontmatter = orderedKeys
    .filter((key) => meta[key] !== undefined)
    .map((key) => `${key}: ${meta[key]}`)
    .join('\n');

  return `---\n${frontmatter}\n---\n${body}`;
}

function ensureDocKeyInPt() {
  const ptRoot = path.join(markdownRoot, 'pt');

  for (const entry of fs.readdirSync(ptRoot, { withFileTypes: true, recursive: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue;

    const fullPath = path.join(entry.parentPath ?? entry.path, entry.name);
    const raw = fs.readFileSync(fullPath, 'utf8');
    const { meta, body } = parseFrontmatter(raw);
    const docKey = meta.docKey ?? `${meta.category}/${meta.slug}`;

    if (meta.docKey) continue;

    const updated = updateFrontmatter(raw, { docKey });
    fs.writeFileSync(fullPath, updated);
  }
}

function migrateEnDocs() {
  const sourceByKey = new Map();

  for (const entry of fs.readdirSync(path.join(markdownRoot, 'en'), { withFileTypes: true, recursive: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
    const fullPath = path.join(entry.parentPath ?? entry.path, entry.name);
    const { meta } = parseFrontmatter(fs.readFileSync(fullPath, 'utf8'));
    const docKey = meta.docKey ?? `${meta.category}/${meta.slug}`;
    sourceByKey.set(docKey, fullPath);
  }

  for (const target of EN_DOCS) {
    const sourcePath = sourceByKey.get(target.docKey);
    if (!sourcePath) {
      throw new Error(`Arquivo EN não encontrado para docKey ${target.docKey}`);
    }

    let content = fs.readFileSync(sourcePath, 'utf8');
    for (const [from, to] of LINK_REPLACEMENTS) {
      content = content.replaceAll(from, to);
    }

    content = updateFrontmatter(content, {
      slug: target.slug,
      category: target.category,
      docKey: target.docKey,
    });

    const destDir = path.join(markdownRoot, 'en', target.category);
    const destPath = path.join(destDir, target.file);
    fs.mkdirSync(destDir, { recursive: true });
    fs.writeFileSync(destPath, content);

    if (sourcePath !== destPath) {
      fs.rmSync(sourcePath);
    }
  }

  for (const folder of ['inicio', 'guias']) {
    const legacyDir = path.join(markdownRoot, 'en', folder);
    if (fs.existsSync(legacyDir) && fs.readdirSync(legacyDir).length === 0) {
      fs.rmdirSync(legacyDir);
    }
  }
}

ensureDocKeyInPt();
migrateEnDocs();
console.log(`Migrados ${EN_DOCS.length} tópicos EN para slugs nativos.`);
