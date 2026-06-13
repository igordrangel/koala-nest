import { ViewportScroller } from '@angular/common';
import { Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterOutlet, Scroll } from '@angular/router';
import { filter, map } from 'rxjs';
import { DocsSidebarComponent } from './core/components/docs-sidebar/docs-sidebar.component';
import { SearchDialogComponent } from './core/components/search-dialog/search-dialog.component';
import { SiteFooterComponent } from './core/components/site-footer/site-footer.component';
import { SiteHeaderComponent } from './core/components/site-header/site-header.component';
import { UI_COPY } from './core/i18n/ui-copy';
import { LocaleService } from './core/services/locale.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [
    RouterOutlet,
    SiteHeaderComponent,
    SiteFooterComponent,
    SearchDialogComponent,
    DocsSidebarComponent,
  ],
})
export class App {
  private readonly router = inject(Router);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly localeService = inject(LocaleService);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);

  readonly isDocPage = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.localeService.isDocsUrl(this.router.url)),
    ),
    { initialValue: this.localeService.isDocsUrl(this.router.url) },
  );

  readonly mainSectionClass = computed(() => {
    const base = 'min-w-0 flex-1 mt-16 min-h-[calc(100vh-4rem)] flex flex-col';
    return this.isDocPage() ? `${base} lg:ml-60` : base;
  });

  readonly mainContentClass = computed(() =>
    this.isDocPage() ? 'flex-1 px-6' : 'flex-1 px-0',
  );

  constructor() {
    this.viewportScroller.setOffset([0, 250]);

    effect(() => {
      const locale = this.localeService.locale();
      document.documentElement.lang = locale === 'pt' ? 'pt-BR' : 'en';
      this.meta.updateTag({
        name: 'description',
        content: UI_COPY[locale].metaDescription,
      });
    });

    effect(() => {
      if (!this.isDocPage()) {
        this.title.setTitle('Koala Nest');
      }
    });

    this.router.events.pipe(filter((e): e is Scroll => e instanceof Scroll)).subscribe((e) => {
      if (e.anchor) {
        setTimeout(() => this.viewportScroller.scrollToAnchor(e.anchor!), 0);
      }
    });
  }
}
