import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { CopyFeedbackButtonComponent } from '../../core/components/copy-feedback-button/copy-feedback-button.component';
import { DocOnThisPageComponent } from '../../core/components/doc-on-this-page/doc-on-this-page.component';
import { MarkdownContentComponent } from '../../core/components/markdown-content/markdown-content.component';
import { UI_COPY } from '../../core/i18n/ui-copy';
import { DocsService } from '../../core/services/docs.service';
import { LocaleService } from '../../core/services/locale.service';

@Component({
  selector: 'app-doc-page',
  templateUrl: './doc-page.component.html',
  imports: [MarkdownContentComponent, RouterLink, DocOnThisPageComponent, CopyFeedbackButtonComponent],
})
export class DocPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly docsService = inject(DocsService);
  private readonly localeService = inject(LocaleService);
  private readonly title = inject(Title);

  private readonly articleRef = viewChild<ElementRef<HTMLElement>>('articleRef');
  private previousDocKey = '';

  private readonly params = toSignal(
    this.route.paramMap.pipe(
      map((params) => ({
        category: params.get('category') ?? '',
        slug: params.get('slug') ?? '',
      })),
    ),
    { initialValue: { category: '', slug: '' } },
  );

  readonly doc = computed(() => {
    const { category, slug } = this.params();
    return this.docsService.findDoc(category, slug);
  });

  readonly content = computed(() => {
    const current = this.doc();
    return current ? this.docsService.getRenderableContent(current) : '';
  });

  readonly markdownReady = signal(0);
  readonly copy = computed(() => UI_COPY[this.localeService.locale()]);
  readonly installGuideLink = computed(() => this.localeService.defaultDocsRoute());
  readonly articleElement = computed(() => this.articleRef()?.nativeElement ?? null);
  readonly docAiUrl = () => {
    const current = this.doc();
    if (!current?.mdRel) return '';
    return `${location.origin}/markdown/${current.mdRel}`;
  };

  constructor() {
    effect(() => {
      const page = this.doc();
      this.title.setTitle(page ? `${page.title} — Koala Nest` : 'Koala Nest');
    });

    effect(() => {
      const { category, slug } = this.params();
      if (!category || !slug) return;

      const docKey = `${category}/${slug}`;
      const isDocChange = this.previousDocKey !== '' && this.previousDocKey !== docKey;
      this.previousDocKey = docKey;

      this.markdownReady.set(0);

      if (isDocChange) {
        queueMicrotask(() => window.scrollTo({ top: 0, left: 0 }));
      }
    });
  }

  onMarkdownReady() {
    this.markdownReady.update((value) => value + 1);
  }
}
