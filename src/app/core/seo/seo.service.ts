import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { SITE_NAME, SITE_URL } from '../site.config';
import { LANGS, LANG_LOCALES, Lang } from '../i18n/languages';

export interface PageSeo {
  title: string;
  description: string;
  lang: Lang;
  /** Path without the language prefix, e.g. '' or '/projects/uds'. */
  path: string;
  image?: string | null;
  type?: 'website' | 'article' | 'profile';
}

/** Title, description, Open Graph, canonical and hreflang — rendered on the server for crawlers. */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  set(page: PageSeo): void {
    const url = `${SITE_URL}/${page.lang}${page.path}`;

    this.title.setTitle(page.title);
    this.meta.updateTag({ name: 'description', content: page.description });

    this.meta.updateTag({ property: 'og:site_name', content: SITE_NAME });
    this.meta.updateTag({ property: 'og:title', content: page.title });
    this.meta.updateTag({ property: 'og:description', content: page.description });
    this.meta.updateTag({ property: 'og:type', content: page.type ?? 'website' });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:locale', content: LANG_LOCALES[page.lang] });
    this.meta.updateTag({ name: 'twitter:card', content: page.image ? 'summary_large_image' : 'summary' });

    if (page.image) this.meta.updateTag({ property: 'og:image', content: page.image });
    else this.meta.removeTag("property='og:image'");

    this.setLink('canonical', url);
    for (const l of LANGS) this.setLink('alternate', `${SITE_URL}/${l}${page.path}`, LANG_LOCALES[l]);
    this.setLink('alternate', `${SITE_URL}/en${page.path}`, 'x-default');
  }

  private setLink(rel: string, href: string, hreflang?: string): void {
    const head = this.document.head;
    const selector = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]:not([hreflang])`;
    let link = head.querySelector<HTMLLinkElement>(selector);

    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', rel);
      if (hreflang) link.setAttribute('hreflang', hreflang);
      head.appendChild(link);
    }

    link.setAttribute('href', href);
  }
}
