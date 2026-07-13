import fs from 'node:fs';
import path from 'node:path';

export const SITE_URL = 'https://nest.koalarx.com';

/** GitHub Pages 301s bare paths to trailing-slash dirs; sitemap must list final URLs. */
export function withTrailingSlash(route) {
  if (!route || route === '/') return '/';
  return route.endsWith('/') ? route : `${route}/`;
}

export function absoluteUrl(route) {
  const normalized = withTrailingSlash(route);
  return normalized === '/' ? `${SITE_URL}/` : `${SITE_URL}${normalized}`;
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function xhtmlAlternates(alternates) {
  return alternates
    .map(
      ([hreflang, href]) =>
        `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${escapeXml(href)}" />`,
    )
    .join('\n');
}

export function buildSitemapEntries(manifest) {
  const entries = [];

  for (const locale of manifest.supportedLocales) {
    entries.push({
      loc: absoluteUrl(`/${locale}`),
      alternates: [
        ['pt-BR', absoluteUrl('/pt')],
        ['en', absoluteUrl('/en')],
        ['x-default', absoluteUrl('/pt')],
      ],
    });

    for (const doc of manifest.locales[locale].docs) {
      const loc = absoluteUrl(doc.route);
      const hasTranslation =
        Boolean(doc.alternateRoute) && doc.alternateRoute !== doc.route;

      if (!hasTranslation) {
        entries.push({ loc, alternates: [] });
        continue;
      }

      const alternate = absoluteUrl(doc.alternateRoute);
      const ptHref = locale === 'pt' ? loc : alternate;
      const enHref = locale === 'en' ? loc : alternate;

      entries.push({
        loc,
        alternates: [
          ['pt-BR', ptHref],
          ['en', enHref],
          ['x-default', ptHref],
        ],
      });
    }
  }

  const seen = new Set();
  return entries.filter((entry) => {
    if (seen.has(entry.loc)) return false;
    seen.add(entry.loc);
    return true;
  });
}

export function buildSitemapXml(entries) {
  const urls = entries
    .map((entry) => {
      const links = entry.alternates?.length
        ? `\n${xhtmlAlternates(entry.alternates)}`
        : '';
      return `  <url>\n    <loc>${escapeXml(entry.loc)}</loc>${links}\n  </url>`;
    })
    .join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    urls,
    '</urlset>',
    '',
  ].join('\n');
}

export function writeSitemap(manifest, outputPath) {
  const xml = buildSitemapXml(buildSitemapEntries(manifest));
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, xml);
  return outputPath;
}
