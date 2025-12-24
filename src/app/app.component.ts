import { Component, OnDestroy, OnInit, inject } from '@angular/core';
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
import { selectOpenedItemId, selectItemById } from './store/search/search.selectors';
import { ImageDialogComponent } from './components/image-dialog/image-dialog.component';
import { Subject, filter, switchMap, takeUntil } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatToolbarModule, MatIconModule, MatDialogModule, SearchBarComponent, ResultsListComponent],
  templateUrl: './app.component.html',
  styles: [``]
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly store = inject<Store<AppState>>(Store as any);
  private readonly dialog = inject(MatDialog);
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.store.select(selectOpenedItemId)
      .pipe(
        takeUntil(this.destroy$),
        filter((id): id is string => !!id),
        switchMap(id => this.store.select(selectItemById(id)).pipe(filter((item): item is any => !!item),
          // open dialog when both id and item are available
          ))
      )
      .subscribe(item => {
        const ref = this.dialog.open(ImageDialogComponent, {
          data: { itemId: item.id, seed: item.name },
          autoFocus: false,
          restoreFocus: false
        });
        ref.afterClosed().subscribe(() => this.store.dispatch(SearchActions.closeItem()));
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
