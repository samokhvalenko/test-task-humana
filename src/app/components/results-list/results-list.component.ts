import { ChangeDetectionStrategy, Component, ViewChild, computed, effect, inject } from '@angular/core';
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
  styles: [`
    .results-container { position: relative; height: calc(100vh - 200px); }
    .viewport { height: 100%; width: 100%; border-radius: 8px; border: 1px solid rgba(0,0,0,0.06); background: white; }
    .row { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-bottom: 1px solid rgba(0,0,0,0.04); cursor: pointer; }
    .row:hover { background: rgba(0,0,0,0.02); }
    .avatar { width: 40px; height: 40px; display: grid; place-items: center; background: #f3f5f7; border-radius: 8px; color: #607d8b; }
    .meta { overflow: hidden; }
    .title { font-weight: 600; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }
    .subtitle { font-size: 12px; color: rgba(0,0,0,0.6); }
  `],
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
