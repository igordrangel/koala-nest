import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { DEFAULT_LOCALE, isLocale, type Locale, SUPPORTED_LOCALES } from '../models/locale.types';
import { isDocsUrl, isLandingUrl, parseLocaleFromUrl } from '../utils/locale-url';

@Injectable({ providedIn: 'root' })
export class LocaleService {
  private readonly router = inject(Router);

  readonly supportedLocales = SUPPORTED_LOCALES;
  readonly defaultLocale = DEFAULT_LOCALE;

  readonly locale = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.parseLocale(this.router.url)),
    ),
    { initialValue: this.parseLocale(this.router.url) },
  );

  parseLocale(url: string): Locale {
    return parseLocaleFromUrl(url);
  }

  isLandingUrl(url: string) {
    return isLandingUrl(url);
  }

  isDocsUrl(url: string) {
    return isDocsUrl(url);
  }

  homeRoute(locale = this.locale()) {
    return `/${locale}`;
  }

  docsRootRoute(locale = this.locale()) {
    return `/${locale}/docs`;
  }

  defaultDocsRoute(locale = this.locale()) {
    return `/${locale}/docs/inicio/guia-de-instalacao`;
  }

  docsRoute(category: string, slug: string, locale = this.locale()) {
    return `/${locale}/docs/${category}/${slug}`;
  }

  llmsFile(locale = this.locale()) {
    return locale === 'pt' ? '/llms.txt' : `/llms-${locale}.txt`;
  }

  switchLocalePath(target: Locale): string {
    const path = this.router.url.split('?')[0].split('#')[0];
    const parts = path.split('/').filter(Boolean);

    if (parts.length === 0) {
      return `/${target}`;
    }

    if (isLocale(parts[0])) {
      parts[0] = target;
    } else {
      parts.unshift(target);
    }

    return `/${parts.join('/')}`;
  }
}
