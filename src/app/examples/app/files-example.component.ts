import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../shared/material.module';
import { DescriptionItem, DescriptionListComponent } from '../../shared/components/data';
import { CopyFieldComponent } from '../../shared/components/fields';
import { FileViewerService } from '../../shared/components/media';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { ExAppShellComponent } from './ex-app-shell.component';
import { ExFileBrowserComponent, FmScope } from './files/ex-file-browser.component';
import { openFilePicker } from './files/ex-file-picker.dialog';
import { askName } from './files/ex-name.dialog';
import { ExFilesService, FM_KINDS, FmItem, fmSize } from './files/ex-files.service';

/**
 * /examples/app/files — gestionnaire de fichiers : emplacements, jauge de stockage par type, navigateur
 * (grille / liste, recherche, tri, sélection multiple, glisser-déposer, menu contextuel), panneau de détails,
 * aperçu plein écran (images, PDF, vidéo, audio, texte), nouveau dossier, partage, suppression confirmée,
 * et démonstration du sélecteur de fichiers en modale.
 */
@Component({
  selector: 'app-files-example',
  standalone: true,
  imports: [DatePipe, RouterLink, MaterialModule, DescriptionListComponent, CopyFieldComponent, ExFileBrowserComponent, ExAppShellComponent],
  template: `
    <ex-app-shell title="Fichiers" crumb="Ressources">
      <div class="page-head">
        <div class="titles">
          <span class="eyebrow">Ressources</span>
          <h1>Fichiers</h1>
          <p>{{ fileCount() }} fichiers · {{ size(store.used()) }} utilisés sur {{ size(store.quota) }}</p>
        </div>
        <div class="actions">
          <div class="layout-switch" role="group" aria-label="Disposition">
            <a class="on" aria-current="page"><mat-icon>grid_view</mat-icon>Grille</a>
            <a routerLink="/examples/app/files/columns"><mat-icon>view_week</mat-icon>Colonnes</a>
          </div>
          <button mat-stroked-button (click)="pickDemo()"><mat-icon>file_open</mat-icon>Sélecteur (modale)</button>
          <button mat-flat-button color="primary" [matMenuTriggerFor]="newMenu"><mat-icon>add</mat-icon>Nouveau</button>
          <mat-menu #newMenu="matMenu" class="m3-dropdown-menu">
            <button mat-menu-item (click)="newFolder()"><mat-icon>create_new_folder</mat-icon>Nouveau dossier</button>
            <mat-divider />
            <button mat-menu-item (click)="input.click()"><mat-icon>upload_file</mat-icon>Importer des fichiers</button>
          </mat-menu>
          <input #input type="file" multiple hidden (change)="upload($any($event.target).files); input.value = ''" />
        </div>
      </div>

      <div class="layout" [class.with-details]="current()">
        <aside class="places">
          <nav aria-label="Emplacements">
            @for (p of places; track p.id) {
              <button type="button" [class.on]="scope() === p.id" (click)="go(p.id)"><mat-icon>{{ p.icon }}</mat-icon><span>{{ p.label }}</span>@if (p.count()) { <b>{{ p.count() }}</b> }</button>
            }
          </nav>
          <section class="storage" aria-label="Stockage">
            <div class="s-top"><strong>Stockage</strong><span>{{ pct() }} %</span></div>
            <div class="bar">@for (u of usage(); track u.kind) { <i [style.width.%]="u.pct" [style.background]="u.color" [matTooltip]="u.label + ' · ' + size(u.bytes)"></i> }</div>
            <ul>@for (u of usage(); track u.kind) { <li><i [style.background]="u.color"></i>{{ u.label }}<span>{{ size(u.bytes) }}</span></li> }</ul>
            <button mat-stroked-button class="more">Augmenter l’espace</button>
          </section>
        </aside>

        <section class="main card">
          @if (selection().length > 1) {
            <div class="bulk">
              <button mat-icon-button (click)="browser()?.clear()" aria-label="Désélectionner"><mat-icon>close</mat-icon></button>
              <strong>{{ selection().length }} sélectionné(s)</strong>
              <span class="spacer"></span>
              <button mat-button (click)="act('download', selection())"><mat-icon>download</mat-icon><span class="hide-sm">Télécharger</span></button>
              <button mat-button (click)="act('share', selection())"><mat-icon>person_add</mat-icon><span class="hide-sm">Partager</span></button>
              <button mat-button color="warn" (click)="act('delete', selection())"><mat-icon>delete</mat-icon><span class="hide-sm">Supprimer</span></button>
            </div>
          }
          <ex-file-browser [scope]="scope()" [(folder)]="folder" [(view)]="view"
            (selectionChange)="selection.set($event)" (opened)="preview($event)" (action)="act($event.id, $event.items)" (dropped)="upload($event)" />
        </section>

        @if (current(); as f) {
          <aside class="details card" aria-label="Détails">
            <header><strong>Détails</strong><button mat-icon-button (click)="browser()?.clear()" aria-label="Fermer les détails"><mat-icon>close</mat-icon></button></header>
            <div class="d-thumb">
              @if (f.kind === 'folder') { <mat-icon [style.color]="f.color">folder</mat-icon> }
              @else if (f.kind === 'image' && f.url) { <img [src]="f.url" [alt]="f.name" /> }
              @else { <img class="ic" [src]="'assets/icons-files/' + kinds[f.kind].img" alt="" /> }
            </div>
            <h2 [title]="f.name">{{ f.name }}</h2>
            <div class="d-actions">
              @if (f.kind !== 'folder') { <button mat-flat-button color="primary" (click)="preview(f)"><mat-icon>visibility</mat-icon>Aperçu</button> }
              <button mat-stroked-button (click)="act('star', [f])"><mat-icon>{{ f.starred ? 'star' : 'star_border' }}</mat-icon>{{ f.starred ? 'Favori' : 'Ajouter' }}</button>
            </div>
            <app-description-list [items]="info()" [columns]="1" layout="horizontal" />
            <div class="d-share">
              <span class="lbl">Lien de partage</span>
              <app-copy-field [value]="'https://scstorage.ci/f/' + f.id + '-7Hk2'" icon="link" label="le lien" />
              <div class="people">
                <span class="ava-stack">@for (p of sharedWith(f); track p) { <span class="ava sm" [style.background]="p.c" [matTooltip]="p.n">{{ p.i }}</span> }</span>
                <span class="muted">{{ f.shared ? 'Partagé avec 3 personnes' : 'Privé' }}</span>
              </div>
            </div>
            <div class="d-activity">
              <span class="lbl">Activité</span>
              <p><strong>{{ f.owner }}</strong> a {{ f.kind === 'folder' ? 'créé ce dossier' : 'importé ce fichier' }} · {{ f.modified | date: 'd MMM, HH:mm' }}</p>
              @if (f.shared) { <p><strong>Fatou Diabaté</strong> a consulté · hier</p> }
            </div>
          </aside>
        }
      </div>
    </ex-app-shell>
  `,
  styleUrls: ['./files-example.component.scss'],
})
export class FilesExampleComponent {
  readonly store = inject(ExFilesService);
  private viewer = inject(FileViewerService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);
  readonly browser = viewChild(ExFileBrowserComponent);
  readonly kinds = FM_KINDS;

  constructor() {
    // Lien direct vers la version modale : /examples/app/files?picker=1
    if (inject(ActivatedRoute).snapshot.queryParamMap.has('picker')) setTimeout(() => this.pickDemo());
  }
  readonly size = fmSize;

  readonly scope = signal<FmScope>('drive');
  readonly folder = signal<string | null>(null);
  readonly view = signal<'card' | 'list'>(window.innerWidth < 768 ? 'list' : 'card');
  readonly selection = signal<FmItem[]>([]);
  /** Élément affiché dans le panneau de détails (sélection simple, toujours à jour avec le disque). */
  readonly current = computed(() => (this.selection().length === 1 ? this.store.get(this.selection()[0].id) ?? null : null));

  readonly fileCount = computed(() => this.store.items().filter((i) => i.kind !== 'folder').length);
  readonly pct = computed(() => Math.round((this.store.used() / this.store.quota) * 100));
  readonly usage = computed(() => this.store.usageByKind().map((u) => ({ ...u, pct: (u.bytes / this.store.quota) * 100 })));
  readonly places = [
    { id: 'drive' as FmScope, label: 'Mon disque', icon: 'cloud', count: () => 0 },
    { id: 'recent' as FmScope, label: 'Récents', icon: 'schedule', count: () => 0 },
    { id: 'starred' as FmScope, label: 'Favoris', icon: 'star_border', count: () => this.store.items().filter((i) => i.starred).length },
    { id: 'shared' as FmScope, label: 'Partagés', icon: 'group', count: () => this.store.items().filter((i) => i.shared).length },
  ];

  readonly info = computed<DescriptionItem[]>(() => {
    const f = this.current();
    if (!f) return [];
    const where = this.store.path(f.parent).map((p) => p.name).join(' / ') || 'Mon disque';
    const s = f.kind === 'folder' ? this.store.folderStats(f.id) : null;
    return [
      { label: 'Type', value: FM_KINDS[f.kind].label + (f.mime ? ` (${f.mime})` : '') },
      { label: 'Taille', value: s ? `${fmSize(s.size)} · ${s.count} élément(s)` : fmSize(f.size) },
      { label: 'Emplacement', value: where },
      { label: 'Propriétaire', value: f.owner },
      { label: 'Modifié', value: f.modified.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) },
    ];
  });

  go(scope: FmScope): void { this.scope.set(scope); this.folder.set(null); }

  preview(f: FmItem): void {
    const siblings = this.store.items().filter((i) => i.parent === f.parent && i.kind !== 'folder' && i.url);
    if (!f.url) { this.snack.open(`Aperçu indisponible pour « ${f.name} » (exemple statique)`, 'OK', { duration: 2500 }); return; }
    const files = this.store.toViewer(siblings);
    this.viewer.open(files, Math.max(0, siblings.findIndex((s) => s.id === f.id)));
  }

  upload(files: FileList | File[]): void {
    const added = this.store.addFiles(files, this.scope() === 'drive' ? this.folder() : null);
    this.scope.set('drive');
    this.snack.open(`${added.length} fichier(s) importé(s)`, 'OK', { duration: 2500 });
  }

  newFolder(): void {
    askName(this.dialog, { title: 'Nouveau dossier', label: 'Nom du dossier', value: 'Nouveau dossier', confirm: 'Créer', icon: 'create_new_folder' }).subscribe((name) => {
      if (!name) return;
      this.scope.set('drive');
      this.store.createFolder(name, this.folder());
    });
  }

  act(id: string, items: FmItem[]): void {
    if (!items.length) return;
    const one = items[0];
    switch (id) {
      case 'open': one.kind === 'folder' ? (this.scope.set('drive'), this.folder.set(one.id)) : this.preview(one); break;
      case 'star': { const on = !one.starred; items.forEach((i) => this.store.patch(i.id, { starred: on })); break; }
      case 'rename':
        askName(this.dialog, { title: 'Renommer', label: 'Nouveau nom', value: one.name, confirm: 'Renommer', icon: 'drive_file_rename_outline' })
          .subscribe((name) => name && this.store.patch(one.id, { name }));
        break;
      case 'share': items.forEach((i) => this.store.patch(i.id, { shared: true })); this.snack.open('Lien de partage copié', 'OK', { duration: 2500 }); break;
      case 'download': this.download(items); break;
      case 'delete': this.confirmDelete(items); break;
    }
  }

  /** Démonstration : ouvre le sélecteur en modale et affiche la sélection. */
  pickDemo(): void {
    openFilePicker(this.dialog, { title: 'Joindre des fichiers', confirmLabel: 'Joindre' }).subscribe((files) => {
      if (files?.length) this.snack.open(`Sélection : ${files.map((f) => f.name).slice(0, 2).join(', ')}${files.length > 2 ? ` et ${files.length - 2} autre(s)` : ''}`, 'OK', { duration: 3500 });
    });
  }

  sharedWith(f: FmItem): { n: string; i: string; c: string }[] {
    const me = { n: f.owner, i: f.owner.split(' ').map((p) => p[0]).join('').slice(0, 2), c: '#0f766e' };
    return f.shared ? [me, { n: 'Fatou Diabaté', i: 'FD', c: '#7c3aed' }, { n: 'Marc Yao', i: 'MY', c: '#059669' }, { n: 'Aya Koné', i: 'AK', c: '#b45309' }] : [me];
  }

  private download(items: FmItem[]): void {
    const files = items.filter((i) => i.url);
    for (const f of files) { const a = document.createElement('a'); a.href = f.url!; a.download = f.name; a.click(); }
    if (files.length < items.length) this.snack.open('Certains éléments ne sont pas téléchargeables (exemple statique)', 'OK', { duration: 2500 });
  }

  private confirmDelete(items: FmItem[]): void {
    const data: ConfirmDialogData = {
      title: items.length > 1 ? `Supprimer ${items.length} éléments ?` : `Supprimer « ${items[0].name} » ?`,
      message: 'Les éléments seront placés dans la corbeille pendant 30 jours. Le contenu des dossiers est supprimé avec eux.',
      confirmLabel: 'Supprimer', type: 'danger',
    };
    this.dialog.open(ConfirmDialogComponent, { data, width: '440px' }).afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.store.remove(items.map((i) => i.id));
      this.browser()?.clear();
      this.snack.open(`${items.length} élément(s) supprimé(s)`, 'OK', { duration: 2500 });
    });
  }
}
