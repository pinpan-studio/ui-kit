import { Routes } from '@angular/router';
import { AppShellComponent } from './layouts/app-shell/app-shell.component';
import { KitLayoutComponent } from './layouts/kit-layout/kit-layout.component';

/**
 * Routes du UI Kit.
 *
 * - Catalogue (layout "kit") : /ui-showcase, /components/*, /pages, /layouts, /showcases
 * - Shell applicatif (layout "shell") : /main — vide pour l'instant
 * - Harnais (module autonome, sans layout parent) : /harnais/**
 * - Exemples autonomes (aperçus des showcases) : /examples/**
 */
export const APP_ROUTES: Routes = [
  { path: '', redirectTo: 'ui-showcase', pathMatch: 'full' },

  {
    path: '',
    component: KitLayoutComponent,
    children: [
      { path: 'ui-showcase', title: 'UI Showcase', loadComponent: () => import('./showcase/ui-showcase/ui-showcase.component').then((m) => m.UiShowcaseComponent) },
      { path: 'theme-studio', title: 'Studio de thème', loadComponent: () => import('./showcase/theme-studio/theme-studio.component').then((m) => m.ThemeStudioComponent) },
      { path: 'pages', title: 'Galerie des pages', loadComponent: () => import('./showcase/pages-gallery/pages-gallery.component').then((m) => m.PagesGalleryComponent) },
      { path: 'page-showcase', redirectTo: 'pages', pathMatch: 'full' },
      { path: 'showcases', title: 'Showcases', loadComponent: () => import('./showcase/showcases/showcases-gallery.component').then((m) => m.ShowcasesGalleryComponent) },
      { path: 'showcases/:id', title: 'Showcase', loadComponent: () => import('./showcase/showcases/showcase-viewer.component').then((m) => m.ShowcaseViewerComponent) },
      { path: 'layouts', title: 'Layouts', loadComponent: () => import('./showcase/layouts-gallery/layouts-gallery.component').then((m) => m.LayoutsGalleryComponent) },
      { path: 'components', loadChildren: () => import('./showcase/components/components.routes') },
    ],
  },

  {
    path: 'main',
    component: AppShellComponent,
    children: [],
  },

  // Module autonome, hors du shell /main (aucune toolbar, rail ni drawer hérités).
  { path: 'harnais', loadChildren: () => import('./harnais/harnais.routes') },

  // Écrans d'exemple autonomes (authentification, dispositions d'application), affichés dans /showcases.
  { path: 'examples', loadChildren: () => import('./examples/examples.routes') },

  { path: '**', redirectTo: 'ui-showcase' },
];
