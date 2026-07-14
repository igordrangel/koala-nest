import { computed, inject, Injectable } from '@angular/core';
import manifest from '../../../generated/docs-manifest.json';
import type { DocPage, DocsManifest } from '../models/docs.types';
import { DEFAULT_LOCALE } from '../models/locale.types';
import { stripFrontmatter } from '../utils/markdown-body';
import { transformMarkdownLinks } from '../utils/markdown-links';
import { LocaleService } from './locale.service';

@Injectable({ providedIn: 'root' })
export class DocsService {
  private readonly localeService = inject(LocaleService);
  private readonly data = manifest as DocsManifest;

  readonly navigation = computed(() => {
    const locale = this.localeService.locale();
    return this.data.locales[locale]?.navigation ?? this.data.locales[DEFAULT_LOCALE].navigation;
  });

  readonly docs = computed(() => {
    const locale = this.localeService.locale();
    return this.data.locales[locale]?.docs ?? this.data.locales[DEFAULT_LOCALE].docs;
  });

  findDoc(category: string, slug: string): DocPage | undefined {
    return this.docs().find((doc) => doc.category === category && doc.slug === slug);
  }

  markdownUrl(doc: DocPage): string {
    return `/markdown/${doc.mdRel}`;
  }

  getRenderableContent(doc: DocPage, rawMarkdown: string): string {
    const body = stripFrontmatter(rawMarkdown);
    return transformMarkdownLinks(body, doc.category, doc.locale);
  }

  search(query: string) {
    const term = query.trim().toLowerCase();
    if (!term) return [];

    const categoryLabels = new Map(
      this.navigation().map((section) => [section.category, section.label]),
    );

    return this.docs()
      .filter((doc) => {
        const haystack = [doc.title, doc.description, doc.category].join(' ').toLowerCase();
        return haystack.includes(term);
      })
      .slice(0, 12)
      .map((doc) => ({
        id: doc.docKey,
        title: doc.title,
        category: categoryLabels.get(doc.category) ?? doc.category,
        route: doc.route,
        snippet: doc.description,
      }));
  }
}
