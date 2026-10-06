import { Pipe, PipeTransform } from '@angular/core';
import { marked } from 'marked';
import { LANG_LOCALES, Lang } from '../core/i18n/languages';

/**
 * Markdown -> HTML. The result is bound with [innerHTML], so Angular's sanitizer
 * still strips scripts and unsafe attributes.
 */
@Pipe({ name: 'markdown' })
export class MarkdownPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return value ? (marked.parse(value, { async: false, gfm: true }) as string) : '';
  }
}

/** "Sep 2024" / "сент. 2024 г." / "sen, 2024" — uses the platform's Intl data (also on the server). */
@Pipe({ name: 'monthYear' })
export class MonthYearPipe implements PipeTransform {
  transform(value: string | null | undefined, lang: Lang): string {
    if (!value) return '';
    return new Intl.DateTimeFormat(LANG_LOCALES[lang], { month: 'short', year: 'numeric', timeZone: 'UTC' })
      .format(new Date(value));
  }
}

@Pipe({ name: 'longDate' })
export class LongDatePipe implements PipeTransform {
  transform(value: string | null | undefined, lang: Lang): string {
    if (!value) return '';
    return new Intl.DateTimeFormat(LANG_LOCALES[lang], { dateStyle: 'long', timeZone: 'UTC' })
      .format(new Date(value));
  }
}
