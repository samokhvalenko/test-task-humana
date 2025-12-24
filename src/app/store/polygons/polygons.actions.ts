import { createActionGroup, props } from '@ngrx/store';

export interface PointN {
  x: number;
  y: number;
}

export const PolygonsActions = createActionGroup({
  source: 'Polygons',
  events: {
    'Set Polygon': props<{ itemId: string; points: PointN[] }>(),
    'Clear Polygon': props<{ itemId: string }>(),
    'Translate Polygon': props<{ itemId: string; dx: number; dy: number }>(),
    'Rotate Polygon': props<{ itemId: string; angleDeg: number }>()
  }
});
