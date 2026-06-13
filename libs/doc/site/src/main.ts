import 'prismjs';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup';

import mermaid from 'mermaid';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

declare global {
  interface Window {
    mermaid: typeof mermaid;
  }
}

window.mermaid = mermaid;

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
