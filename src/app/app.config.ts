import { ApplicationConfig, isDevMode, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { routes } from './app.routes';
import { httpCacheInterceptor } from './core/interceptors/http-cache.interceptor';
import { reducers } from './store';
import { SearchEffects } from './store/search/search.effects';
import { ImagesEffects } from './store/images/images.effects';
import { PolygonsEffects } from './store/polygons/polygons.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([httpCacheInterceptor])),
    provideAnimations(),
    provideStore(reducers),
    provideEffects([SearchEffects, ImagesEffects, PolygonsEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() })
  ]
};
