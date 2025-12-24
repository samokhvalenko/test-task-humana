import { ActionReducerMap } from '@ngrx/store';
import { searchFeatureKey, reducer as searchReducer, SearchState } from './search/search.reducer';
import { imagesFeatureKey, reducer as imagesReducer, ImagesState } from './images/images.reducer';
import { polygonsFeatureKey, reducer as polygonsReducer, PolygonsState } from './polygons/polygons.reducer';

export interface AppState {
  [searchFeatureKey]: SearchState;
  [imagesFeatureKey]: ImagesState;
  [polygonsFeatureKey]: PolygonsState;
}

export const reducers: ActionReducerMap<AppState> = {
  [searchFeatureKey]: searchReducer,
  [imagesFeatureKey]: imagesReducer,
  [polygonsFeatureKey]: polygonsReducer
};
