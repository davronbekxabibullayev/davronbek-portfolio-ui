import { Routes } from '@angular/router';
import { langMatchGuard } from './core/i18n/lang.guard';
import { DEFAULT_LANG } from './core/i18n/languages';
import { Shell } from './layout/shell';
import { Home } from './pages/home/home';
import { NotFound } from './pages/not-found/not-found';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: DEFAULT_LANG },
  {
    path: ':lang',
    canMatch: [langMatchGuard],
    component: Shell,
    children: [
      { path: '', component: Home },
      {
        path: 'projects/:slug',
        loadComponent: () => import('./pages/project-detail/project-detail').then((m) => m.ProjectDetailPage),
      },
      {
        path: 'blog',
        loadComponent: () => import('./pages/blog-list/blog-list').then((m) => m.BlogListPage),
      },
      {
        path: 'blog/:slug',
        loadComponent: () => import('./pages/blog-post/blog-post').then((m) => m.BlogPostPage),
      },
      { path: '**', component: NotFound },
    ],
  },
  // Unknown first segment (e.g. /de or /old-page): a real 404 inside the site layout, in the default language.
  // Not a redirect: SSR must answer 404 for this URL, not 30x to another one.
  { path: '**', component: Shell, children: [{ path: '', component: NotFound }] },
];
