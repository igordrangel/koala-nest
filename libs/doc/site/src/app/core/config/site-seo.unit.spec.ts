import { describe, expect, it } from 'bun:test';
import { absoluteSiteUrl, SITE_URL } from './site-seo';

describe('absoluteSiteUrl', () => {
  it('normalizes the root to a trailing slash', () => {
    expect(absoluteSiteUrl('/')).toBe(`${SITE_URL}/`);
    expect(absoluteSiteUrl('')).toBe(`${SITE_URL}/`);
  });

  it('adds a trailing slash to page paths for GitHub Pages', () => {
    expect(absoluteSiteUrl('/pt')).toBe(`${SITE_URL}/pt/`);
    expect(absoluteSiteUrl('/pt/docs/intro/visao-geral')).toBe(
      `${SITE_URL}/pt/docs/intro/visao-geral/`,
    );
    expect(absoluteSiteUrl('/en/docs/intro/overview/')).toBe(
      `${SITE_URL}/en/docs/intro/overview/`,
    );
  });

  it('keeps file paths without forcing a trailing slash', () => {
    expect(absoluteSiteUrl('/llms.txt')).toBe(`${SITE_URL}/llms.txt`);
    expect(absoluteSiteUrl('/markdown/pt/intro/visao-geral.md')).toBe(
      `${SITE_URL}/markdown/pt/intro/visao-geral.md`,
    );
  });
});
