import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MaterialModule } from '../../../shared/material.module';
import { DOC_COMPONENTS, TocItem } from '../../shared/doc.components';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

/** Galerie /components/layout — structures de page réutilisables (classes de styles/detail-page et entity-list). */
@Component({
  selector: 'app-layout-gallery',
  standalone: true,
  imports: [RouterLink, MaterialModule, StatusBadgeComponent, ...DOC_COMPONENTS],
  templateUrl: './layout-gallery.component.html',
  styleUrls: ['./layout-gallery.component.scss'],
})
export class LayoutGalleryComponent {
  readonly toc: TocItem[] = [
    { id: 'page', label: 'Page layout' }, { id: 'dashboard', label: 'Dashboard layout' }, { id: 'two-cols', label: 'Two columns' },
    { id: 'three-cols', label: 'Three columns' }, { id: 'sidebar', label: 'Sidebar layout' }, { id: 'full', label: 'Full width' },
    { id: 'sections', label: 'Card sections' }, { id: 'responsive', label: 'Responsive containers' }, { id: 'breakpoints', label: 'Breakpoints' },
  ];
  sidebarOpen = signal(true);
  width = signal(100);

  readonly breakpoints = [
    { mixin: '@include xs / sm / md', range: '≤ 375 / 480 / 600px', usage: 'Petits mobiles : 1 colonne, textes réduits' },
    { mixin: '@include mobile', range: '≤ 768px', usage: 'Sidenavs en mode over, grilles 1 colonne, titres masqués' },
    { mixin: '@include lg', range: '≤ 960px', usage: 'Tablette paysage : bouton de fermeture du menu de module' },
    { mixin: '@include tablet', range: '≤ 1024px', usage: 'Grilles 2 colonnes, actions qui passent à la ligne' },
    { mixin: '@include xl / xxl', range: '≤ 1280 / 1440px', usage: 'Grands écrans : densité des grilles' },
    { mixin: '@include desktop', range: '≥ 1025px', usage: 'Mise en page desktop complète' },
    { mixin: '@include from-sm … from-2xl', range: 'min-width', usage: 'Approche mobile-first' },
    { mixin: '@include responsive-grid(4, 2, 1)', range: '—', usage: 'Grille 4/2/1 colonnes prête à l’emploi' },
  ];

  readonly code = {
    page: `
<div class="page-container">          <!-- max-width 1440px, padding 24px -->
  <div class="page-header">…</div>    <!-- titre + actions -->
  <div class="toolbar-search-filters">…</div>
  <div class="m3-table-container">…</div>
  <app-paginator … />
</div>
/* SCSS : @import 'styles/entity-list';  ou  @import 'styles/detail-page'; */`,
    detail: `
<div class="detail-grid">          <!-- 2fr / 1fr, 1 colonne < 1280px -->
  <div class="detail-main"> <div class="panel-card">…</div> </div>
  <aside class="detail-aside"> <div class="panel-card">…</div> </aside>
</div>`,
    sections: `
<div class="panel-card">
  <div class="section-header-flex">
    <div class="section-title-box"><mat-icon>business</mat-icon><h3>Informations</h3></div>
    <button mat-icon-button class="action-icon-btn"><mat-icon>edit</mat-icon></button>
  </div>
  <div class="info-grid">
    <div class="info-field"><span class="lbl">Raison sociale</span><span class="val">…</span></div>
  </div>
</div>`,
    module: `
<mat-sidenav-container class="module-sidenav-container">
  <mat-sidenav #drawer mode="side" opened class="module-sidenav">…sections + items…</mat-sidenav>
  <div class="module-content"><router-outlet /></div>
</mat-sidenav-container>
<!-- Les pages enfants appellent ModuleDrawerService.toggle() pour ouvrir/fermer le menu. -->`,
  };
}
