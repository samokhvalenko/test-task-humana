import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { AppState } from '../../store';
import { SearchActions } from '../../store/search/search.actions';
import { selectSuggestions, selectWordSuggestions } from '../../store/search/search.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule, MatChipsModule, MatIconModule],
  templateUrl: './search-bar.component.html',
  styles: [`
    .search-container { display: flex; flex-direction: column; gap: 8px; }
    .search-field { width: 100%; }
    .suggestions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .label { font-size: 12px; color: rgba(0,0,0,0.6); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchBarComponent {
  private readonly store = inject<Store<AppState>>(Store as any);

  ctrl = new FormControl('');

  suggestions = this.store.selectSignal(selectSuggestions);
  wordSuggestions = this.store.selectSignal(selectWordSuggestions);

  private termSig = toSignal(this.ctrl.valueChanges.pipe(startWith('')), { initialValue: '' });

  filteredSuggestions = computed(() => {
    const t = String(this.termSig() ?? '').toLowerCase();
    const words = this.wordSuggestions() ?? [];
    return words.filter(w => w.toLowerCase().includes(t)).slice(0, 10);
  });

  private dispatchEffect = effect(() => {
    const v = String(this.termSig() ?? '');
    this.store.dispatch(SearchActions.typeaheadChanged({ term: v }));
  });

  onOptionSelected(value: string) {
    this.setTerm(value);
  }

  setTerm(value: string) {
    this.ctrl.setValue(value, { emitEvent: false });
    this.store.dispatch(SearchActions.typeaheadChanged({ term: value }));
  }
}
