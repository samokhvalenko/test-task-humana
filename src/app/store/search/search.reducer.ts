import { createFeature, createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { DataUsaSearchItem } from '../../core/services/data-usa.service';
import { SearchActions } from './search.actions';

export const searchFeatureKey = 'search';

export interface ResultsState extends EntityState<DataUsaSearchItem> {
  loading: boolean;
  error?: any;
  term: string;
  offset: number;
  total: number | null;
  openedItemId: string | null;
}

export interface SearchState {
  results: ResultsState;
  suggestions: string[]; // meaningful queries
}

export const adapter = createEntityAdapter<DataUsaSearchItem>({
  selectId: (item) => item.id
});

const initialResults: ResultsState = adapter.getInitialState({
  loading: false,
  error: undefined,
  term: '',
  offset: 0,
  total: null,
  openedItemId: null
});

const initialState: SearchState = {
  results: initialResults,
  suggestions: []
};

export const reducer = createReducer(
  initialState,
  on(SearchActions.typeaheadChanged, (state, { term }) => ({
    ...state,
    results: { ...state.results, term }
  })),
  on(SearchActions.searchRequested, (state, { term, offset }) => ({
    ...state,
    results: { ...state.results, term, loading: true, error: undefined, offset: offset ?? 0 }
  })),
  on(SearchActions.searchSucceeded, (state, { term, results, offset, total }) => {
    const merged = offset > 0 ? adapter.addMany(results, state.results) : adapter.setAll(results, state.results);
    return {
      ...state,
      results: { ...merged, loading: false, error: undefined, term, offset, total: total ?? results.length },
      suggestions: results.length > 0 && !state.suggestions.includes(term)
        ? [term, ...state.suggestions].slice(0, 20)
        : state.suggestions
    };
  }),
  on(SearchActions.searchFailed, (state, { term, error }) => ({
    ...state,
    results: { ...state.results, loading: false, error, term }
  })),
  on(SearchActions.openItem, (state, { itemId }) => ({
    ...state,
    results: { ...state.results, openedItemId: itemId }
  })),
  on(SearchActions.closeItem, (state) => ({
    ...state,
    results: { ...state.results, openedItemId: null }
  })),
  on(SearchActions.promoteMeaningfulQuery, (state, { term }) => ({
    ...state,
    suggestions: state.suggestions.includes(term) ? state.suggestions : [term, ...state.suggestions].slice(0, 20)
  })),
  on(SearchActions.clearSuggestions, (state) => ({ ...state, suggestions: [] }))
);

export const searchFeature = createFeature({
  name: searchFeatureKey,
  reducer
});

export const { selectSuggestions, selectResults } = searchFeature;
