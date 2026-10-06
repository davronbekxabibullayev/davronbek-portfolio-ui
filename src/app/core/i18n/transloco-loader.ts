import { Injectable } from '@angular/core';
import { Translation, TranslocoLoader } from '@jsverse/transloco';
import { Observable, of } from 'rxjs';
import { en } from './translations/en';
import { ru } from './translations/ru';
import { uz } from './translations/uz';

const TRANSLATIONS: Record<string, Translation> = { en, uz, ru };

/**
 * UI strings are bundled (a few KB) instead of fetched over HTTP:
 * no extra request, and SSR renders the right language without absolute URLs.
 * Content (projects, posts...) comes translated from the API.
 */
@Injectable({ providedIn: 'root' })
export class InlineTranslocoLoader implements TranslocoLoader {
  getTranslation(lang: string): Observable<Translation> {
    return of(TRANSLATIONS[lang] ?? en);
  }
}
