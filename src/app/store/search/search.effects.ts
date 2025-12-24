import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { SearchActions } from './search.actions';
import { DataUsaService } from '../../core/services/data-usa.service';
import { catchError, debounceTime, distinctUntilChanged, filter, map, of, switchMap, withLatestFrom } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '..';
import { selectResults } from './search.reducer';

@Injectable()
export class SearchEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(DataUsaService);
  private readonly store = inject<Store<AppState>>(Store as any);

  typeahead$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SearchActions.typeaheadChanged),
      map(a => a.term.trim()),
      debounceTime(300),
      distinctUntilChanged(),
      filter(term => term.length >= 2),
      map(term => SearchActions.searchRequested({ term, offset: 0, limit: 50 }))
    )
  );

  // execute search request, cancel on new term via switchMap
  search$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SearchActions.searchRequested),
      map(a => ({ term: a.term.trim(), offset: a.offset ?? 0, limit: a.limit ?? 50 })),
      switchMap(({ term, offset, limit }) =>
        this.api.search(term, offset, limit).pipe(
          map(results => SearchActions.searchSucceeded({ term, results, offset, total: results.length })),
          catchError(error => of(SearchActions.searchFailed({ term, error })))
        )
      )
    )
  );
}
