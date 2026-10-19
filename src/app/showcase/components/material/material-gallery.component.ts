import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { CdkDrag, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatBottomSheet, MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatChipEditedEvent, MatChipInputEvent } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../../shared/material.module';
import { DOC_COMPONENTS, TocItem } from '../../shared/doc.components';

interface TreeNode { name: string; icon?: string; meta?: string; children?: TreeNode[]; }
interface KanbanItem { id: string; title: string; tag: string; }

/** Contenu du bottom sheet de démonstration (actions de partage d'un document). */
@Component({
  selector: 'kit-share-sheet',
  standalone: true,
  imports: [MaterialModule],
  template: `
    <div class="sheet-head">
      <strong>{{ data.title }}</strong>
      <span>Choisissez une action</span>
    </div>
    <mat-nav-list>
      @for (a of actions; track a.key) {
        <a mat-list-item (click)="pick(a.key)">
          <mat-icon matListItemIcon>{{ a.icon }}</mat-icon>
          <span matListItemTitle>{{ a.label }}</span>
          <span matListItemLine>{{ a.hint }}</span>
        </a>
      }
    </mat-nav-list>
  `,
  styles: [`
    .sheet-head { display:flex; flex-direction:column; gap:2px; padding: 8px 16px 4px; }
    .sheet-head strong { font-family:'Outfit',sans-serif; font-size:16px; }
    .sheet-head span { font-size:12px; color: var(--text-muted); }
  `],
})
export class ShareSheetComponent {
  private ref = inject<MatBottomSheetRef<ShareSheetComponent, string>>(MatBottomSheetRef);
  readonly data = inject<{ title: string }>(MAT_BOTTOM_SHEET_DATA);
  readonly actions = [
    { key: 'email', icon: 'mail', label: 'Envoyer par email', hint: 'Joindre le PDF à un message' },
    { key: 'link', icon: 'link', label: 'Copier le lien', hint: 'Lien public valable 7 jours' },
    { key: 'download', icon: 'download', label: 'Télécharger', hint: 'Format PDF (A4)' },
    { key: 'print', icon: 'print', label: 'Imprimer', hint: 'Ouvre la boîte de dialogue système' },
  ];
  pick(key: string) { this.ref.dismiss(key); }
}

/** Galerie /components/material — composants Angular Material / CDK avancés (accordion, tree, drag & drop…). */
@Component({
  selector: 'app-material-gallery',
  standalone: true,
  imports: [MaterialModule, DecimalPipe, ...DOC_COMPONENTS],
  templateUrl: './material-gallery.component.html',
  styleUrls: ['./material-gallery.component.scss'],
})
export class MaterialGalleryComponent {
  private bottomSheet = inject(MatBottomSheet);
  private snackBar = inject(MatSnackBar);

  readonly toc: TocItem[] = [
    { id: 'accordion', label: 'Accordion' }, { id: 'tree', label: 'Tree' }, { id: 'drag-drop', label: 'Drag & drop' },
    { id: 'chips-input', label: 'Chips input' }, { id: 'card', label: 'Card' }, { id: 'grid-list', label: 'Grid list' },
    { id: 'bottom-sheet', label: 'Bottom sheet' }, { id: 'virtual-scroll', label: 'Virtual scroll' }, { id: 'ripple', label: 'Ripple' },
  ];

  // ─── Accordion ──────────────────────────────────────────────────────────
  step = signal(0);
  setStep(i: number) { this.step.set(i); }
  nextStep() { this.step.update((s) => s + 1); }
  prevStep() { this.step.update((s) => s - 1); }
  stepDone = signal(false);

  readonly faq = [
    { q: 'Comment ajouter un nouveau véhicule à un contrat ?', a: 'Depuis la fiche client, onglet « Contrats », cliquez sur « Ajouter un véhicule ». La balise est rattachée automatiquement lors de l’installation.' },
    { q: 'Quand le rôle de facturation est-il généré ?', a: 'Le rôle est généré le 25 de chaque mois à 22:00. Vous pouvez le régénérer manuellement depuis Finance › Rôles tant qu’il n’est pas validé.' },
    { q: 'Que signifie le statut « Balise hors ligne » ?', a: 'La balise n’a pas émis de position depuis plus de 24 h. Vérifiez l’alimentation du véhicule ou planifiez une intervention.' },
    { q: 'Puis-je exporter la liste des interventions ?', a: 'Oui, depuis la liste des interventions, menu « ⋮ » › « Exporter ». Les filtres actifs sont appliqués à l’export.' },
  ];

  readonly filterGroups = [
    { key: 'statut', icon: 'flag', label: 'Statut', options: ['Actif', 'Suspendu', 'Résilié', 'En attente'] },
    { key: 'ville', icon: 'location_on', label: 'Ville', options: ['Abidjan', 'Bouaké', 'Yamoussoukro', 'San-Pédro', 'Korhogo'] },
    { key: 'offre', icon: 'sell', label: 'Offre', options: ['Essentiel', 'Premium', 'Flotte+'] },
  ];
  filters = signal<Record<string, Set<string>>>({ statut: new Set(['Actif']), ville: new Set(), offre: new Set() });
  filterCount = computed(() => Object.values(this.filters()).reduce((n, s) => n + s.size, 0));
  isFiltered(group: string, opt: string) { return this.filters()[group].has(opt); }
  toggleFilter(group: string, opt: string) {
    const next = { ...this.filters() };
    const set = new Set(next[group]);
    set.has(opt) ? set.delete(opt) : set.add(opt);
    next[group] = set;
    this.filters.set(next);
  }
  clearFilters() { this.filters.set({ statut: new Set(), ville: new Set(), offre: new Set() }); }

  // ─── Tree ───────────────────────────────────────────────────────────────
  readonly fileTree: TreeNode[] = [
    { name: 'Clients', icon: 'folder', children: [
      { name: 'Transports Yao SARL', icon: 'folder', children: [
        { name: 'Contrat-2026.pdf', icon: 'picture_as_pdf', meta: '412 Ko' },
        { name: 'PV-installation.pdf', icon: 'picture_as_pdf', meta: '1,2 Mo' },
      ] },
      { name: 'SOTRA Logistique', icon: 'folder', children: [
        { name: 'Proforma-0412.pdf', icon: 'picture_as_pdf', meta: '98 Ko' },
      ] },
    ] },
    { name: 'Finance', icon: 'folder', children: [
      { name: 'Rôles', icon: 'folder', children: [
        { name: 'role-2026-09.xlsx', icon: 'table_view', meta: '64 Ko' },
        { name: 'role-2026-10.xlsx', icon: 'table_view', meta: '71 Ko' },
      ] },
    ] },
    { name: 'Lisez-moi.txt', icon: 'description', meta: '2 Ko' },
  ];
  readonly childrenAccessor = (n: TreeNode) => n.children ?? [];
  readonly hasChild = (_: number, n: TreeNode) => !!n.children?.length;

  readonly permTree: TreeNode[] = [
    { name: 'Clients', children: [{ name: 'Consulter' }, { name: 'Créer' }, { name: 'Modifier' }, { name: 'Supprimer' }] },
    { name: 'Finance', children: [
      { name: 'Factures', children: [{ name: 'Consulter' }, { name: 'Valider' }] },
      { name: 'Rôles', children: [{ name: 'Générer' }, { name: 'Exporter' }] },
    ] },
    { name: 'Interventions', children: [{ name: 'Planifier' }, { name: 'Clôturer' }] },
  ];
  perms = signal<Set<TreeNode>>(new Set());
  private leaves(n: TreeNode): TreeNode[] { return n.children?.length ? n.children.flatMap((c) => this.leaves(c)) : [n]; }
  permChecked(n: TreeNode) { const l = this.leaves(n); return l.every((x) => this.perms().has(x)); }
  permPartial(n: TreeNode) { const l = this.leaves(n); const k = l.filter((x) => this.perms().has(x)).length; return k > 0 && k < l.length; }
  togglePerm(n: TreeNode) {
    const on = !this.permChecked(n);
    const next = new Set(this.perms());
    this.leaves(n).forEach((x) => (on ? next.add(x) : next.delete(x)));
    this.perms.set(next);
  }
  permTotal = this.permTree.flatMap((n) => this.leaves(n)).length;

  // ─── Drag & drop ────────────────────────────────────────────────────────
  priorities = signal(['Relancer Transports Yao (impayé)', 'Installer 12 balises — SOTRA', 'Valider le rôle d’octobre', 'Former l’équipe Bouaké', 'Mettre à jour les tarifs Premium']);
  dropPriority(e: CdkDragDrop<string[]>) {
    const arr = [...this.priorities()];
    moveItemInArray(arr, e.previousIndex, e.currentIndex);
    this.priorities.set(arr);
  }

  todo: KanbanItem[] = [
    { id: 'T-101', title: 'Balise hors ligne — CI-4521-AB', tag: 'Support' },
    { id: 'T-102', title: 'Proforma SOTRA', tag: 'Finance' },
    { id: 'T-103', title: 'Contrôle technique flotte', tag: 'Terrain' },
  ];
  doing: KanbanItem[] = [{ id: 'T-098', title: 'Migration des contrats 2025', tag: 'Admin' }];
  done: KanbanItem[] = [{ id: 'T-090', title: 'Audit des accès', tag: 'Admin' }];
  dropKanban(e: CdkDragDrop<KanbanItem[]>) {
    if (e.previousContainer === e.container) moveItemInArray(e.container.data, e.previousIndex, e.currentIndex);
    else transferArrayItem(e.previousContainer.data, e.container.data, e.previousIndex, e.currentIndex);
  }
  /** Interdit le dépôt dans « Terminé » d'une carte venant directement de « À faire ». */
  readonly doneGuard = (drag: CdkDrag<string>) => drag.data !== 'col-todo';
  readonly allowAll = () => true;

  // ─── Chips input ────────────────────────────────────────────────────────
  readonly separators = [ENTER, COMMA] as const;
  emails = signal(['k.yao@transports-yao.ci', 'compta@sotra.ci']);
  tags = signal(['Premium', 'Abidjan', 'Flotte > 10']);
  private isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  addChip(list: 'emails' | 'tags', e: MatChipInputEvent) {
    const v = (e.value || '').trim();
    if (v && !this[list]().includes(v)) this[list].update((a) => [...a, v]);
    e.chipInput.clear();
  }
  removeChip(list: 'emails' | 'tags', v: string) { this[list].update((a) => a.filter((x) => x !== v)); }
  editChip(list: 'emails' | 'tags', old: string, e: MatChipEditedEvent) {
    const v = e.value.trim();
    if (!v) return this.removeChip(list, old);
    this[list].update((a) => a.map((x) => (x === old ? v : x)));
  }
  invalidEmail(v: string) { return !this.isEmail(v); }

  // ─── Grid list ──────────────────────────────────────────────────────────
  readonly tiles = [
    { label: 'Carte de la flotte', icon: 'map', cols: 2, rows: 2, tone: 'primary' },
    { label: 'Alertes', icon: 'notifications', cols: 1, rows: 1, tone: 'error' },
    { label: 'Véhicules actifs', icon: 'local_shipping', cols: 1, rows: 1, tone: 'success' },
    { label: 'Interventions', icon: 'build', cols: 1, rows: 1, tone: 'warning' },
    { label: 'CA du mois', icon: 'payments', cols: 1, rows: 1, tone: 'info' },
    { label: 'Dernières requêtes clients', icon: 'support_agent', cols: 4, rows: 1, tone: 'neutral' },
  ];
  gridCols = signal(4);

  // ─── Bottom sheet ───────────────────────────────────────────────────────
  sheetResult = signal('—');
  openSheet() {
    this.bottomSheet.open(ShareSheetComponent, { data: { title: 'Proforma PRO-2026-0412' } })
      .afterDismissed().subscribe((r) => this.sheetResult.set(r ?? 'Fermé sans action'));
  }

  // ─── Virtual scroll ─────────────────────────────────────────────────────
  readonly positions = Array.from({ length: 10_000 }, (_, i) => ({
    id: i + 1,
    plaque: `CI-${String(1000 + ((i * 37) % 9000)).padStart(4, '0')}-${String.fromCharCode(65 + (i % 26))}${String.fromCharCode(65 + ((i * 7) % 26))}`,
    vitesse: (i * 13) % 110,
    online: i % 9 !== 0,
  }));

  // ─── Ripple ─────────────────────────────────────────────────────────────
  rippleCentered = signal(false);
  rippleUnbounded = signal(false);

  toast(msg: string) { this.snackBar.open(msg, 'Fermer', { duration: 2000 }); }

  readonly code = {
    accordion: `
<mat-accordion displayMode="flat">
  <mat-expansion-panel [expanded]="step() === 0" (opened)="setStep(0)">
    <mat-expansion-panel-header>
      <mat-panel-title>Informations client</mat-panel-title>
      <mat-panel-description>Raison sociale, contact</mat-panel-description>
    </mat-expansion-panel-header>
    …
    <mat-action-row>
      <button mat-flat-button color="primary" (click)="nextStep()">Suivant</button>
    </mat-action-row>
  </mat-expansion-panel>
  …
</mat-accordion>`,
    multi: `
<div class="row">
  <button mat-stroked-button (click)="acc.openAll()">Tout déplier</button>
  <button mat-stroked-button (click)="acc.closeAll()">Tout replier</button>
</div>
<mat-accordion #acc="matAccordion" multi displayMode="flat">
  <mat-expansion-panel>…</mat-expansion-panel>
</mat-accordion>`,
    variants: `
<mat-expansion-panel togglePosition="before">…</mat-expansion-panel>
<mat-expansion-panel hideToggle>…</mat-expansion-panel>
<mat-expansion-panel disabled>…</mat-expansion-panel>
<mat-expansion-panel>
  <mat-expansion-panel-header>…</mat-expansion-panel-header>
  <!-- contenu créé uniquement à la première ouverture -->
  <ng-template matExpansionPanelContent>…</ng-template>
</mat-expansion-panel>`,
    faq: `
<mat-accordion class="kit-faq" displayMode="flat">
  @for (item of faq; track item.q) {
    <mat-expansion-panel>
      <mat-expansion-panel-header><mat-panel-title>{{ item.q }}</mat-panel-title></mat-expansion-panel-header>
      <p>{{ item.a }}</p>
    </mat-expansion-panel>
  }
</mat-accordion>

// SCSS — accordion flat : ni ombre, ni écart à l'ouverture, séparateurs 1px
.kit-faq {
  --mat-expansion-container-shape: 0;
  --mat-expansion-container-elevation-shadow: none;
  --mat-expansion-container-background-color: transparent;
  .mat-expansion-panel { box-shadow: none !important; margin: 0 !important; }
  .mat-expansion-panel:not(:last-child) { border-bottom: 1px solid color-mix(in srgb, var(--border-color) 55%, transparent); }
}`,
    tree: `
<mat-tree #tree [dataSource]="data" [childrenAccessor]="childrenAccessor">
  <mat-tree-node *matTreeNodeDef="let node" matTreeNodePadding matTreeNodePaddingIndent="24">…</mat-tree-node>
  <mat-tree-node *matTreeNodeDef="let node; when: hasChild" matTreeNodePadding matTreeNodePaddingIndent="24" isExpandable>
    <button mat-icon-button matTreeNodeToggle>
      <mat-icon>{{ tree.isExpanded(node) ? 'expand_more' : 'chevron_right' }}</mat-icon>
    </button>
    {{ node.name }}
  </mat-tree-node>
</mat-tree>

childrenAccessor = (n: TreeNode) => n.children ?? [];
hasChild = (_: number, n: TreeNode) => !!n.children?.length;`,
    dragList: `
<div cdkDropList class="dd-list" (cdkDropListDropped)="drop($event)">
  @for (item of items(); track item) {
    <div class="dd-item" cdkDrag>
      <mat-icon cdkDragHandle>drag_indicator</mat-icon> {{ item }}
      <div class="dd-placeholder" *cdkDragPlaceholder></div>
    </div>
  }
</div>

drop(e: CdkDragDrop<string[]>) { moveItemInArray(this.items, e.previousIndex, e.currentIndex); }`,
    dragKanban: `
<div cdkDropListGroup>
  <div cdkDropList id="col-todo" [cdkDropListData]="todo" (cdkDropListDropped)="drop($event)">…</div>
  <div cdkDropList id="col-done" [cdkDropListData]="done" [cdkDropListEnterPredicate]="doneGuard" …>…</div>
</div>

drop(e: CdkDragDrop<Item[]>) {
  if (e.previousContainer === e.container) moveItemInArray(e.container.data, e.previousIndex, e.currentIndex);
  else transferArrayItem(e.previousContainer.data, e.container.data, e.previousIndex, e.currentIndex);
}`,
    chips: `
<div class="form-field">
  <label class="field-label">Destinataires</label>
  <div class="field-box chips-box"><mat-icon>alternate_email</mat-icon>
    <mat-chip-grid #grid>
      @for (e of emails(); track e) {
        <mat-chip-row [editable]="true" (edited)="edit(e, $event)" (removed)="remove(e)">
          {{ e }} <button matChipRemove><mat-icon>cancel</mat-icon></button>
        </mat-chip-row>
      }
      <input placeholder="Ajouter…" [matChipInputFor]="grid"
             [matChipInputSeparatorKeyCodes]="separators" matChipInputAddOnBlur
             (matChipInputTokenEnd)="add($event)" />
    </mat-chip-grid>
  </div>
  <span class="field-hint">Entrée ou virgule pour ajouter</span>
</div>`,
    card: `
<mat-card appearance="outlined">
  <mat-card-header>
    <div mat-card-avatar class="avatar">TY</div>
    <mat-card-title>Transports Yao SARL</mat-card-title>
    <mat-card-subtitle>Client depuis 2021 · Abidjan</mat-card-subtitle>
  </mat-card-header>
  <mat-card-content>…</mat-card-content>
  <mat-card-actions align="end">
    <button mat-button>Détails</button>
    <button mat-flat-button color="primary">Contacter</button>
  </mat-card-actions>
</mat-card>`,
    grid: `
<mat-grid-list [cols]="4" rowHeight="110px" gutterSize="12">
  @for (t of tiles; track t.label) {
    <mat-grid-tile [colspan]="t.cols" [rowspan]="t.rows">…</mat-grid-tile>
  }
</mat-grid-list>`,
    sheet: `
this.bottomSheet.open(ShareSheetComponent, { data: { title: 'Proforma PRO-2026-0412' } })
  .afterDismissed().subscribe(action => …);

// Dans ShareSheetComponent
private ref = inject(MatBottomSheetRef);
data = inject(MAT_BOTTOM_SHEET_DATA);
pick(key: string) { this.ref.dismiss(key); }`,
    virtual: `
<cdk-virtual-scroll-viewport itemSize="52" class="vs-viewport">
  <div *cdkVirtualFor="let p of positions; trackBy: trackById" class="vs-row">…</div>
</cdk-virtual-scroll-viewport>

.vs-viewport { height: 320px; }`,
    ripple: `
<div class="surface" matRipple [matRippleCentered]="centered" [matRippleUnbounded]="unbounded"
     matRippleColor="color-mix(in srgb, var(--primary-color) 20%, transparent)">…</div>`,
  };

  trackById = (_: number, p: { id: number }) => p.id;
}
