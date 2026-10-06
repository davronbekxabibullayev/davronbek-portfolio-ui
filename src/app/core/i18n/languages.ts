import { inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, distinctUntilChanged, map } from 'rxjs';

export const LANGS = ['en', 'uz', 'ru'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'en';

export const LANG_LABELS: Record<Lang, string> = { en: 'EN', uz: 'UZ', ru: 'RU' };

/** BCP 47 tags for <html lang>, hreflang and Intl formatting. */
export const LANG_LOCALES: Record<Lang, string> = { en: 'en', uz: 'uz-Latn', ru: 'ru' };

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (LANGS as readonly string[]).includes(value);
}

/**
 * The `:lang` route param as a stream. Works in any routed component because the router
 * uses `paramsInheritanceStrategy: 'always'`.
 */
export function injectLang$(): Observable<Lang> {
  return inject(ActivatedRoute).paramMap.pipe(
    map((p) => p.get('lang')),
    map((l) => (isLang(l) ? l : DEFAULT_LANG)),
    distinctUntilChanged(),
  );
}
