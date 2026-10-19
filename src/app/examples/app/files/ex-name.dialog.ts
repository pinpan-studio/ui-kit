import { AfterViewInit, Component, ElementRef, inject, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MaterialModule } from '../../../shared/material.module';

interface NameData { title: string; label: string; value: string; confirm: string; icon: string; }

/** Demande un nom (nouveau dossier, renommage) ; émet le nom saisi ou `undefined`. */
export function askName(dialog: MatDialog, data: NameData): Observable<string | undefined> {
  return dialog.open<ExNameDialog, NameData, string>(ExNameDialog, { data, width: '420px', maxWidth: 'calc(100vw - 32px)' }).afterClosed();
}

/** Saisie d'un nom sur une ligne : nom présélectionné hors extension, Entrée pour valider. */
@Component({
  selector: 'ex-name-dialog',
  standalone: true,
  imports: [FormsModule, MaterialModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <form (ngSubmit)="ok()">
      <mat-dialog-content>
        <div class="form-field">
          <label class="field-label" for="ex-name">{{ data.label }}</label>
          <div class="field-box"><mat-icon>{{ data.icon }}</mat-icon><input #field id="ex-name" name="name" [(ngModel)]="value" autocomplete="off" /></div>
        </div>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="ref.close()">Annuler</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="!value.trim()">{{ data.confirm }}</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`h2[mat-dialog-title] { font-family: var(--font-heading); font-weight: 600; font-size: var(--fs-h4); }`],
})
export class ExNameDialog implements AfterViewInit {
  readonly ref = inject(MatDialogRef<ExNameDialog, string>);
  readonly data = inject<NameData>(MAT_DIALOG_DATA);
  private field = viewChild<ElementRef<HTMLInputElement>>('field');
  value = this.data.value;

  ngAfterViewInit(): void {
    setTimeout(() => {
      const el = this.field()?.nativeElement;
      if (!el) return;
      el.focus();
      const dot = this.value.lastIndexOf('.');
      el.setSelectionRange(0, dot > 0 ? dot : this.value.length);
    });
  }

  ok(): void { if (this.value.trim()) this.ref.close(this.value.trim()); }
}
