import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  effect,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  PLATFORM_ID,
  signal,
  untracked,
} from '@angular/core';
import { MarkdownComponent } from 'ngx-markdown';
import { extractCodeText, findCopyCodeButton } from '../../utils/doc-ui';
import { contentHasMermaid, ensureMermaidLoaded } from '../../utils/mermaid-loader';
import { contentHasCode, ensurePrismLoaded, highlightCodeBlocks } from '../../utils/prism-loader';

@Component({
  selector: 'app-markdown-content',
  template: `
    @if (renderMarkdown()) {
      <markdown
        class="prose-docs"
        ngPreserveWhitespaces
        [data]="content()"
        [disableSanitizer]="true"
        [mermaid]="usesMermaid()"
        (ready)="onReady()"
      />
    }
  `,
  imports: [MarkdownComponent],
})
export class MarkdownContentComponent {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly content = input.required<string>();
  readonly rendered = output<void>();

  readonly renderMarkdown = signal(false);
  readonly usesMermaid = signal(false);

  constructor() {
    effect(() => {
      const content = this.content();
      untracked(() => {
        void this.prepare(content);
      });
    });
  }

  @HostListener('click', ['$event'])
  onHostClick(event: MouseEvent) {
    const button = findCopyCodeButton(event.target);
    if (!button) return;

    event.preventDefault();

    const text = extractCodeText(button);
    if (!text) return;

    void navigator.clipboard.writeText(text).then(() => {
      this.showCopiedState(button);
    });
  }

  onReady() {
    if (this.isBrowser) {
      void this.enhanceCode();
    }
    queueMicrotask(() => this.rendered.emit());
  }

  private async enhanceCode() {
    const content = this.content();
    if (contentHasCode(content)) {
      await ensurePrismLoaded();
      highlightCodeBlocks(this.host.nativeElement);
    }

    if (contentHasMermaid(content) && !this.usesMermaid()) {
      await ensureMermaidLoaded();
      this.usesMermaid.set(true);
    }
  }

  private async prepare(content: string) {
    const usesMermaid = contentHasMermaid(content);
    this.usesMermaid.set(false);

    // Paint markdown immediately (SEO / SSR HTML); enhance Prism/Mermaid after.
    this.renderMarkdown.set(true);

    if (!this.isBrowser) {
      return;
    }

    if (usesMermaid) {
      await ensureMermaidLoaded();
      this.usesMermaid.set(true);
    }
  }

  private showCopiedState(button: HTMLButtonElement) {
    const icon = button.querySelector('i');
    if (!icon) return;

    const previousClass = icon.className;
    icon.className = 'fa-solid fa-check';

    window.setTimeout(() => {
      icon.className = previousClass || 'fa-regular fa-clipboard';
    }, 2000);
  }
}
