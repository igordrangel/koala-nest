import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Button } from '@/shared/components/button';
import { APP_VERSION } from '../../constants/app-version';
import { UI_COPY } from '../../i18n/ui-copy';
import { CopyFeedbackButtonComponent } from '../copy-feedback-button/copy-feedback-button.component';
import { DocsSidebarComponent } from '../docs-sidebar/docs-sidebar.component';
import { GithubStarsComponent } from '../github-stars/github-stars.component';
import { LocaleService } from '../../services/locale.service';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-site-header',
  templateUrl: './site-header.component.html',
  imports: [
    Button,
    RouterLink,
    RouterLinkActive,
    DocsSidebarComponent,
    GithubStarsComponent,
    CopyFeedbackButtonComponent,
    NgTemplateOutlet,
  ],
})
export class SiteHeaderComponent {
  private readonly searchService = inject(SearchService);
  private readonly localeService = inject(LocaleService);
  private readonly router = inject(Router);

  readonly version = `v${APP_VERSION}`;
  readonly mobileMenuVisible = signal(false);
  readonly mobileMenuOpen = signal(false);
  readonly locale = this.localeService.locale;

  readonly copy = computed(() => UI_COPY[this.localeService.locale()]);

  readonly homeLink = computed(() => this.localeService.homeRoute());
  readonly docsNavLink = computed(() => this.localeService.docsRootRoute());
  readonly llmsUrl = () => `${location.origin}${this.localeService.llmsFile()}`;

  switchLocale(target: 'pt' | 'en') {
    if (target === this.localeService.locale()) return;
    void this.router.navigateByUrl(this.localeService.switchLocalePath(target));
  }

  toggleMobileMenu() {
    const visible = this.mobileMenuVisible();
    this.mobileMenuVisible.set(!visible);
    if (!visible) {
      setTimeout(() => this.mobileMenuOpen.set(true), 10);
    } else {
      this.closeMobileMenu();
    }
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
    setTimeout(() => this.mobileMenuVisible.set(false), 200);
  }

  triggerSearch() {
    this.searchService.show();
  }
}
