import { Component, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../shared/material.module';
import { AudioPlayerComponent, FileViewerService, VideoPlayerComponent } from '../../shared/components/media';
import { KbdComponent } from '../../shared/components/interaction';
import { ExAppShellComponent } from './ex-app-shell.component';
import { ExFilesService, FM_KINDS, FmItem, fmSize } from './files/ex-files.service';
import { askName } from './files/ex-name.dialog';

interface Column { parent: string | null; items: FmItem[]; selected: string | null; }

/**
 * /examples/app/files/columns — autre disposition du gestionnaire : explorateur en colonnes (type Finder).
 * Une colonne par niveau de dossier, panneau d'aperçu riche (image, vidéo, audio, PDF, texte), navigation
 * au clavier (↑ ↓ ← →, Entrée, Espace = aperçu plein écran), barre d'état ; mêmes données que la vue grille.
 */
@Component({
  selector: 'app-files-columns-example',
  standalone: true,
  imports: [DatePipe, RouterLink, MaterialModule, AudioPlayerComponent, VideoPlayerComponent, KbdComponent, ExAppShellComponent],
  template: `
    <ex-app-shell title="Fichiers" crumb="Ressources" [flush]="true">
      <div class="wrap">
        <div class="page-head">
          <div class="titles">
            <span class="eyebrow">Ressources</span>
            <h1>Fichiers</h1>
            <p>Explorateur en colonnes · {{ size(store.used()) }} utilisés sur {{ size(store.quota) }}</p>
          </div>
          <div class="actions">
            <div class="layout-switch" role="group" aria-label="Disposition">
              <a routerLink="/examples/app/files"><mat-icon>grid_view</mat-icon>Grille</a>
              <a class="on" aria-current="page"><mat-icon>view_week</mat-icon>Colonnes</a>
            </div>
            <button mat-stroked-button (click)="newFolder()"><mat-icon>create_new_folder</mat-icon>Dossier</button>
            <button mat-flat-button color="primary" (click)="input.click()"><mat-icon>upload</mat-icon>Importer</button>
            <input #input type="file" multiple hidden (change)="upload($any($event.target).files); input.value = ''" />
          </div>
        </div>

        <section class="card explorer" tabindex="0" (keydown)="onKey($event)" #explorer aria-label="Explorateur de fichiers"
          (dragover)="$event.preventDefault()" (drop)="onDrop($event)">
          <div class="bar">
            <nav class="path" aria-label="Emplacement">
              <button type="button" (click)="selectAt(-1, null)"><mat-icon>cloud</mat-icon>Mon disque</button>
              @for (p of pathItems(); track p.id) { <mat-icon class="sep">chevron_right</mat-icon><button type="button" (click)="reveal(p)">{{ p.name }}</button> }
            </nav>
            <span class="spacer"></span>
            <label class="searchbox"><mat-icon>search</mat-icon><input type="search" placeholder="Rechercher" [value]="query()" (input)="query.set($any($event.target).value)" /></label>
          </div>

          <div class="body">
            <div class="columns" #cols>
              @if (query()) {
                <div class="col results">
                  <div class="col-head">{{ results().length }} résultat(s)</div>
                  @for (f of results(); track f.id) {
                    <button type="button" class="row" (click)="reveal(f)">
                      @if (f.kind === 'folder') { <mat-icon class="fi" [style.color]="f.color">folder</mat-icon> } @else { <img class="ic" [src]="icon(f)" alt="" /> }
                      <span class="nm">{{ f.name }}<small>{{ where(f) }}</small></span>
                    </button>
                  } @empty { <p class="none">Aucun fichier ne correspond.</p> }
                </div>
              } @else {
                @for (c of columns(); track c.parent; let ci = $index) {
                  <div class="col" [class.active]="ci === focusCol()">
                    @for (f of c.items; track f.id) {
                      <button type="button" class="row" [class.sel]="c.selected === f.id" [class.focus]="c.selected === f.id && ci === focusCol()"
                        (click)="selectAt(ci, f.id)" (dblclick)="f.kind === 'folder' ? null : preview(f)">
                        @if (f.kind === 'folder') { <mat-icon class="fi" [style.color]="f.color">folder</mat-icon> }
                        @else if (f.kind === 'image' && f.url) { <img class="th" [src]="f.url" alt="" /> }
                        @else { <img class="ic" [src]="icon(f)" alt="" /> }
                        <span class="nm">{{ f.name }}</span>
                        @if (f.starred) { <mat-icon class="star">star</mat-icon> }
                        @if (f.kind === 'folder') { <mat-icon class="chev">chevron_right</mat-icon> }
                      </button>
                    } @empty { <p class="none">Dossier vide</p> }
                  </div>
                }
              }
            </div>

            <aside class="preview" aria-label="Aperçu">
              @if (file(); as f) {
                <div class="pv-media">
                  @switch (f.kind) {
                    @case ('image') { <img [src]="f.url" [alt]="f.name" (click)="preview(f)" /> }
                    @case ('video') { <app-video-player [src]="f.url ?? null" /> }
                    @case ('audio') { <div class="pv-audio"><app-audio-player [tracks]="[{ title: f.name, src: f.url ?? '', blob: f.blob }]" /></div> }
                    @case ('text') { <pre class="pv-text">{{ text() }}</pre> }
                    @default {
                      <div class="pv-icon" (click)="f.url && preview(f)"><img [src]="icon(f)" alt="" />@if (f.kind === 'pdf') { <span>Cliquez pour ouvrir le PDF</span> }</div>
                    }
                  }
                </div>
                <h2 [title]="f.name">{{ f.name }}</h2>
                <span class="pv-kind">{{ kinds[f.kind].label }} · {{ size(f.size) }}</span>
                <dl>
                  <dt>Emplacement</dt><dd>{{ where(f) }}</dd>
                  <dt>Propriétaire</dt><dd>{{ f.owner }}</dd>
                  <dt>Modifié</dt><dd>{{ f.modified | date: 'd MMMM yyyy, HH:mm' }}</dd>
                  @if (f.mime) { <dt>Format</dt><dd class="mono">{{ f.mime }}</dd> }
                  <dt>Partage</dt><dd>{{ f.shared ? 'Partagé (4 personnes)' : 'Privé' }}</dd>
                </dl>
                <div class="pv-actions">
                  <button mat-flat-button color="primary" (click)="preview(f)" [disabled]="!f.url"><mat-icon>open_in_full</mat-icon>Ouvrir</button>
                  <button mat-stroked-button (click)="toggleStar(f)"><mat-icon>{{ f.starred ? 'star' : 'star_border' }}</mat-icon></button>
                  <button mat-stroked-button (click)="rename(f)" aria-label="Renommer"><mat-icon>drive_file_rename_outline</mat-icon></button>
                </div>
              } @else if (folder(); as d) {
                <div class="pv-folder"><mat-icon [style.color]="d.color">folder</mat-icon></div>
                <h2>{{ d.name }}</h2>
                <span class="pv-kind">Dossier · {{ stats(d).count }} élément(s) · {{ size(stats(d).size) }}</span>
                <dl><dt>Propriétaire</dt><dd>{{ d.owner }}</dd><dt>Modifié</dt><dd>{{ d.modified | date: 'd MMMM yyyy' }}</dd><dt>Partage</dt><dd>{{ d.shared ? 'Partagé' : 'Privé' }}</dd></dl>
              } @else {
                <div class="pv-empty"><mat-icon>preview</mat-icon><p>Sélectionnez un fichier pour l’aperçu.</p>
                  <small><app-kbd keys="up" /> <app-kbd keys="down" /> parcourir · <app-kbd keys="right" /> ouvrir · <app-kbd keys="space" /> plein écran</small></div>
              }
            </aside>
          </div>

          <footer class="status">
            <span>{{ statusText() }}</span>
            <span class="spacer"></span>
            <span class="quota"><i [style.width.%]="pct()"></i></span><span>{{ pct() }} % utilisés</span>
          </footer>
        </section>
      </div>
    </ex-app-shell>
  `,
  styleUrls: ['./files-columns-example.component.scss'],
})
export class FilesColumnsExampleComponent {
  readonly store = inject(ExFilesService);
  private viewer = inject(FileViewerService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);
  private colsEl = viewChild<ElementRef<HTMLElement>>('cols');
  private explorerEl = viewChild<ElementRef<HTMLElement>>('explorer');
  readonly kinds = FM_KINDS;
  readonly size = fmSize;

  /** Chemin sélectionné : un identifiant par colonne (le dernier peut être un fichier). */
  readonly trail = signal<string[]>(['docs', 'contracts']);
  readonly focusCol = signal(1);
  readonly query = signal('');
  readonly text = signal('');

  readonly columns = computed<Column[]>(() => {
    const t = this.trail();
    const cols: Column[] = [{ parent: null, items: this.sorted(this.store.children(null)), selected: t[0] ?? null }];
    t.forEach((id, i) => {
      const it = this.store.get(id);
      if (it?.kind === 'folder') cols.push({ parent: id, items: this.sorted(this.store.children(id)), selected: t[i + 1] ?? null });
    });
    return cols;
  });
  readonly selected = computed(() => this.store.get(this.trail().at(-1) ?? null) ?? null);
  readonly file = computed(() => (this.selected()?.kind !== 'folder' ? this.selected() : null));
  readonly folder = computed(() => (this.selected()?.kind === 'folder' ? this.selected() : null));
  readonly pathItems = computed(() => this.trail().map((id) => this.store.get(id)).filter((x): x is FmItem => !!x));
  readonly results = computed(() => {
    const q = this.query().trim().toLowerCase();
    return q ? this.store.items().filter((i) => i.name.toLowerCase().includes(q)).slice(0, 40) : [];
  });
  readonly pct = computed(() => Math.round((this.store.used() / this.store.quota) * 100));
  readonly statusText = computed(() => {
    const c = this.columns().at(-1)!;
    const s = this.selected();
    return `${c.items.length} élément(s)` + (s ? ` · « ${s.name} » sélectionné${s.kind === 'folder' ? '' : ' · ' + fmSize(s.size)}` : '');
  });

  constructor() {
    this.store.ensure();
    // Faire défiler jusqu'à la dernière colonne ; lire le contenu texte pour l'aperçu.
    effect(() => {
      this.columns();
      queueMicrotask(() => { const el = this.colsEl()?.nativeElement; if (el) el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' }); });
    });
    effect(() => {
      const f = this.file();
      this.text.set('');
      if (f?.kind === 'text' && f.blob) void f.blob.text().then((t) => this.text.set(t));
    });
  }

  icon(f: FmItem): string { return 'assets/icons-files/' + FM_KINDS[f.kind].img; }
  stats(f: FmItem) { return this.store.folderStats(f.id); }
  where(f: FmItem): string { return ['Mon disque', ...this.store.path(f.parent).map((p) => p.name)].join(' / '); }

  /** Sélectionne `id` dans la colonne `ci` (−1 = racine, vide le chemin). */
  selectAt(ci: number, id: string | null): void {
    this.trail.update((t) => (id ? [...t.slice(0, ci), id] : t.slice(0, Math.max(0, ci))));
    this.focusCol.set(Math.max(0, ci));
    this.explorerEl()?.nativeElement.focus({ preventScroll: true });
  }
  /** Affiche un élément trouvé (recherche ou fil d'Ariane) à sa place dans les colonnes. */
  reveal(f: FmItem): void {
    const ids = [...this.store.path(f.parent).map((p) => p.id), f.id];
    this.query.set('');
    this.trail.set(ids);
    this.focusCol.set(ids.length - 1);
  }

  preview(f: FmItem): void {
    if (!f.url) { this.snack.open('Aperçu indisponible (exemple statique)', 'OK', { duration: 2000 }); return; }
    const siblings = this.store.children(f.parent).filter((i) => i.kind !== 'folder' && i.url);
    this.viewer.open(this.store.toViewer(siblings), siblings.findIndex((s) => s.id === f.id));
  }
  toggleStar(f: FmItem): void { this.store.patch(f.id, { starred: !f.starred }); }
  rename(f: FmItem): void {
    askName(this.dialog, { title: 'Renommer', label: 'Nouveau nom', value: f.name, confirm: 'Renommer', icon: 'drive_file_rename_outline' })
      .subscribe((name) => name && this.store.patch(f.id, { name }));
  }
  newFolder(): void {
    const parent = this.currentFolderId();
    askName(this.dialog, { title: 'Nouveau dossier', label: 'Nom du dossier', value: 'Nouveau dossier', confirm: 'Créer', icon: 'create_new_folder' })
      .subscribe((name) => { if (name) { const d = this.store.createFolder(name, parent); this.reveal(d); } });
  }
  upload(files: FileList | File[]): void {
    const added = this.store.addFiles(files, this.currentFolderId());
    if (added[0]) this.reveal(added[0]);
    this.snack.open(`${added.length} fichier(s) importé(s)`, 'OK', { duration: 2000 });
  }
  onDrop(e: DragEvent): void { e.preventDefault(); if (e.dataTransfer?.files.length) this.upload(e.dataTransfer.files); }

  /** ↑ ↓ dans la colonne, → entre dans le dossier, ← remonte, Entrée / Espace : aperçu. */
  onKey(e: KeyboardEvent): void {
    if ((e.target as HTMLElement).closest('input')) return;
    const cols = this.columns();
    const ci = Math.min(this.focusCol(), cols.length - 1);
    const col = cols[ci];
    const idx = col.items.findIndex((i) => i.id === col.selected);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const next = col.items[Math.min(col.items.length - 1, Math.max(0, idx + (e.key === 'ArrowDown' ? 1 : -1)))];
      if (next) this.selectAt(ci, next.id);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextCol = cols[ci + 1];
      if (nextCol?.items.length) this.selectAt(ci + 1, nextCol.items[0].id);
    } else if (e.key === 'ArrowLeft' && ci > 0) {
      e.preventDefault();
      this.trail.update((t) => t.slice(0, ci));
      this.focusCol.set(ci - 1);
    } else if ((e.key === 'Enter' || e.key === ' ') && this.file()) {
      e.preventDefault();
      this.preview(this.file()!);
    }
  }

  private currentFolderId(): string | null { const s = this.selected(); return s ? (s.kind === 'folder' ? s.id : s.parent) : null; }
  private sorted(l: FmItem[]): FmItem[] {
    return [...l].sort((a, b) => ((a.kind === 'folder') !== (b.kind === 'folder') ? (a.kind === 'folder' ? -1 : 1) : a.name.localeCompare(b.name, 'fr')));
  }
}
