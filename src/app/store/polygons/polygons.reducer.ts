import { createFeature, createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { PolygonsActions, PointN } from './polygons.actions';

export const polygonsFeatureKey = 'polygons';

export interface PolygonItem {
  id: string; // itemId
  points: PointN[]; // normalized 0..1
  angleDeg: number; // rotation around center
}

export interface PolygonsState extends EntityState<PolygonItem> {}

const adapter = createEntityAdapter<PolygonItem>();
const initialState: PolygonsState = adapter.getInitialState();

function centerOf(points: PointN[]) {
  const n = points.length || 1;
  const sx = points.reduce((s, p) => s + p.x, 0);
  const sy = points.reduce((s, p) => s + p.y, 0);
  return { cx: sx / n, cy: sy / n };
}

function rotate(points: PointN[], angleDeg: number) {
  const { cx, cy } = centerOf(points);
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return points.map(p => ({
    x: cx + (p.x - cx) * cos - (p.y - cy) * sin,
    y: cy + (p.x - cx) * sin + (p.y - cy) * cos
  }));
}

export const reducer = createReducer(
  initialState,
  on(PolygonsActions.setPolygon, (state, { itemId, points }) => {
    const existing = state.entities[itemId];
    const angleDeg = existing?.angleDeg ?? 0;
    return adapter.upsertOne({ id: itemId, points, angleDeg }, state);
  }),
  on(PolygonsActions.clearPolygon, (state, { itemId }) => adapter.removeOne(itemId, state)),
  on(PolygonsActions.translatePolygon, (state, { itemId, dx, dy }) => {
    const item = state.entities[itemId];
    if (!item) return state;
    const moved = item.points.map(p => ({ x: p.x + dx, y: p.y + dy }));
    return adapter.upsertOne({ ...item, points: moved }, state);
  }),
  on(PolygonsActions.rotatePolygon, (state, { itemId, angleDeg }) => {
    const item = state.entities[itemId];
    if (!item) return state;
    const rotated = rotate(item.points, angleDeg - (item.angleDeg ?? 0));
    return adapter.upsertOne({ ...item, points: rotated, angleDeg }, state);
  })
);

export const polygonsFeature = createFeature({ name: polygonsFeatureKey, reducer });
export const { selectEntities: selectPolygonEntities } = polygonsFeature;
