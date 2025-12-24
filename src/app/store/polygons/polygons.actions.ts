import { createActionGroup, props } from '@ngrx/store';

export interface PointN {
  x: number; // 0..1
  y: number; // 0..1
}

export const PolygonsActions = createActionGroup({
  source: 'Polygons',
  events: {
    'Set Polygon': props<{ itemId: string; points: PointN[] }>(),
    'Clear Polygon': props<{ itemId: string }>(),
    'Translate Polygon': props<{ itemId: string; dx: number; dy: number }>(), // deltas in normalized units
    'Rotate Polygon': props<{ itemId: string; angleDeg: number }>() // absolute angle
  }
});
