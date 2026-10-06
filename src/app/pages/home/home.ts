import { Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { Observable, catchError, map, of, shareReplay, switchMap } from 'rxjs';
import { PortfolioApi } from '../../core/api/portfolio-api';
import { DEFAULT_LANG, Lang, injectLang$ } from '../../core/i18n/languages';
import { SeoService } from '../../core/seo/seo.service';
import { MonthYearPipe } from '../../shared/pipes';
import { ContactForm } from './contact-form';

@Component({
  selector: 'app-home',
  imports: [RouterLink, TranslocoPipe, MonthYearPipe, ContactForm],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly api = inject(PortfolioApi);
  private readonly seo = inject(SeoService);
  private readonly transloco = inject(TranslocoService);

  private readonly lang$ = injectLang$().pipe(shareReplay({ bufferSize: 1, refCount: true }));
  protected readonly lang = toSignal(this.lang$, { initialValue: DEFAULT_LANG });

  /** Each section loads on its own; one failing endpoint doesn't blank the page. */
  private load<T>(fetch: (lang: Lang) => Observable<T>) {
    return toSignal(this.lang$.pipe(switchMap((l) => fetch(l).pipe(catchError(() => of(null))))), {
      initialValue: null,
    });
  }

  protected readonly profile = this.load((l) => this.api.profile(l));
  protected readonly skills = this.load((l) => this.api.skills(l));
  protected readonly experiences = this.load((l) => this.api.experiences(l));
  protected readonly projects = this.load((l) => this.api.projects(l));
  protected readonly posts = this.load((l) => this.api.blogPosts(l, 1, 3).pipe(map((r) => r.items)));

  protected readonly featured = computed(() => this.projects()?.find((p) => p.isFeatured) ?? null);
  protected readonly others = computed(() => {
    const featured = this.featured();
    return (this.projects() ?? []).filter((p) => p !== featured);
  });

  protected readonly aboutParagraphs = computed(() => (this.profile()?.about ?? '').split(/\n{2,}/).filter(Boolean));

  constructor() {
    effect(() => {
      const p = this.profile();
      const lang = this.lang();
      if (!p) return;

      this.seo.set({
        lang,
        path: '',
        type: 'profile',
        title: this.transloco.translate('meta.homeTitle', { name: p.fullName, headline: p.headline }, lang),
        description: p.tagline,
        image: p.photoUrl,
      });
    });
  }
}
