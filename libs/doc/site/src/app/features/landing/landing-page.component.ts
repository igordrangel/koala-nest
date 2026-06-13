import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from '@/shared/components/button';
import { MarkdownContentComponent } from '../../core/components/markdown-content/markdown-content.component';
import { CLI_SNIPPET, UI_COPY } from '../../core/i18n/ui-copy';
import { LocaleService } from '../../core/services/locale.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  imports: [Button, RouterLink, MarkdownContentComponent],
})
export class LandingPageComponent {
  readonly localeService = inject(LocaleService);

  readonly locale = this.localeService.locale;
  readonly copy = computed(() => UI_COPY[this.localeService.locale()]);
  readonly docsLink = computed(() => this.localeService.defaultDocsRoute());
  readonly overviewLink = computed(() =>
    this.localeService.docsRoute('intro', 'visao-geral'),
  );
  readonly cliSnippet = CLI_SNIPPET;
}
