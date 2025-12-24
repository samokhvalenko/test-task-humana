import { Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects';

// Currently no side effects for polygons; kept for symmetry and future use.
@Injectable()
export class PolygonsEffects {
  constructor(_actions: Actions) {}
}
