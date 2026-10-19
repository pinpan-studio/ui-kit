import { Component, booleanAttribute, computed, effect, inject, input, model, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MaterialModule } from '../../../shared/material.module';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ViewMode, ViewModeToggleComponent } from '../../../shared/components/view-mode-toggle/view-mode-toggle.component';
import { ContextMenuDirective, ContextMenuItem } from '../../../shared/components/interaction';
import { ExFilesService, FM_KINDS, FmItem, FmKind, fmSize } from './ex-files.service';

export type FmScope = 'drive' | 'recent' | 'starred' | 'shared';
type SortKey = 'name' | 'modified' | 'size';

/**
 * Navigateur de fichiers partagé par le gestionnaire (/examples/app/files) et le sélecteur en modale :
 * fil d'Ariane, recherche, tri, vues grille / liste, sélection (Ctrl/⌘ + clic, Maj + clic), glisser-déposer,
 * filtre de types (`accept`), menu contextuel en mode gestionnaire.
 */
@Component({
  selector: 'ex-file-browser',
  standalone: true,
  imports: [DatePipe, MaterialModule, EmptyStateComponent, ViewModeToggleComponent, ContextMenuDirective],
  template: `
    <div class="fb" [class.picker]="picker()" [class.dragging]="dragging()"
      (dragover)="$event.preventDefault(); dragging.set(true)" (dragleave)="onLeave($event)" (drop)="onDrop($event)">
      <div class="fb-bar">
        <nav class="crumbs" aria-label="Emplacement">
          @if (scope() === 'drive' && !query()) {
            <button type="button" (click)="folder.set(null)" [class.cur]="!folder()">Mon disque</button>
            @for (p of path(); track p.id; let last = $last) {
              <mat-icon>chevron_right</mat-icon><button type="button" (click)="folder.set(p.id)" [class.cur]="last">{{ p.name }}</button>
            }
          } @else {
            <span class="cur">{{ query() ? 'Résultats pour « ' + query() + ' »' : scopeLabel() }}</span>
          }
        </nav>
        <span class="spacer"></span>
        <label class="searchbox"><mat-icon>search</mat-icon><input type="search" placeholder="Rechercher un fichier" [value]="query()" (input)="query.set($any($event.target).value)" /></label>
        <button mat-icon-button [matMenuTriggerFor]="sortMenu" matTooltip="Trier" aria-label="Trier"><mat-icon>sort</mat-icon></button>
        <mat-menu #sortMenu="matMenu" class="m3-dropdown-menu">
          @for (s of sorts; track s.id) { <button mat-menu-item (click)="setSort(s.id)"><mat-icon>{{ sort().key === s.id ? (sort().dir === 1 ? 'arrow_upward' : 'arrow_downward') : 'remove' }}</mat-icon>{{ s.label }}</button> }
        </mat-menu>
        <app-view-mode-toggle [(mode)]="view" />
      </div>

      @if (!rows().length) {
        <app-empty-state [icon]="query() ? 'search_off' : 'folder_open'" [title]="query() ? 'Aucun résultat' : 'Dossier vide'"
          [subtitle]="picker() ? 'Aucun fichier compatible ici.' : 'Glissez des fichiers ici ou utilisez « Importer ».'" />
      } @else if (view() === 'card') {
        @if (folders().length) {
          <div class="group-label">Dossiers</div>
          <div class="folders">
            @for (f of folders(); track f.id) {
              <button type="button" class="folder" [class.sel]="isSel(f)" (click)="click(f, $event)" (dblclick)="open(f)"
                [appContextMenu]="picker() ? noMenu : menu" (contextMenuOpen)="select(f)" (itemSelected)="action.emit({ id: $any($event).id, items: selection() })">
                <mat-icon [style.color]="f.color">folder</mat-icon><span class="nm">{{ f.name }}</span>
                @if (f.shared) { <mat-icon class="badge-ic" matTooltip="Partagé">group</mat-icon> }
              </button>
            }
          </div>
        }
        @if (files().length) {
          <div class="group-label">Fichiers</div>
          <div class="grid">
            @for (f of files(); track f.id) {
              <button type="button" class="tile" [class.sel]="isSel(f)" [class.off]="!accepts(f)" [disabled]="!accepts(f)" (click)="click(f, $event)" (dblclick)="open(f)"
                [appContextMenu]="picker() ? noMenu : menu" (contextMenuOpen)="select(f)" (itemSelected)="action.emit({ id: $any($event).id, items: selection() })">
                <span class="thumb">
                  @if (f.kind === 'image' && f.url) { <img [src]="f.url" [alt]="f.name" loading="lazy" /> }
                  @else { <img class="ic" [src]="'assets/icons-files/' + kinds[f.kind].img" alt="" /> }
                  @if (f.kind === 'video') { <mat-icon class="play">play_circle</mat-icon> }
                  @if (picker() || isSel(f)) { <span class="check" [class.on]="isSel(f)"><mat-icon>check</mat-icon></span> }
                </span>
                <span class="meta"><span class="nm" [title]="f.name">{{ f.name }}</span><small>{{ size(f.size) }} · {{ f.modified | date: 'd MMM' }}</small></span>
                @if (f.starred) { <mat-icon class="star">star</mat-icon> }
              </button>
            }
          </div>
        }
      } @else {
        <div class="table-wrap">
          <table class="list">
            <thead><tr>
              <th class="c-name" (click)="setSort('name')">Nom<mat-icon>{{ sortIcon('name') }}</mat-icon></th>
              <th class="hide-sm">Propriétaire</th>
              <th (click)="setSort('modified')">Modifié<mat-icon>{{ sortIcon('modified') }}</mat-icon></th>
              <th class="r" (click)="setSort('size')">Taille<mat-icon>{{ sortIcon('size') }}</mat-icon></th>
            </tr></thead>
            <tbody>
              @for (f of rows(); track f.id) {
                <tr [class.sel]="isSel(f)" [class.off]="!accepts(f)" (click)="accepts(f) && click(f, $event)" (dblclick)="open(f)"
                  [appContextMenu]="picker() ? noMenu : menu" (contextMenuOpen)="select(f)" (itemSelected)="action.emit({ id: $any($event).id, items: selection() })">
                  <td class="c-name"><span class="nm-cell">
                    @if (f.kind === 'folder') { <mat-icon class="fi" [style.color]="f.color">folder</mat-icon> }
                    @else if (f.kind === 'image' && f.url) { <img class="th" [src]="f.url" alt="" /> }
                    @else { <img class="th ic" [src]="'assets/icons-files/' + kinds[f.kind].img" alt="" /> }
                    <span class="nm">{{ f.name }}</span>
                    @if (f.starred) { <mat-icon class="star">star</mat-icon> }
                    @if (f.shared) { <mat-icon class="shared" matTooltip="Partagé">group</mat-icon> }
                  </span></td>
                  <td class="hide-sm muted">{{ f.owner }}</td>
                  <td class="muted">{{ f.modified | date: 'd MMM yyyy' }}</td>
                  <td class="r muted">{{ f.kind === 'folder' ? stats(f) : size(f.size) }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
      @if (dragging() && !picker()) { <div class="drop"><mat-icon>cloud_upload</mat-icon>Déposez pour importer dans « {{ path().at(-1)?.name ?? 'Mon disque' }} »</div> }
    </div>
  `,
  styleUrls: ['./ex-file-browser.component.scss'],
})
export class ExFileBrowserComponent {
  readonly store = inject(ExFilesService);
  readonly kinds = FM_KINDS;
  readonly size = fmSize;

  /** Mode sélecteur : cases à cocher, pas de menu contextuel, double-clic = valider. */
  picker = input(false, { transform: booleanAttribute });
  multiple = input(true, { transform: booleanAttribute });
  /** Types acceptés (les autres sont grisés) ; `null` = tous. */
  accept = input<FmKind[] | null>(null);
  scope = input<FmScope>('drive');
  folder = model<string | null>(null);
  view = model<ViewMode>('card');

  readonly selection = signal<FmItem[]>([]);
  selectionChange = output<FmItem[]>();
  /** Double-clic sur un fichier (aperçu en gestionnaire, validation en sélecteur). */
  opened = output<FmItem>();
  /** Action du menu contextuel. */
  action = output<{ id: string; items: FmItem[] }>();
  dropped = output<File[]>();

  readonly query = signal('');
  readonly sort = signal<{ key: SortKey; dir: 1 | -1 }>({ key: 'name', dir: 1 });
  readonly dragging = signal(false);
  readonly sorts: { id: SortKey; label: string }[] = [{ id: 'name', label: 'Nom' }, { id: 'modified', label: 'Date de modification' }, { id: 'size', label: 'Taille' }];
  readonly noMenu: ContextMenuItem[] = [];
  readonly menu: ContextMenuItem[] = [
    { id: 'open', label: 'Ouvrir', icon: 'open_in_new' },
    { id: 'download', label: 'Télécharger', icon: 'download' },
    { id: 'share', label: 'Partager', icon: 'person_add' },
    { id: 'star', label: 'Ajouter / retirer des favoris', icon: 'star_border' },
    { id: 'rename', label: 'Renommer', icon: 'drive_file_rename_outline' },
    { divider: true },
    { id: 'delete', label: 'Supprimer', icon: 'delete', danger: true },
  ];

  readonly path = computed(() => this.store.path(this.folder()));
  readonly scopeLabel = computed(() => ({ drive: 'Mon disque', recent: 'Récents', starred: 'Favoris', shared: 'Partagés avec moi' })[this.scope()]);

  readonly rows = computed(() => {
    const q = this.query().trim().toLowerCase();
    const all = this.store.items();
    let list: FmItem[];
    if (q) list = all.filter((i) => i.name.toLowerCase().includes(q));
    else if (this.scope() === 'recent') list = all.filter((i) => i.kind !== 'folder').sort((a, b) => +b.modified - +a.modified).slice(0, 12);
    else if (this.scope() === 'starred') list = all.filter((i) => i.starred);
    else if (this.scope() === 'shared') list = all.filter((i) => i.shared);
    else list = all.filter((i) => i.parent === this.folder());
    if (this.scope() === 'recent' && !q) return list;
    const { key, dir } = this.sort();
    const val = (i: FmItem) => (key === 'name' ? i.name.toLowerCase() : key === 'size' ? i.size : +i.modified);
    return [...list].sort((a, b) => (a.kind === 'folder') !== (b.kind === 'folder') ? (a.kind === 'folder' ? -1 : 1) : (val(a) > val(b) ? 1 : val(a) < val(b) ? -1 : 0) * dir);
  });
  readonly folders = computed(() => this.rows().filter((i) => i.kind === 'folder'));
  readonly files = computed(() => this.rows().filter((i) => i.kind !== 'folder'));

  private anchor: FmItem | null = null;

  constructor() {
    this.store.ensure();
    // Changer de dossier ou de vue réinitialise la sélection.
    effect(() => { this.folder(); this.scope(); this.query(); this.setSelection([]); });
  }

  accepts(f: FmItem): boolean { const a = this.accept(); return f.kind === 'folder' || !a || a.includes(f.kind); }
  isSel(f: FmItem): boolean { return this.selection().some((s) => s.id === f.id); }
  stats(f: FmItem): string { return this.store.folderStats(f.id).count + ' élément(s)'; }
  sortIcon(k: SortKey): string { const s = this.sort(); return s.key !== k ? '' : s.dir === 1 ? 'arrow_upward' : 'arrow_downward'; }
  setSort(k: SortKey): void { this.sort.update((s) => ({ key: k, dir: s.key === k ? (s.dir === 1 ? -1 : 1) : k === 'name' ? 1 : -1 })); }

  click(f: FmItem, e: MouseEvent): void {
    const pickable = !this.picker() || f.kind !== 'folder';
    if (!pickable) { this.setSelection([]); return; }
    const multi = this.multiple();
    if (multi && e.shiftKey && this.anchor) {
      const list = this.rows().filter((r) => this.accepts(r) && (r.kind === 'folder') === (f.kind === 'folder'));
      const [a, b] = [list.findIndex((r) => r.id === this.anchor!.id), list.findIndex((r) => r.id === f.id)].sort((x, y) => x - y);
      this.setSelection(list.slice(a, b + 1));
      return;
    }
    // En sélecteur multiple, un simple clic bascule (comme une case à cocher).
    if (multi && (e.metaKey || e.ctrlKey || this.picker())) {
      this.setSelection(this.isSel(f) ? this.selection().filter((s) => s.id !== f.id) : [...this.selection(), f]);
    } else {
      this.setSelection([f]);
    }
    this.anchor = f;
  }
  select(f: FmItem): void { if (!this.isSel(f)) { this.setSelection([f]); this.anchor = f; } }
  selectAll(): void { this.setSelection(this.rows().filter((r) => this.accepts(r) && (!this.picker() || r.kind !== 'folder'))); }
  clear(): void { this.setSelection([]); }

  open(f: FmItem): void {
    if (f.kind === 'folder') { this.query.set(''); this.folder.set(f.id); return; }
    if (this.accepts(f)) this.opened.emit(f);
  }

  onLeave(e: DragEvent): void { if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) this.dragging.set(false); }
  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.dragging.set(false);
    const files = [...(e.dataTransfer?.files ?? [])];
    if (files.length) this.dropped.emit(files);
  }

  private setSelection(l: FmItem[]): void { this.selection.set(l); this.selectionChange.emit(l); }
}
