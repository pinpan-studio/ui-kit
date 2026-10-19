import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable, Subject, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';

/**
 * Champ autocomplete générique branché sur une recherche backend paginée (spec §6/§9/
 * §22 : client/véhicule/technicien/gestionnaire/contact — jamais une liste complète
 * chargée en mémoire, cf. §34 performance).
 *
 * Compatible `formControlName` (`ControlValueAccessor`). La valeur exposée au
 * `FormGroup` parent est l'id (`_id`) de l'entité sélectionnée ; l'affichage utilise
 * `displayFn` sur l'objet complet reçu de `searchFn`.
 *
 * Usage :
 * ```html
 * <app-entity-autocomplete formControlName="client_id" placeholder="Rechercher un client..."
 *   [searchFn]="searchClients" [displayFn]="clientLabel" icon="business" />
 * ```
 */
export function defaultEntityLabel(item: any): string {
  if (!item) return '';
  if (typeof item === 'string') return item;
  if (typeof item === 'number') return String(item);
  if (typeof item !== 'object') return String(item);
  return (
    item.libelle ||
    item.label ||
    item.designation ||
    item.nom_commercial ||
    item.raison_sociale ||
    (item.nom && item.prenom ? `${item.prenom} ${item.nom}` : item.nom) ||
    item.name ||
    item.code ||
    item.numero ||
    item.reference ||
    item.title ||
    item.titre ||
    (item._id ? String(item._id) : '') ||
    ''
  );
}

@Component({
  selector: 'app-entity-autocomplete',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatAutocompleteModule, MatIconModule, MatProgressSpinnerModule],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => EntityAutocompleteComponent),
    multi: true,
  }],
  template: `
    <div class="field-box select-box autocomplete-box" [class.is-disabled]="disabled" [class.has-value]="!!searchControl.value">
      <mat-icon class="input-icon">{{ icon }}</mat-icon>
      <input
        type="text"
        [formControl]="searchControl"
        [placeholder]="placeholder"
        [matAutocomplete]="auto"
        (blur)="onInputBlur()"
        autocomplete="off"
      />
      @if (loading) { <mat-spinner diameter="16"></mat-spinner> }
      @if (selectedItem || searchControl.value) {
        <button type="button" class="clear-btn" (click)="clear($event)" matTooltip="Effacer" tabindex="-1">
          <mat-icon>close</mat-icon>
        </button>
      }
      <mat-icon class="search-indicator-icon">arrow_drop_down</mat-icon>
    </div>
    <mat-autocomplete
      #auto="matAutocomplete"
      [displayWith]="displayWithFn"
      (optionSelected)="onOptionSelected($event.option.value)"
      class="app-autocomplete-panel"
    >
      @for (option of options; track (option._id || option.id || option)) {
        <mat-option [value]="option" class="app-autocomplete-option">
          <div class="option-content">
            <mat-icon class="opt-icon">{{ icon }}</mat-icon>
            <span class="opt-label">{{ formatItemLabel(option) }}</span>
          </div>
        </mat-option>
      }
      @if (!loading && searchControl.value && options.length === 0) {
        <mat-option disabled class="empty-option">
          <div class="empty-result">
            <mat-icon>search_off</mat-icon>
            <span>Aucun résultat pour « {{ searchControl.value }} »</span>
          </div>
        </mat-option>
      }
    </mat-autocomplete>
  `,
  styles: [`
    :host { display: block; width: 100%; }
    .field-box {
      position: relative;
      display: flex;
      align-items: center;
      min-height: 44px;
      background: var(--mat-sys-surface-container-high, var(--hover-bg, #f8fafc));
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: var(--r-m, 12px);
      padding: 0 12px;
      gap: 8px;
      transition: all 0.2s ease;

      &:focus-within {
        background: var(--card-bg, #ffffff);
        border-color: var(--mat-sys-primary, var(--primary-color, #4f46e5));
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--mat-sys-primary, var(--primary-color, #4f46e5)) 15%, transparent);
      }

      &.is-disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      input {
        flex: 1;
        min-width: 0;
        border: none;
        outline: none;
        background: transparent;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        color: var(--text-primary, #0f172a);

        &::placeholder { color: var(--text-muted, #94a3b8); }
      }

      .input-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: var(--mat-sys-on-surface-variant, var(--text-secondary, #64748b));
        flex-shrink: 0;
      }

      .search-indicator-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: var(--text-muted, #94a3b8);
        flex-shrink: 0;
      }
    }

    .clear-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      cursor: pointer;
      padding: 2px;
      border-radius: 50%;
      color: var(--text-muted, #94a3b8);
      flex-shrink: 0;
      transition: all 0.15s ease;

      &:hover {
        background: rgba(239, 68, 68, 0.12);
        color: #ef4444;
      }

      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }

    mat-spinner { margin: 0 4px; flex-shrink: 0; }

    .option-content {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;

      .opt-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: var(--text-secondary, #64748b);
        flex-shrink: 0;
      }

      .opt-label {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-family: 'Inter', sans-serif;
        font-size: 13px;
      }
    }

    .empty-result {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-muted, #94a3b8);
      font-size: 12px;
      font-style: italic;

      mat-icon { font-size: 16px; width: 16px; height: 16px; opacity: 0.7; }
    }
  `],
})
export class EntityAutocompleteComponent implements ControlValueAccessor {
  @Input() placeholder = 'Rechercher...';
  @Input() icon = 'search';
  @Input() searchFn: (term: string) => Observable<any[]> = () => of([]);
  @Input() displayFn: (item: any) => string = (item) => defaultEntityLabel(item);
  @Input() set initialItem(item: any) {
    if (item) {
      this.selectedItem = item;
      const label = this.formatItemLabel(item);
      this.searchControl.setValue(label, { emitEvent: false });
    }
  }
  @Output() itemSelected = new EventEmitter<any>();

  searchControl = new FormControl('');
  options: any[] = [];
  loading = false;
  selectedItem: any = null;
  disabled = false;

  private onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};
  private destroy$ = new Subject<void>();

  formatItemLabel = (item: any): string => {
    if (!item) return '';
    if (typeof item === 'string') return item;
    try {
      const res = this.displayFn ? this.displayFn(item) : '';
      if (res && res !== '[object Object]') return res;
    } catch {}
    return defaultEntityLabel(item);
  };

  displayWithFn = (item: any): string => {
    if (!item) return '';
    if (typeof item === 'string') return item;
    return this.formatItemLabel(item);
  };

  constructor() {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => { this.loading = true; }),
      switchMap((term) => {
        if (typeof term !== 'string' || !term.trim()) {
          this.loading = false;
          return of([]);
        }
        if (this.selectedItem && this.formatItemLabel(this.selectedItem) === term) {
          this.loading = false;
          return of([]);
        }
        return this.searchFn(term.trim()).pipe(catchError(() => of([])));
      }),
    ).subscribe((results) => {
      this.options = results || [];
      this.loading = false;
    });
  }

  onOptionSelected(item: any): void {
    this.selectedItem = item;
    const label = this.formatItemLabel(item);
    this.searchControl.setValue(label, { emitEvent: false });
    this.onChange(item?._id ?? item?.id ?? item);
    this.itemSelected.emit(item);
  }

  onInputBlur(): void {
    this.onTouched();
    if (this.selectedItem) {
      const label = this.formatItemLabel(this.selectedItem);
      if (this.searchControl.value !== label) {
        this.searchControl.setValue(label, { emitEvent: false });
      }
    } else if (!this.searchControl.value?.trim()) {
      this.clear(new Event('blur'));
    }
  }

  clear(event?: Event): void {
    if (event) event.stopPropagation();
    this.reset();
    this.itemSelected.emit(null);
  }

  /** Vide le champ sans émettre `itemSelected(null)` — utile après un ajout "multi" (ex. chips). */
  reset(): void {
    this.selectedItem = null;
    this.searchControl.setValue('', { emitEvent: false });
    this.options = [];
    this.onChange(null);
  }

  // --- ControlValueAccessor ---
  writeValue(value: any): void {
    if (value && typeof value === 'object') {
      this.selectedItem = value;
      const label = this.formatItemLabel(value);
      this.searchControl.setValue(label, { emitEvent: false });
    } else if (typeof value === 'string' && value.trim()) {
      const match = this.options.find((o) => (o._id || o.id || o.value) === value);
      if (match) {
        this.selectedItem = match;
        this.searchControl.setValue(this.formatItemLabel(match), { emitEvent: false });
      } else {
        this.searchFn(value).subscribe({
          next: (res) => {
            const found = res?.find((o) => (o._id || o.id || o.value) === value) || res?.[0];
            if (found) {
              this.selectedItem = found;
              this.searchControl.setValue(this.formatItemLabel(found), { emitEvent: false });
            } else {
              this.searchControl.setValue(value, { emitEvent: false });
            }
          },
          error: () => {
            this.searchControl.setValue(value, { emitEvent: false });
          },
        });
      }
    } else if (!value) {
      this.selectedItem = null;
      this.searchControl.setValue('', { emitEvent: false });
    }
  }

  registerOnChange(fn: (value: any) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    isDisabled ? this.searchControl.disable({ emitEvent: false }) : this.searchControl.enable({ emitEvent: false });
  }
}
