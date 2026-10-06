import { Component, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { catchError, combineLatest, map, of, switchMap } from 'rxjs';
import { PortfolioApi } from '../../core/api/portfolio-api';
import { DEFAULT_LANG, injectLang$ } from '../../core/i18n/languages';
import { SeoService } from '../../core/seo/seo.service';
import { SITE_NAME } from '../../core/site.config';
import { LongDatePipe } from '../../shared/pipes';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-blog-list',
  imports: [RouterLink, TranslocoPipe, LongDatePipe],
  template: `
    <div class="wrap page">
      <p class="label">{{ 'blog.label' | transloco }}</p>
      <h1 class="h2">{{ 'blog.title' | transloco }}</h1>

      @if (result(); as r) {
        @if (r.items.length) {
          <ul class="posts">
            @for (post of r.items; track post.slug) {
              <li class="card post">
                <div class="mono meta">
                  {{ post.publishedAt | longDate: lang() }} · {{ 'blog.minRead' | transloco: { n: post.readingMinutes } }}
                </div>
                <h2 class="display post__title">
                  <a [routerLink]="['/', lang(), 'blog', post.slug]">{{ post.title }}</a>
                </h2>
                <p>{{ post.excerpt }}</p>
                <div class="chips">
                  @for (t of post.tags; track t) {
                    <a class="chip" [routerLink]="[]" [queryParams]="{ tag: t, page: null }">#{{ t }}</a>
                  }
                </div>
              </li>
            }
          </ul>

          @if (r.totalPages > 1) {
            <nav class="pager" aria-label="Pagination">
              @if (r.page > 1) {
                <a class="btn btn--ghost" [routerLink]="[]" [queryParams]="{ page: r.page - 1 }" queryParamsHandling="merge">← {{ 'blog.prev' | transloco }}</a>
              }
              <span class="mono">{{ r.page }} / {{ r.totalPages }}</span>
              @if (r.page < r.totalPages) {
                <a class="btn btn--ghost" [routerLink]="[]" [queryParams]="{ page: r.page + 1 }" queryParamsHandling="merge">{{ 'blog.next' | transloco }} →</a>
              }
            </nav>
          }
        } @else {
          <p class="muted">{{ 'blog.empty' | transloco }}</p>
        }
      }
    </div>
  `,
  styles: `
    .page { padding-top: 64px; padding-bottom: 96px; max-width: 880px; }
    .posts { list-style: none; margin: 40px 0 0; padding: 0; display: flex; flex-direction: column; gap: 16px; }
    .meta { font-size: 13px; color: var(--muted); }
    .post__title { margin: 8px 0; font-size: 24px; }
    .post__title a { color: var(--text-strong); }
    .post__title a:hover { color: var(--accent); }
    .post p { margin: 0 0 16px; }
    .pager { display: flex; align-items: center; justify-content: center; gap: 20px; margin-top: 40px; }
    .muted { color: var(--muted); margin-top: 32px; }
  `,
})
export class BlogListPage {
  private readonly api = inject(PortfolioApi);
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);
  private readonly transloco = inject(TranslocoService);

  private readonly lang$ = injectLang$();
  protected readonly lang = toSignal(this.lang$, { initialValue: DEFAULT_LANG });

  protected readonly result = toSignal(
    combineLatest([this.lang$, this.route.queryParamMap]).pipe(
      switchMap(([lang, q]) =>
        this.api
          .blogPosts(lang, Number(q.get('page')) || 1, PAGE_SIZE, q.get('tag') ?? undefined)
          .pipe(catchError(() => of(null))),
      ),
      map((r) => r ?? { items: [], page: 1, pageSize: PAGE_SIZE, totalCount: 0, totalPages: 0 }),
    ),
  );

  constructor() {
    effect(() => {
      const lang = this.lang();
      this.seo.set({
        lang,
        path: '/blog',
        title: this.transloco.translate('meta.blogTitle', { name: SITE_NAME }, lang),
        description: this.transloco.translate('meta.blogDescription', {}, lang),
      });
    });
  }
}
