import 'prismjs';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup';

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import './app/core/utils/marked-setup';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
