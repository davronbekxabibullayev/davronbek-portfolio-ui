import { CanMatchFn } from '@angular/router';
import { isLang } from './languages';

/** Only lets `/:lang/...` routes match for supported languages. */
export const langMatchGuard: CanMatchFn = (_route, segments) => isLang(segments[0]?.path);
