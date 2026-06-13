import { Routes } from '@angular/router';
import { docMarkdownProviders } from './core/providers/doc-markdown.providers';
import { localeGuard } from './core/guards/locale.guard';
import { LandingPageComponent } from './features/landing/landing-page.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'pt',
    pathMatch: 'full',
  },
  {
    path: 'pt/docs',
    redirectTo: 'pt/docs/inicio/guia-de-instalacao',
    pathMatch: 'full',
  },
  {
    path: 'en/docs',
    redirectTo: 'en/docs/getting-started/installation-guide',
    pathMatch: 'full',
  },
  {
    path: ':locale',
    component: LandingPageComponent,
    canActivate: [localeGuard],
    title: 'Koala Nest',
  },
  {
    path: ':locale/docs/:category/:slug',
    loadComponent: () =>
      import('./features/doc/doc-page.component').then((module) => module.DocPageComponent),
    canActivate: [localeGuard],
    providers: docMarkdownProviders,
  },
  {
    path: '**',
    redirectTo: 'pt',
  },
];
