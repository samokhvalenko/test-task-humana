import { Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { AppState } from './store';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { ResultsListComponent } from './components/results-list/results-list.component';
import { SearchActions } from './store/search/search.actions';
import { selectOpenedItemId, selectResultsEntities } from './store/search/search.selectors';
import { ImageDialogComponent } from './components/image-dialog/image-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatToolbarModule, MatIconModule, MatDialogModule, SearchBarComponent, ResultsListComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent  {
  private readonly store = inject<Store<AppState>>(Store as any);
  private readonly dialog = inject(MatDialog);

  openedId = this.store.selectSignal(selectOpenedItemId);
  items = this.store.selectSignal(selectResultsEntities);

  private ref: any = null;

  private openEffect = effect(() => {
    const id = this.openedId();
    const ents = this.items();
    if (!id) return;
    const item = ents?.[id];
    if (!item) return;
    if (this.ref) return;
    this.ref = this.dialog.open(ImageDialogComponent, {
      data: { itemId: item.id, seed: item.name },
      autoFocus: false,
      restoreFocus: false
    });
    this.ref.afterClosed().subscribe(() => {
      this.ref = null;
      this.store.dispatch(SearchActions.closeItem());
    });
  });
}
