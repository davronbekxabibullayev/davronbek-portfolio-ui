import { DOCUMENT } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { filter, map } from 'rxjs';
import { DEFAULT_LANG, LANGS, LANG_LABELS, LANG_LOCALES, Lang, injectLang$ } from '../core/i18n/languages';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, TranslocoPipe],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  private readonly router = inject(Router);
  private readonly transloco = inject(TranslocoService);
  private readonly document = inject(DOCUMENT);

  protected readonly langs = LANGS;
  protected readonly labels = LANG_LABELS;
  protected readonly year = new Date().getFullYear();

  protected readonly lang = toSignal(injectLang$(), { initialValue: DEFAULT_LANG });

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  /** Same page in another language: /uz/projects/x -> /ru/projects/x */
  protected readonly langLinks = computed(() => {
    const path = this.url().split(/[?#]/)[0];
    const prefixed = /^\/(en|uz|ru)(?=\/|$)/;
    return Object.fromEntries(
      LANGS.map((l) => [l, prefixed.test(path) ? path.replace(prefixed, `/${l}`) : `/${l}`]),
    ) as Record<Lang, string>;
  });

  constructor() {
    injectLang$()
      .pipe(takeUntilDestroyed())
      .subscribe((lang) => {
        this.transloco.setActiveLang(lang);
        this.document.documentElement.lang = LANG_LOCALES[lang];
      });
  }
}
