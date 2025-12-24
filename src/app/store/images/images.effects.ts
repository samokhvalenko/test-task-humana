import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { RandomUserService } from '../../core/services/random-user.service';
import { ImagesActions } from './images.actions';
import { catchError, map, of, switchMap } from 'rxjs';

@Injectable()
export class ImagesEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(RandomUserService);

  fetch$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ImagesActions.fetchImage),
      switchMap(({ itemId, seed }) =>
        this.api.fetchImageBySeed(seed).pipe(
          map(pic => ImagesActions.fetchSuccess({ itemId, large: pic.large, medium: pic.medium, thumbnail: pic.thumbnail })),
          catchError(error => of(ImagesActions.fetchFailure({ itemId, error })))
        )
      )
    )
  );
}
