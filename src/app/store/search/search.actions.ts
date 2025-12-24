import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { DataUsaSearchItem } from '../../core/services/data-usa.service';

export const SearchActions = createActionGroup({
  source: 'Search',
  events: {
    // UI typed in search box
    'Typeahead Changed': props<{ term: string }>(),

    // Effect triggers network search
    'Search Requested': props<{ term: string; offset?: number; limit?: number }>(),
    'Search Succeeded': props<{ term: string; results: DataUsaSearchItem[]; offset: number; total?: number }>(),
    'Search Failed': props<{ term: string; error: any }>(),

    // Open dialog for item id
    'Open Item': props<{ itemId: string }>(),
    'Close Item': emptyProps(),

    // Suggestions
    'Promote Meaningful Query': props<{ term: string }>(),
    'Clear Suggestions': emptyProps(),
  }
});
