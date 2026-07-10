import { Button } from '@/shared/components/button';
import {
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { UI_COPY } from '../../i18n/ui-copy';
import { DocsService } from '../../services/docs.service';
import { LocaleService } from '../../services/locale.service';
import { shouldOpenSearchDialog } from '../../utils/doc-ui';
import type { DocSearchResult } from './doc-search.types';

@Component({
  selector: 'app-doc-search',
  templateUrl: './doc-search.html',
  imports: [Button],
})
export class DocSearch {
  private readonly docsService = inject(DocsService);
  private readonly localeService = inject(LocaleService);
  private readonly router = inject(Router);
  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  readonly open = signal(false);
  readonly query = signal('');
  readonly activeIndex = signal(0);

  readonly copy = computed(() => UI_COPY[this.localeService.locale()]);

  readonly results = computed(() => this.docsService.search(this.query()));

  readonly groupedResults = computed(() => {
    const groups = new Map<string, DocSearchResult[]>();

    for (const result of this.results()) {
      const items = groups.get(result.category) ?? [];
      items.push(result);
      groups.set(result.category, items);
    }

    return [...groups.entries()];
  });

  readonly flatResults = computed(() => this.results());

  constructor() {
    effect(() => {
      this.query();
      this.activeIndex.set(0);
    });

    effect(() => {
      if (this.open()) {
        queueMicrotask(() => this.searchInput()?.nativeElement.focus());
      }
    });
  }

  @HostListener('document:keydown', ['$event'])
  onGlobalKeydown(event: KeyboardEvent) {
    if (shouldOpenSearchDialog(event)) {
      event.preventDefault();
      this.toggle();
    }
  }

  toggle() {
    this.open.update((value) => !value);

    if (!this.open()) {
      this.query.set('');
      this.activeIndex.set(0);
    }
  }

  close() {
    this.open.set(false);
    this.query.set('');
    this.activeIndex.set(0);
  }

  onInput(event: Event) {
    this.query.set((event.target as HTMLInputElement).value);
  }

  onKeydown(event: KeyboardEvent) {
    const total = this.flatResults().length;

    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }

    if (!total) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeIndex.update((index) => (index + 1) % total);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex.update((index) => (index - 1 + total) % total);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const result = this.flatResults()[this.activeIndex()];
      if (result) this.navigateTo(result);
    }
  }

  navigateTo(result: DocSearchResult) {
    this.close();
    void this.router.navigateByUrl(result.route);
  }

  isActive(result: DocSearchResult): boolean {
    const index = this.flatResults().findIndex((item) => item.id === result.id);
    return index === this.activeIndex();
  }

  getGlobalIndex(result: DocSearchResult): number {
    return this.flatResults().findIndex((item) => item.id === result.id);
  }
}
