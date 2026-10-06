import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Lang } from '../i18n/languages';
import {
  BlogPost,
  BlogPostListItem,
  ContactMessage,
  Experience,
  PagedResult,
  Profile,
  ProjectDetail,
  ProjectListItem,
  SkillGroup,
} from './models';

/**
 * Relative URLs on purpose: in the browser they hit the same origin (Nginx routes /api to the backend),
 * and during SSR Angular resolves them against the incoming request's origin.
 * Same URL on both sides = the HTTP transfer cache works and the browser doesn't refetch.
 */
const API = '/api';

@Injectable({ providedIn: 'root' })
export class PortfolioApi {
  private readonly http = inject(HttpClient);

  profile(lang: Lang): Observable<Profile> {
    return this.http.get<Profile>(`${API}/profile`, { params: { lang } });
  }

  skills(lang: Lang): Observable<SkillGroup[]> {
    return this.http.get<SkillGroup[]>(`${API}/skills`, { params: { lang } });
  }

  experiences(lang: Lang): Observable<Experience[]> {
    return this.http.get<Experience[]>(`${API}/experiences`, { params: { lang } });
  }

  projects(lang: Lang, featuredOnly = false): Observable<ProjectListItem[]> {
    let params = new HttpParams().set('lang', lang);
    if (featuredOnly) params = params.set('featured', true);
    return this.http.get<ProjectListItem[]>(`${API}/projects`, { params });
  }

  project(slug: string, lang: Lang): Observable<ProjectDetail> {
    return this.http.get<ProjectDetail>(`${API}/projects/${encodeURIComponent(slug)}`, { params: { lang } });
  }

  blogPosts(lang: Lang, page = 1, pageSize = 10, tag?: string): Observable<PagedResult<BlogPostListItem>> {
    let params = new HttpParams().set('lang', lang).set('page', page).set('pageSize', pageSize);
    if (tag) params = params.set('tag', tag);
    return this.http.get<PagedResult<BlogPostListItem>>(`${API}/blog`, { params });
  }

  blogPost(slug: string, lang: Lang): Observable<BlogPost> {
    return this.http.get<BlogPost>(`${API}/blog/${encodeURIComponent(slug)}`, { params: { lang } });
  }

  sendContactMessage(message: ContactMessage): Observable<void> {
    return this.http.post<void>(`${API}/contact`, message);
  }
}
