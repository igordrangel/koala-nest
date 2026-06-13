import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { MARKED_OPTIONS, MERMAID_OPTIONS, provideMarkdown } from 'ngx-markdown';
import { createDocsMarkedRenderer } from './core/utils/marked-setup';
import { docsMermaidOptions } from './core/utils/mermaid-config';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled',
      }),
    ),
    provideMarkdown({
      markedOptions: {
        provide: MARKED_OPTIONS,
        useValue: { renderer: createDocsMarkedRenderer() },
      },
      mermaidOptions: {
        provide: MERMAID_OPTIONS,
        useValue: docsMermaidOptions,
      },
    }),
  ],
};
