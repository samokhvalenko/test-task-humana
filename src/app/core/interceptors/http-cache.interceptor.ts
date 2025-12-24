import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, of, tap } from 'rxjs';

// Very small in-memory GET cache. Suitable for demo purposes only.
const cache = new Map<string, HttpEvent<unknown>>();

export function httpCacheInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  // Only cache GET requests
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
      // Cache the last event for this request
      cache.set(key, event);
    })
  );
}
