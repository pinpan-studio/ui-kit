import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MaterialModule } from '../../../shared/material.module';
import { ExFileBrowserComponent, FmScope } from './ex-file-browser.component';
import { ExFilesService, FmItem, FmKind, fmSize } from './ex-files.service';

export interface FilePickerOptions {
  title?: string;
  /** Sélection multiple (par défaut : oui). */
  multiple?: boolean;
  /** Types acceptés ; les autres sont grisés. */
  accept?: FmKind[] | null;
  /** Libellé du bouton de validation. */
  confirmLabel?: string;
}

/** Ouvre le sélecteur de fichiers ; émet la sélection validée, ou `undefined` si annulé. */
export function openFilePicker(dialog: MatDialog, options: FilePickerOptions = {}): Observable<FmItem[] | undefined> {
  return dialog.open<ExFilePickerDialog, FilePickerOptions, FmItem[]>(ExFilePickerDialog, {
    data: options, width: '1040px', maxWidth: 'calc(100vw - 32px)', height: '720px', maxHeight: 'calc(100vh - 32px)',
    panelClass: 'ex-file-picker-panel', autoFocus: false,
  }).afterClosed();
}

/**
 * Sélecteur de fichiers en modale : emplacements à gauche, navigateur (grille / liste, recherche, tri),
 * sélection multiple avec cases, import depuis l'ordinateur, récapitulatif et validation.
 */
@Component({
  selector: 'ex-file-picker-dialog',
  standalone: true,
  imports: [MaterialModule, ExFileBrowserComponent],
  template: `
    <div class="fp">
      <header class="fp-head">
        <h2>{{ data.title ?? 'Sélectionner des fichiers' }}</h2>
        @if (data.accept?.length) { <span class="hint">Types acceptés : {{ acceptLabel() }}</span> }
        <span class="spacer"></span>
        <button mat-icon-button (click)="ref.close()" aria-label="Fermer"><mat-icon>close</mat-icon></button>
      </header>

      <div class="fp-body">
        <nav class="places" aria-label="Emplacements">
          @for (p of places; track p.id) {
            <button type="button" [class.on]="scope() === p.id" (click)="scope.set(p.id); folder.set(null)"><mat-icon>{{ p.icon }}</mat-icon>{{ p.label }}</button>
          }
          <hr />
          <button type="button" (click)="input.click()"><mat-icon>computer</mat-icon>Depuis l’ordinateur</button>
          <input #input type="file" hidden [multiple]="data.multiple !== false" (change)="upload($any($event.target).files); input.value = ''" />
        </nav>
        <div class="browser">
          <ex-file-browser picker [multiple]="data.multiple !== false" [accept]="data.accept ?? null" [scope]="scope()" [(folder)]="folder" [(view)]="view"
            (selectionChange)="selection.set($event)" (opened)="confirmOne($event)" (dropped)="upload($event)" />
        </div>
      </div>

      <footer class="fp-foot">
        @if (selection().length) {
          <div class="picked">
            @for (f of selection().slice(0, 4); track f.id) {
              @if (f.kind === 'image' && f.url) { <img [src]="f.url" alt="" /> } @else { <img class="ic" [src]="'assets/icons-files/' + icon(f)" alt="" /> }
            }
            <span><strong>{{ selection().length }} fichier(s)</strong> · {{ total() }}</span>
            <button mat-button (click)="browser()?.clear()">Effacer</button>
          </div>
        } @else {
          <span class="none">{{ data.multiple === false ? 'Choisissez un fichier.' : 'Cliquez pour cocher, Maj + clic pour une plage, double-clic pour valider.' }}</span>
        }
        <span class="spacer"></span>
        <button mat-button (click)="ref.close()">Annuler</button>
        <button mat-flat-button color="primary" [disabled]="!selection().length" (click)="ref.close(selection())">
          {{ data.confirmLabel ?? 'Sélectionner' }}@if (selection().length > 1) { ({{ selection().length }}) }
        </button>
      </footer>
    </div>
  `,
  styles: [`
    @import 'styles/breakpoints';
    :host { display: block; height: 100%; }
    .fp { height: 100%; display: flex; flex-direction: column; background: var(--bg); color: var(--text-primary); font-family: var(--font-body); }
    .fp-head { display: flex; align-items: center; gap: 12px; padding: 12px 12px 12px 24px; border-bottom: 0;
      h2 { margin: 0; font-family: var(--font-heading) !important; font-size: var(--fs-h4) !important; font-weight: 600 !important; }
      .hint { font-size: var(--fs-caption); color: var(--text-muted); } }
    .spacer { flex: 1; }
    .fp-body { flex: 1; min-height: 0; display: grid; grid-template-columns: 200px minmax(0, 1fr);
      @include mobile { grid-template-columns: minmax(0, 1fr); } }
    .places { display: flex; flex-direction: column; gap: 2px; padding: 16px 12px; border-right: 0; overflow-y: auto;
      button { display: flex; align-items: center; gap: 10px; height: 36px; padding: 0 10px; border: 0; border-radius: 8px; background: none; cursor: pointer; text-align: left;
        font: 500 var(--fs-body-sm) var(--font-body); color: var(--text-secondary);
        mat-icon { font-size: 19px; width: 19px; height: 19px; }
        &:hover { background: var(--hover-bg); color: var(--text-primary); }
        &.on { background: var(--primary-color-light); color: var(--primary-color); font-weight: 600; } }
      hr { width: 100%; border: 0; border-top: 0; margin: 8px 0; }
      @include mobile { flex-direction: row; overflow-x: auto; padding: 8px 12px; border-right: 0; border-bottom: 0;
        button { flex: 0 0 auto; } hr { display: none; } } }
    .browser { min-height: 0; overflow-y: auto; padding: 16px 24px 24px; @include mobile { padding: 12px 16px; } }
    .fp-foot { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 12px 16px 12px 24px; border-top: 0; background: var(--card-bg); }
    .picked { display: flex; align-items: center; gap: 6px; font-size: var(--fs-body-sm); color: var(--text-secondary);
      img { width: 28px; height: 28px; border-radius: 4px; object-fit: cover; &.ic { object-fit: contain; } }
      span { margin-left: 6px; } strong { color: var(--text-primary); font-weight: 600; } }
    .none { font-size: var(--fs-caption); color: var(--text-muted); }
  `],
})
export class ExFilePickerDialog {
  readonly ref = inject(MatDialogRef<ExFilePickerDialog, FmItem[]>);
  readonly data = inject<FilePickerOptions>(MAT_DIALOG_DATA) ?? {};
  private store = inject(ExFilesService);
  readonly browser = viewChild(ExFileBrowserComponent);

  readonly places: { id: FmScope; label: string; icon: string }[] = [
    { id: 'drive', label: 'Mon disque', icon: 'cloud' },
    { id: 'recent', label: 'Récents', icon: 'schedule' },
    { id: 'starred', label: 'Favoris', icon: 'star_border' },
    { id: 'shared', label: 'Partagés', icon: 'group' },
  ];
  readonly scope = signal<FmScope>('drive');
  readonly folder = signal<string | null>(null);
  readonly view = signal<'card' | 'list'>('card');
  readonly selection = signal<FmItem[]>([]);

  readonly total = computed(() => fmSize(this.selection().reduce((s, f) => s + f.size, 0)));
  readonly acceptLabel = computed(() => (this.data.accept ?? []).map((k) => ({ image: 'images', video: 'vidéos', audio: 'audio', pdf: 'PDF', sheet: 'tableurs', slides: 'présentations', doc: 'documents', text: 'textes', archive: 'archives', folder: 'dossiers' })[k]).join(', '));

  icon(f: FmItem): string { return { image: 'jpg.png', video: 'mp4.png', audio: 'mp3.png', pdf: 'pdf.png', sheet: 'xls.png', slides: 'ppt.png', doc: 'txt.png', text: 'csv.png', archive: 'rar-file.png', folder: 'folder.png' }[f.kind]; }

  /** Double-clic : valide directement le fichier. */
  confirmOne(f: FmItem): void { this.ref.close([f]); }

  /** Import depuis l'ordinateur : ajoute au dossier courant puis présélectionne. */
  upload(files: FileList | File[]): void {
    const added = this.store.addFiles(files, this.scope() === 'drive' ? this.folder() : null);
    const ok = added.filter((f) => !this.data.accept || this.data.accept.includes(f.kind));
    if (!ok.length) return;
    this.scope.set('drive');
    this.ref.close(this.data.multiple === false ? ok.slice(0, 1) : ok);
  }
}
