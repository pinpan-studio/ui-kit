import { Component, inject, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../../shared/material.module';
import { DOC_COMPONENTS, TocItem } from '../../shared/doc.components';
import { ViewModeToggleComponent, ViewMode } from '../../../shared/components/view-mode-toggle/view-mode-toggle.component';

/** Galerie /components/buttons — variantes de boutons du projet. */
@Component({
  selector: 'app-buttons-gallery',
  standalone: true,
  imports: [MaterialModule, ViewModeToggleComponent, ...DOC_COMPONENTS],
  templateUrl: './buttons-gallery.component.html',
  styleUrls: ['./buttons-gallery.component.scss'],
})
export class ButtonsGalleryComponent {
  private snackBar = inject(MatSnackBar);

  readonly toc: TocItem[] = [
    { id: 'variants', label: 'Variantes' }, { id: 'states', label: 'États' }, { id: 'icon', label: 'Icon buttons' },
    { id: 'header', label: 'Actions de page' }, { id: 'segmented', label: 'Segmentés & toggles' },
    { id: 'menu', label: 'Menu & split' }, { id: 'fab', label: 'FAB' }, { id: 'sizes', label: 'Tailles & formes' },
  ];

  loading = signal<string | null>(null);
  viewMode: ViewMode = 'list';
  tab = 'mois';
  period = 'month';

  simulate(key: string): void {
    this.loading.set(key);
    setTimeout(() => {
      this.loading.set(null);
      this.snackBar.open('Action simulée — aucune requête envoyée', 'Fermer', { duration: 2000 });
    }, 1400);
  }

  readonly code = {
    variants: `
<button mat-flat-button color="primary">Primary</button>
<button mat-stroked-button color="primary">Secondary</button>
<button mat-stroked-button>Outline</button>
<button mat-button color="primary">Ghost</button>
<button mat-flat-button color="warn">Danger</button>
<button mat-stroked-button color="warn">Danger outline</button>
<button mat-flat-button class="btn-success">Success</button>`,
    loading: `
<button mat-flat-button color="primary" [disabled]="loading()" (click)="save()">
  @if (loading()) { <mat-spinner diameter="18"></mat-spinner> } @else { <mat-icon>save</mat-icon> }
  <span>{{ loading() ? 'Enregistrement…' : 'Enregistrer' }}</span>
</button>`,
    icon: `
<button mat-icon-button class="action-icon-btn" matTooltip="Options"><mat-icon>more_vert</mat-icon></button>
<button mat-icon-button class="refresh-btn" matTooltip="Rafraîchir"><mat-icon>refresh</mat-icon></button>`,
    header: `
<div class="page-actions">
  <app-view-mode-toggle [(mode)]="viewMode" />
  <button mat-icon-button class="refresh-btn" matTooltip="Rafraîchir"><mat-icon>refresh</mat-icon></button>
  <button mat-raised-button color="primary" class="create-btn"><mat-icon>add</mat-icon> Nouveau produit</button>
</div>`,
    segmented: `
<div class="m3-filter-toggle">
  <button type="button" [class.active]="period === 'month'" (click)="period = 'month'">Mois</button>
  <button type="button" [class.active]="period === 'year'" (click)="period = 'year'">Année</button>
</div>

<div class="chart-tab-toggles">
  <button class="tab-toggle-btn" [class.active]="tab === 'mois'" (click)="tab = 'mois'">Mois</button>
  <button class="tab-toggle-btn" [class.active]="tab === 'annee'" (click)="tab = 'annee'">Année</button>
</div>`,
    menu: `
<button mat-stroked-button [matMenuTriggerFor]="menu">
  <mat-icon>file_download</mat-icon> Exporter <mat-icon iconPositionEnd>expand_more</mat-icon>
</button>
<mat-menu #menu="matMenu" xPosition="before">
  <button mat-menu-item><mat-icon>table_view</mat-icon><span>Excel</span></button>
  <button mat-menu-item><mat-icon>picture_as_pdf</mat-icon><span>PDF</span></button>
  <mat-divider></mat-divider>
  <button mat-menu-item class="menu-danger"><mat-icon>delete</mat-icon><span>Supprimer</span></button>
</mat-menu>`,
  };
}
