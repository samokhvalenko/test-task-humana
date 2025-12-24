import { createSelector } from '@ngrx/store';
import { adapter, searchFeature } from './search.reducer';

export const selectResultsState = createSelector(searchFeature.selectResults, s => s);

const entitySelectors = adapter.getSelectors();
export const selectAllResults = createSelector(searchFeature.selectResults, (s) => entitySelectors.selectAll(s));
export const selectResultsEntities = createSelector(searchFeature.selectResults, s => s.entities);
export const selectLoading = createSelector(searchFeature.selectResults, s => s.loading);
export const selectTerm = createSelector(searchFeature.selectResults, s => s.term);
export const selectOpenedItemId = createSelector(searchFeature.selectResults, s => s.openedItemId);
export const selectSuggestions = searchFeature.selectSuggestions;

export const selectItemById = (id: string) => createSelector(selectResultsEntities, (ents) => ents[id]);

export const selectWordSuggestions = createSelector(selectSuggestions, (queries) => {
  const words = new Set<string>();
  for (const q of queries) {
    q.split(/\s+/).filter(Boolean).forEach(w => words.add(w));
  }
  return Array.from(words);
});
