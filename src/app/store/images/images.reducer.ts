import { createFeature, createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { ImagesActions } from './images.actions';

export const imagesFeatureKey = 'images';

export interface ImageItem {
  id: string; // itemId
  large: string;
  medium: string;
  thumbnail: string;
  error?: any;
}

export interface ImagesState extends EntityState<ImageItem> {}

export const adapter = createEntityAdapter<ImageItem>();

const initialState: ImagesState = adapter.getInitialState();

export const reducer = createReducer(
  initialState,
  on(ImagesActions.fetchSuccess, (state, { itemId, large, medium, thumbnail }) =>
    adapter.upsertOne({ id: itemId, large, medium, thumbnail }, state)
  ),
  on(ImagesActions.fetchFailure, (state, { itemId, error }) =>
    adapter.upsertOne({ id: itemId, large: '', medium: '', thumbnail: '', error }, state)
  )
);

export const imagesFeature = createFeature({ name: imagesFeatureKey, reducer });
export const { selectEntities: selectImageEntities } = imagesFeature;
