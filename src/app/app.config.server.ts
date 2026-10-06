import { FetchBackend, HttpBackend, HttpEvent, HttpRequest } from '@angular/common/http';
import { ApplicationConfig, Injectable, inject, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { Observable } from 'rxjs';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

/**
 * During SSR, send `/api/*` calls straight to the backend on the internal network
 * (e.g. API_INTERNAL_URL=http://api:8080 in Docker) instead of looping out through the public domain.
 *
 * Done at the backend level on purpose: interceptors and the HTTP transfer cache still see the
 * original `/api/...` URL, so the cache key matches the browser's and hydration doesn't refetch.
 * Without API_INTERNAL_URL (e.g. `ng serve`), Angular resolves `/api` against the request origin.
 */
@Injectable()
class InternalApiBackend implements HttpBackend {
  private readonly fetchBackend = inject(FetchBackend);
  private readonly internalUrl = process.env['API_INTERNAL_URL']?.replace(/\/+$/, '');

  handle(req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
    if (this.internalUrl) {
      const url = new URL(req.url, 'http://internal');
      if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
        req = req.clone({ url: `${this.internalUrl}${url.pathname}${url.search}` });
      }
    }
    return this.fetchBackend.handle(req);
  }
}

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    { provide: HttpBackend, useClass: InternalApiBackend },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
