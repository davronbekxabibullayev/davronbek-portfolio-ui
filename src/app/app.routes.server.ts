import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Content comes from the API, so pages render per request on the server (SEO-friendly, always fresh).
 * The API's output cache keeps this cheap.
 */
export const serverRoutes: ServerRoute[] = [{ path: '**', renderMode: RenderMode.Server }];
