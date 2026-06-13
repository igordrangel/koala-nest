import { Component, ElementRef, HostListener, inject, input, output } from '@angular/core';
import { MarkdownComponent } from 'ngx-markdown';

declare const Prism: {
  highlightElement: (element: HTMLElement) => void;
};

@Component({
  selector: 'app-markdown-content',
  template: `
    <markdown
      class="prose-docs"
      ngPreserveWhitespaces
      [data]="content()"
      [disableSanitizer]="true"
      (ready)="onReady()"
    />
  `,
  imports: [MarkdownComponent],
})
export class MarkdownContentComponent {
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly content = input.required<string>();
  readonly rendered = output<void>();

  @HostListener('click', ['$event'])
  onHostClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const button = target.closest<HTMLButtonElement>('[data-copy-code]');
    if (!button) return;

    event.preventDefault();

    const code = button.closest('.code-block')?.querySelector('code');
    if (!code) return;

    const text = code.textContent?.trim();
    if (!text) return;

    void navigator.clipboard.writeText(text).then(() => {
      this.showCopiedState(button);
    });
  }

  onReady() {
    this.highlightCode();
    queueMicrotask(() => this.rendered.emit());
  }

  highlightCode() {
    if (typeof Prism === 'undefined') return;

    const root = this.host.nativeElement;
    root.querySelectorAll('pre code').forEach((block: Element) => {
      Prism.highlightElement(block as HTMLElement);
    });
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
