import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { DataUsaSearchItem } from '../../core/services/data-usa.service';

export const SearchActions = createActionGroup({
  source: 'Search',
  events: {
    'Typeahead Changed': props<{ term: string }>(),
    'Search Requested': props<{ term: string; offset?: number; limit?: number }>(),
    'Search Succeeded': props<{ term: string; results: DataUsaSearchItem[]; offset: number; total?: number }>(),
    'Search Failed': props<{ term: string; error: any }>(),
    'Open Item': props<{ itemId: string }>(),
    'Close Item': emptyProps(),
    'Promote Meaningful Query': props<{ term: string }>(),
    'Clear Suggestions': emptyProps(),
  }
});
