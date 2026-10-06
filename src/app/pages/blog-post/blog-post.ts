import { Component, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { catchError, combineLatest, map, of, switchMap } from 'rxjs';
import { BlogPost } from '../../core/api/models';
import { PortfolioApi } from '../../core/api/portfolio-api';
import { DEFAULT_LANG, injectLang$ } from '../../core/i18n/languages';
import { SeoService } from '../../core/seo/seo.service';
import { SITE_NAME } from '../../core/site.config';
import { LongDatePipe, MarkdownPipe } from '../../shared/pipes';
import { NotFound } from '../not-found/not-found';

type State = { status: 'loading' } | { status: 'ok'; post: BlogPost } | { status: 'not-found' };

@Component({
  selector: 'app-blog-post',
  imports: [RouterLink, TranslocoPipe, MarkdownPipe, LongDatePipe, NotFound],
  template: `
    @switch (state().status) {
      @case ('ok') {
        @let post = current()!;
        <article class="wrap page">
          <a class="text-link back" [routerLink]="['/', lang(), 'blog']">← {{ 'blog.back' | transloco }}</a>
          <header>
            <div class="mono meta">
              <time [attr.datetime]="post.publishedAt">{{ post.publishedAt | longDate: lang() }}</time>
              · {{ 'blog.minRead' | transloco: { n: post.readingMinutes } }}
            </div>
            <h1 class="display title">{{ post.title }}</h1>
            <div class="chips">
              @for (t of post.tags; track t) {
                <span class="chip">#{{ t }}</span>
              }
            </div>
          </header>
          @if (post.coverImageUrl) {
            <img class="cover" [src]="post.coverImageUrl" alt="" />
          }
          <div class="prose body" [innerHTML]="post.content | markdown"></div>
        </article>
      }
      @case ('not-found') {
        <app-not-found />
      }
      @default {
        <div class="wrap page" aria-busy="true"></div>
      }
    }
  `,
  styles: `
    .page { padding-top: 48px; padding-bottom: 96px; max-width: 760px; }
    .back { margin-bottom: 32px; }
    .meta { font-size: 13px; color: var(--muted); }
    .title { margin: 12px 0 20px; font-size: clamp(32px, 5vw, 46px); line-height: 1.1; color: var(--text-strong); }
    .cover { width: 100%; border-radius: var(--radius); margin-top: 40px; }
    .body { margin-top: 48px; }
  `,
})
export class BlogPostPage {
  private readonly api = inject(PortfolioApi);
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);

  private readonly lang$ = injectLang$();
  protected readonly lang = toSignal(this.lang$, { initialValue: DEFAULT_LANG });

  protected readonly state = toSignal(
    combineLatest([this.lang$, this.route.paramMap.pipe(map((p) => p.get('slug') ?? ''))]).pipe(
      switchMap(([lang, slug]) =>
        this.api.blogPost(slug, lang).pipe(
          map((post): State => ({ status: 'ok', post })),
          catchError(() => of<State>({ status: 'not-found' })),
        ),
      ),
    ),
    { initialValue: { status: 'loading' } as State },
  );

  protected current(): BlogPost | null {
    const s = this.state();
    return s.status === 'ok' ? s.post : null;
  }

  constructor() {
    effect(() => {
      const post = this.current();
      if (!post) return;
      this.seo.set({
        lang: this.lang(),
        path: `/blog/${post.slug}`,
        type: 'article',
        title: `${post.title} — ${SITE_NAME}`,
        description: post.excerpt,
        image: post.coverImageUrl,
      });
    });
  }
}
