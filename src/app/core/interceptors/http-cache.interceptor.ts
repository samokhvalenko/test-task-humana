import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';

const cache = new Map<string, HttpEvent<unknown>>();

export function httpCacheInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  if (req.method !== 'GET') {
    return next(req);
  }

  const key = req.urlWithParams;
  const cached = cache.get(key);
  if (cached) {
    return of(cached);
  }

  return next(req).pipe(
    tap(event => {
      cache.set(key, event);
    })
  );
}
