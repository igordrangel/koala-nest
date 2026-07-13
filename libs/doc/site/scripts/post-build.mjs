import fs from 'node:fs';
import path from 'node:path';
import { writeSitemap } from './build-sitemap.mjs';

const outputDir = path.resolve('dist/site/browser');
const manifestPath = path.resolve('src/generated/docs-manifest.json');
const indexFile = path.join(outputDir, 'index.html');
const notFoundFile = path.join(outputDir, '404.html');
const sitemapFile = path.join(outputDir, 'sitemap.xml');
const publicSitemapFile = path.resolve('public/sitemap.xml');

if (!fs.existsSync(indexFile)) {
  console.error('index.html não encontrado em', outputDir);
  process.exit(1);
}

fs.copyFileSync(indexFile, notFoundFile);

for (const file of fs.readdirSync(outputDir)) {
  if (file.endsWith('.map')) {
    fs.unlinkSync(path.join(outputDir, file));
  }
}

if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  writeSitemap(manifest, sitemapFile);
  writeSitemap(manifest, publicSitemapFile);
  console.log(`Sitemap gerado → ${sitemapFile}`);
  console.log(`Sitemap gerado → ${publicSitemapFile}`);
} else {
  console.warn('Manifest não encontrado; sitemap.xml não foi gerado.');
}

console.log('404.html gerado para GitHub Pages (SPA fallback)');
console.log('Source maps removidos do artefato de deploy');
