import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const ImagesActions = createActionGroup({
  source: 'Images',
  events: {
    'Fetch Image': props<{ itemId: string; seed: string }>(),
    'Fetch Success': props<{ itemId: string; large: string; medium: string; thumbnail: string }>(),
    'Fetch Failure': props<{ itemId: string; error: any }>(),
    'Clear': emptyProps()
  }
});
