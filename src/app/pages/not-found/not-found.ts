import { Component, RESPONSE_INIT, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { DEFAULT_LANG, injectLang$ } from '../../core/i18n/languages';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, TranslocoPipe],
  template: `
    <section class="wrap page">
      <p class="mono code">404</p>
      <h1 class="h2">{{ 'notFound.title' | transloco }}</h1>
      <p>{{ 'notFound.text' | transloco }}</p>
      <a class="btn btn--primary" [routerLink]="['/', lang()]">{{ 'notFound.home' | transloco }}</a>
    </section>
  `,
  styles: `
    .page { padding-top: 120px; padding-bottom: 160px; text-align: center; }
    .code { font-size: 14px; color: var(--accent); margin: 0 0 12px; }
    p { margin: 16px 0 32px; }
  `,
})
export class NotFound {
  protected readonly lang = toSignal(injectLang$(), { initialValue: DEFAULT_LANG });

  constructor() {
    // During SSR: answer with a real 404 so search engines don't index the page.
    const response = inject(RESPONSE_INIT, { optional: true });
    if (response) response.status = 404;
  }
}
