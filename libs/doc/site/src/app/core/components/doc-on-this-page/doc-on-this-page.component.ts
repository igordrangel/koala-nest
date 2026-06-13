import {
  Component,
  computed,
  effect,
  inject,
  input,
  OnDestroy,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { UI_COPY } from '../../i18n/ui-copy';
import { LocaleService } from '../../services/locale.service';
import { collectTocItems } from '../../utils/doc-ui';

interface TocItem {
  label: string;
  fragment: string;
}

@Component({
  selector: 'app-doc-on-this-page',
  templateUrl: './doc-on-this-page.component.html',
  imports: [RouterLink],
})
export class DocOnThisPageComponent implements OnDestroy {
  private readonly localeService = inject(LocaleService);
  private observer?: IntersectionObserver;

  readonly contentRoot = input<HTMLElement | null>(null);
  readonly refreshToken = input(0);

  readonly items = signal<TocItem[]>([]);
  readonly activeSectionId = signal('');
  readonly copy = computed(() => UI_COPY[this.localeService.locale()]);

  constructor() {
    effect(() => {
      const root = this.contentRoot();
      const token = this.refreshToken();

      if (!root || token === 0) {
        this.items.set([]);
        this.activeSectionId.set('');
        this.observer?.disconnect();
        return;
      }

      queueMicrotask(() => this.scan(root));
    });
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  private scan(root: HTMLElement) {
    const nextItems = collectTocItems(root);

    this.items.set(nextItems);
    this.setupObserver(root, nextItems);
  }

  private setupObserver(root: HTMLElement, nextItems: TocItem[]) {
    this.observer?.disconnect();

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.activeSectionId.set(entry.target.id);
          }
        });
      },
      {
        root: null,
        rootMargin: '-80px 0px -65% 0px',
        threshold: 0,
      },
    );

    nextItems.forEach((item) => {
      const target = root.querySelector(`#${item.fragment}`);
      if (target) {
        this.observer?.observe(target);
      }
    });
  }
}
