import { Component, computed, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MaterialModule } from '../../../shared/material.module';
import { DOC_COMPONENTS, TocItem } from '../../shared/doc.components';
import { PaginatorComponent } from '../../../shared/components/paginator/paginator.component';
import { DEMO_MENU } from './demo-menu.data';

interface SidecarSection { title: string; icon: string; items: { _id: string; libelle: string; icon: string }[] }

/** Sous-navigations à sections propres à certains modules ; les autres dérivent de `children`. */
const SIDECAR_SECTIONS: Record<string, SidecarSection[]> = {
  produit: [
    { title: 'Tableau de bord', icon: 'dashboard', items: [{ _id: 'produit-dashboard', libelle: 'Vue générale & tarifs', icon: 'space_dashboard' }] },
    { title: 'Catalogue', icon: 'category', items: [
      { _id: 'produit-produits', libelle: 'Tous les produits', icon: 'inventory_2' },
      { _id: 'produit-forfaits', libelle: 'Forfaits', icon: 'sell' },
    ] },
    { title: 'Paramètres', icon: 'settings', items: [{ _id: 'produit-params', libelle: 'Tarification', icon: 'tune' }] },
  ],
};

/** Galerie /components/navigation — header, sidebars, navbar, onglets, breadcrumb, pagination, stepper, menus. */
@Component({
  selector: 'app-navigation-gallery',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MaterialModule, PaginatorComponent, ...DOC_COMPONENTS],
  templateUrl: './navigation-gallery.component.html',
  styleUrls: ['./navigation-gallery.component.scss'],
})
export class NavigationGalleryComponent {
  readonly toc: TocItem[] = [
    { id: 'header', label: 'Header' }, { id: 'sidebar', label: 'Sidebar' }, { id: 'navbar', label: 'Navbar / en-tête de page' },
    { id: 'tabs', label: 'Tabs' }, { id: 'breadcrumb', label: 'Breadcrumb' }, { id: 'pagination', label: 'Pagination' },
    { id: 'stepper', label: 'Stepper' }, { id: 'menu', label: 'Menu' },
  ];

  readonly sidecarRail = DEMO_MENU.slice(0, 10);
  /** Module dont la sous-navigation est déployée (null = rail seul). */
  sidecarOpen = signal<string | null>(null);
  sidecarItem = signal<string | null>(null);
  readonly sidecarModule = computed(() => this.sidecarRail.find(m => m._id === this.sidecarOpen()) ?? null);
  readonly sidecarSections = computed<SidecarSection[]>(() => {
    const m = this.sidecarModule();
    if (!m) return [];
    return SIDECAR_SECTIONS[m._id] ?? [{ title: m.libelle, icon: m.icon, items: m.children.length ? m.children : [m] }];
  });

  toggleSidecar(id: string): void {
    if (this.sidecarOpen() === id) { this.sidecarOpen.set(null); return; }
    this.sidecarOpen.set(id);
    this.sidecarItem.set(this.sidecarSections()[0]?.items[0]?._id ?? null);
  }

  tabIndex = 0;
  pillTab = signal('infos');

  page = signal(3);
  pageSize = signal(25);
  readonly total = 1284;
  smallPage = signal(1);

  stepForm1 = new FormGroup({ client: new FormControl('Bolloré Logistics CI', Validators.required) });
  stepForm2 = new FormGroup({ periode: new FormControl('', Validators.required) });

  readonly code = {
    header: `
<mat-toolbar class="shell-toolbar">
  <button mat-icon-button (click)="drawer.toggle()"><mat-icon>menu</mat-icon></button>
  <span class="page-title">{{ pageTitle() }}</span>
  <span class="spacer"></span>
  <button mat-icon-button (click)="toggleTheme()"><mat-icon>dark_mode</mat-icon></button>
  <button mat-icon-button><mat-icon [matBadge]="7" matBadgeColor="primary">checklist</mat-icon></button>
  <button mat-icon-button><mat-icon [matBadge]="3" matBadgeColor="warn">notifications</mat-icon></button>
  <button mat-icon-button class="avatar-btn"><div class="avatar">JK</div></button>
</mat-toolbar>`,
    sidecar: `
<nav class="sidecar" [class.open]="!!openModule()">
  <div class="sidecar-rail">
    @for (item of menuItems; track item._id) {
      <button class="nav-rail-item" [class.active]="openModule()?._id === item._id"
              (click)="toggle(item)" [matTooltip]="item.libelle" matTooltipPosition="right">
        <mat-icon>{{ item.icon }}</mat-icon>
      </button>
    }
  </div>
  <div class="sidecar-panel">
    @if (openModule(); as module) {
      <div class="sidenav-header">
        <div class="header-icon-box"><mat-icon>{{ module.icon }}</mat-icon></div>
        <span class="app-title">{{ module.libelle }}</span>
        <button mat-icon-button (click)="openModule.set(null)"><mat-icon>chevron_left</mat-icon></button>
      </div>
      <div class="sidenav-menu-wrapper">
        @for (child of module.children; track child._id) {
          <a class="menu-item" [routerLink]="['/main', child.$object?.type]" routerLinkActive="active">
            <mat-icon class="item-icon">{{ child.icon }}</mat-icon><span class="item-label">{{ child.libelle }}</span>
          </a>
        }
      </div>
    }
  </div>
</nav>`,
    pageHeader: `
<div class="page-header">
  <div class="page-title-area">
    <div class="title-row">
      <button mat-icon-button class="drawer-toggle-btn"><mat-icon>menu</mat-icon></button>
      <div>
        <h1>Registre des Produits</h1>
        <p>Catalogue des offres — 24 produit(s)</p>
      </div>
    </div>
  </div>
  <div class="page-actions">…</div>
</div>`,
    paginator: `
<app-paginator
  [total]="total" [page]="page" [itemPerPage]="pageSize"
  [pageSizeOptions]="[10, 25, 50, 100]"
  (pageChange)="page = $event" (pageSizeChange)="pageSize = $event; page = 1" />`,
    breadcrumb: `
<div class="breadcrumb">SC REGISTRY / CONTRATS</div>
<h1>Contrat CTR-2026-0042</h1>`,
  };
}
