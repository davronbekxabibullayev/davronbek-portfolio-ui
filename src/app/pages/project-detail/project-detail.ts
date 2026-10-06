import { Component, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { catchError, combineLatest, map, of, switchMap } from 'rxjs';
import { ProjectDetail } from '../../core/api/models';
import { PortfolioApi } from '../../core/api/portfolio-api';
import { DEFAULT_LANG, injectLang$ } from '../../core/i18n/languages';
import { SeoService } from '../../core/seo/seo.service';
import { MarkdownPipe } from '../../shared/pipes';
import { NotFound } from '../not-found/not-found';

type State = { status: 'loading' } | { status: 'ok'; project: ProjectDetail } | { status: 'not-found' };

@Component({
  selector: 'app-project-detail',
  imports: [RouterLink, TranslocoPipe, MarkdownPipe, NotFound],
  template: `
    @switch (state().status) {
      @case ('ok') {
        @let pr = project()!;
        <article class="wrap page">
          <a class="text-link back" [routerLink]="['/', lang()]" fragment="projects">← {{ 'project.back' | transloco }}</a>

          <header class="page__header">
            <div class="mono kicker">{{ pr.category }}</div>
            <h1 class="display page__title">{{ pr.title }}</h1>
            <p class="page__lead">{{ pr.summary }}</p>
            <div class="chips">
              @for (s of pr.stack; track s) {
                <span class="chip">{{ s }}</span>
              }
            </div>
            <div class="links">
              @if (pr.liveUrl) {
                <a class="btn btn--primary" [href]="pr.liveUrl" target="_blank" rel="noopener">{{ 'projects.visit' | transloco }} ↗</a>
              }
              @if (pr.repositoryUrl) {
                <a class="btn btn--ghost" [href]="pr.repositoryUrl" target="_blank" rel="noopener">{{ 'projects.repository' | transloco }} ↗</a>
              }
            </div>
          </header>

          @if (pr.coverImageUrl) {
            <img class="cover" [src]="pr.coverImageUrl" alt="" />
          }

          <div class="case">
            @if (pr.problem) {
              <section><h2 class="h3">{{ 'project.problem' | transloco }}</h2><div class="prose" [innerHTML]="pr.problem | markdown"></div></section>
            }
            @if (pr.role) {
              <section><h2 class="h3">{{ 'project.role' | transloco }}</h2><div class="prose" [innerHTML]="pr.role | markdown"></div></section>
            }
            @if (pr.solution) {
              <section><h2 class="h3">{{ 'project.solution' | transloco }}</h2><div class="prose" [innerHTML]="pr.solution | markdown"></div></section>
            }
            @if (pr.results) {
              <section><h2 class="h3">{{ 'project.results' | transloco }}</h2><div class="prose" [innerHTML]="pr.results | markdown"></div></section>
            }
          </div>
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
    .page { padding-top: 48px; padding-bottom: 96px; max-width: 880px; }
    .back { margin-bottom: 32px; }
    .kicker { font-size: 12px; text-transform: uppercase; color: var(--muted); margin-bottom: 12px; }
    .page__title { margin: 0; font-size: clamp(34px, 5vw, 52px); line-height: 1.08; color: var(--text-strong); }
    .page__lead { font-size: 19px; margin: 20px 0 24px; }
    .links { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 28px; }
    .cover { width: 100%; border-radius: var(--radius); margin-top: 48px; border: 1px solid var(--border); }
    .case { margin-top: 56px; display: flex; flex-direction: column; gap: 40px; }
    .h3 { font-family: var(--font-display); font-size: 24px; color: var(--text-strong); margin: 0 0 12px; }
  `,
})
export class ProjectDetailPage {
  private readonly api = inject(PortfolioApi);
  private readonly seo = inject(SeoService);
  private readonly route = inject(ActivatedRoute);

  private readonly lang$ = injectLang$();
  protected readonly lang = toSignal(this.lang$, { initialValue: DEFAULT_LANG });

  protected readonly state = toSignal(
    combineLatest([this.lang$, this.route.paramMap.pipe(map((p) => p.get('slug') ?? ''))]).pipe(
      switchMap(([lang, slug]) =>
        this.api.project(slug, lang).pipe(
          map((project): State => ({ status: 'ok', project })),
          catchError(() => of<State>({ status: 'not-found' })),
        ),
      ),
    ),
    { initialValue: { status: 'loading' } as State },
  );

  protected project(): ProjectDetail | null {
    const s = this.state();
    return s.status === 'ok' ? s.project : null;
  }

  constructor() {
    effect(() => {
      const pr = this.project();
      if (!pr) return;
      this.seo.set({
        lang: this.lang(),
        path: `/projects/${pr.slug}`,
        type: 'article',
        title: `${pr.title} — Davronbek Xabibullayev`,
        description: pr.summary,
        image: pr.coverImageUrl,
      });
    });
  }
}
