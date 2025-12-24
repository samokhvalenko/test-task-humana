import { ChangeDetectionStrategy, Component, ViewChild, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { AppState } from '../../store';
import { selectAllResults, selectLoading, selectTerm } from '../../store/search/search.selectors';
import { SearchActions } from '../../store/search/search.actions';
import { ImagesActions } from '../../store/images/images.actions';

@Component({
  selector: 'app-results-list',
  standalone: true,
  imports: [CommonModule, ScrollingModule, MatListModule, MatProgressBarModule, MatIconModule],
  templateUrl: './results-list.component.html',
  styleUrls: ['./results-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultsListComponent  {
  private readonly store = inject<Store<AppState>>(Store as any);

  @ViewChild('viewport') viewport!: CdkVirtualScrollViewport;

  results = this.store.selectSignal(selectAllResults);
  loading = this.store.selectSignal(selectLoading);
  term = this.store.selectSignal(selectTerm);

  private lastResultsLen = 0;
  private lastTerm = '';

  private snapshotEffect = effect(() => {
    const r = this.results() ?? [];
    const t = this.term() ?? '';
    this.lastResultsLen = r.length;
    this.lastTerm = t;
  });

  trackById = (_: number, item: any) => item.id;

  onScrolled(index: number) {
    const threshold = this.lastResultsLen - 10;
    if (index >= threshold && this.lastTerm) {
      this.store.dispatch(SearchActions.searchRequested({ term: this.lastTerm, offset: this.lastResultsLen, limit: 50 }));
    }
  }

  open(itemId: string, seed: string) {
    this.store.dispatch(SearchActions.openItem({ itemId }));
    this.store.dispatch(ImagesActions.fetchImage({ itemId, seed }));
  }
}
