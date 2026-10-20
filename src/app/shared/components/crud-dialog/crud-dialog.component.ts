import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Observable, of } from 'rxjs';
import { EntityAutocompleteComponent } from '../entity-autocomplete/entity-autocomplete.component';

export interface CrudDialogField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'select' | 'multiselect' | 'textarea' | 'checkbox' | 'date' | 'autocomplete';
  options?: { value: any; label: string }[];
  validators?: any[];
  placeholder?: string;
  disabled?: boolean;
  flex?: number;
  icon?: string;
  fullWidth?: boolean;
}

export interface CrudDialogConfig {
  title: string;
  subtitle?: string;
  fields: CrudDialogField[];
  data?: any;
  mode: 'create' | 'edit' | 'view';
  saveLabel?: string;
  cancelLabel?: string;
}

@Component({
  selector: 'app-crud-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatDialogModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatCheckboxModule,
    MatDatepickerModule, MatNativeDateModule, EntityAutocompleteComponent,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon *ngIf="config.mode === 'create'" style="vertical-align:middle;margin-right:8px;color:var(--primary-color);">add_circle</mat-icon>
      <mat-icon *ngIf="config.mode === 'edit'" style="vertical-align:middle;margin-right:8px;color: var(--warning-icon-on-tint);">edit</mat-icon>
      <mat-icon *ngIf="config.mode === 'view'" style="vertical-align:middle;margin-right:8px;color:var(--text-secondary);">visibility</mat-icon>
      {{ config.title }}
    </h2>
    <mat-dialog-content *ngIf="config.subtitle" style="color:var(--text-secondary);font-size:13px;margin-bottom:8px;">
      {{ config.subtitle }}
    </mat-dialog-content>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <div *ngFor="let field of config.fields" class="form-field" [class.span-2]="field.fullWidth || field.type === 'textarea' || field.type === 'checkbox'">
          <label class="field-label">{{ field.label }}</label>

          <ng-container *ngIf="field.type === 'text' || field.type === 'email' || field.type === 'number'">
            <div class="field-box" [class.is-disabled]="field.disabled">
              <mat-icon>{{ field.icon || fieldIcon(field.type) }}</mat-icon>
              <input [formControlName]="field.key" [placeholder]="field.placeholder || ''" [type]="field.type">
            </div>
          </ng-container>

          <ng-container *ngIf="field.type === 'date'">
            <div class="field-box" [class.is-disabled]="field.disabled">
              <mat-icon>{{ field.icon || fieldIcon(field.type) }}</mat-icon>
              <input [matDatepicker]="picker" [formControlName]="field.key" [placeholder]="field.placeholder || 'JJ/MM/AAAA'">
              <button mat-icon-button type="button" (click)="picker.open()">
                <mat-icon>event</mat-icon>
              </button>
              <mat-datepicker #picker></mat-datepicker>
            </div>
          </ng-container>

          <ng-container *ngIf="field.type === 'select'">
            <div class="field-box select-box" [class.is-disabled]="field.disabled">
              <mat-icon>{{ field.icon || fieldIcon(field.type) }}</mat-icon>
              <mat-select [formControlName]="field.key" panelClass="m3-dropdown-menu">
                <mat-option *ngFor="let opt of field.options" [value]="opt.value">{{ opt.label }}</mat-option>
              </mat-select>
            </div>
          </ng-container>

          <ng-container *ngIf="field.type === 'autocomplete'">
            <app-entity-autocomplete
              [formControlName]="field.key"
              [placeholder]="field.placeholder || 'Rechercher...'"
              [icon]="field.icon || 'search'"
              [searchFn]="autocompleteOptions(field)"
              [displayFn]="autocompleteDisplay"
            />
          </ng-container>

          <ng-container *ngIf="field.type === 'multiselect'">
            <div class="field-box select-box" [class.is-disabled]="field.disabled">
              <mat-icon>{{ field.icon || fieldIcon(field.type) }}</mat-icon>
              <mat-select [formControlName]="field.key" panelClass="m3-dropdown-menu" multiple>
                <mat-option *ngFor="let opt of field.options" [value]="opt.value">{{ opt.label }}</mat-option>
              </mat-select>
            </div>
          </ng-container>

          <ng-container *ngIf="field.type === 'textarea'">
            <div class="field-box textarea-box" [class.is-disabled]="field.disabled">
              <textarea [formControlName]="field.key" [placeholder]="field.placeholder || ''" rows="3"></textarea>
            </div>
          </ng-container>

          <ng-container *ngIf="field.type === 'checkbox'">
            <mat-checkbox [formControlName]="field.key" color="primary">{{ field.placeholder }}</mat-checkbox>
          </ng-container>

          <span class="field-error" *ngIf="form.get(field.key)?.hasError('required') && form.get(field.key)?.touched">{{ field.label }} est requis</span>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">{{ config.cancelLabel || 'Annuler' }}</button>
      <button *ngIf="config.mode !== 'view'" mat-raised-button color="primary" (click)="onSave()" [disabled]="form.invalid">
        <mat-icon>save</mat-icon>
        {{ config.saveLabel || 'Enregistrer' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host { display: block; }
    h2[mat-dialog-title] { font-family: 'Outfit', sans-serif; font-size: 20px; font-weight: 700; color: var(--text-primary); }
    .form-grid { padding-top: 4px; }
    mat-checkbox { margin-top: 8px; }
  `],
})
export class CrudDialogComponent {
  form: FormGroup;
  config: CrudDialogConfig;

  constructor(
    private dialogRef: MatDialogRef<CrudDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CrudDialogConfig,
  ) {
    this.config = data;
    const group: Record<string, FormControl> = {};
    for (const field of data.fields) {
      let value = data.data?.[field.key] ?? (field.type === 'multiselect' ? [] : '');
      if (field.type === 'date' && value) {
        try {
          value = new Date(value).toISOString().substring(0, 10);
        } catch {
          // Keep raw value if parsing fails
        }
      }
      const validators = field.validators || [];
      group[field.key] = new FormControl({ value, disabled: data.mode === 'view' }, validators);
    }
    this.form = new FormGroup(group);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.form.valid) {
      // `[type]="field.type"` est un binding de propriété : Angular ne le résout qu'au
      // moment du rendu, donc son sélecteur statique `input[type=number]` (celui de
      // `NumberValueAccessor`) ne matche jamais et les champs "number" restent des
      // chaînes de caractères dans le form. On les reconvertit ici avant de renvoyer
      // la valeur à l'appelant.
      const value = { ...this.form.value };
      for (const field of this.config.fields) {
        if (field.type === 'number' && value[field.key] !== null && value[field.key] !== '') {
          value[field.key] = Number(value[field.key]);
        }
      }
      this.dialogRef.close(value);
    }
  }

  fieldIcon(type: CrudDialogField['type']): string {
    switch (type) {
      case 'email': return 'alternate_email';
      case 'number': return 'tag';
      case 'date': return 'event';
      case 'select': return 'list';
      case 'multiselect': return 'checklist';
      case 'autocomplete': return 'search';
      default: return 'edit';
    }
  }

  /**
   * Champ `autocomplete` : recherche client-side dans `field.options` (déjà chargés en
   * mémoire, ex. les candidats éligibles à une invitation — jamais une vraie recherche
   * backend paginée comme `app-entity-autocomplete` le fait ailleurs), même composant
   * que `requete-form` pour l'UX de saisie.
   */
  autocompleteOptions(field: CrudDialogField): (term: string) => Observable<any[]> {
    return (term: string) => {
      const q = (term || '').toLowerCase().trim();
      const opts = field.options || [];
      const filtered = q ? opts.filter((o) => o.label.toLowerCase().includes(q)) : opts;
      return of(filtered.map((o) => ({ _id: o.value, label: o.label })));
    };
  }

  autocompleteDisplay = (item: any): string => item?.label ?? '';
}
