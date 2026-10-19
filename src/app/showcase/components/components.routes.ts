import { Routes } from '@angular/router';

/** Galerie de composants : /components/<catégorie>. */
export default [
  { path: '', pathMatch: 'full', loadComponent: () => import('./components-index.component').then((m) => m.ComponentsIndexComponent), title: 'Composants' },
  { path: 'typography', loadComponent: () => import('./typography/typography-gallery.component').then((m) => m.TypographyGalleryComponent), title: 'Typographie' },
  { path: 'forms', loadComponent: () => import('./forms/forms-gallery.component').then((m) => m.FormsGalleryComponent), title: 'Formulaires' },
  { path: 'fields', loadComponent: () => import('./fields/fields-gallery.component').then((m) => m.FieldsGalleryComponent), title: 'Champs avancés' },
  { path: 'buttons', loadComponent: () => import('./buttons/buttons-gallery.component').then((m) => m.ButtonsGalleryComponent), title: 'Boutons' },
  { path: 'navigation', loadComponent: () => import('./navigation/navigation-gallery.component').then((m) => m.NavigationGalleryComponent), title: 'Navigation' },
  { path: 'data', loadComponent: () => import('./data/data-gallery.component').then((m) => m.DataGalleryComponent), title: 'Data display' },
  { path: 'feedback', loadComponent: () => import('./feedback/feedback-gallery.component').then((m) => m.FeedbackGalleryComponent), title: 'Feedback' },
  { path: 'planning', loadComponent: () => import('./planning/planning-gallery.component').then((m) => m.PlanningGalleryComponent), title: 'Planning' },
  { path: 'maps', loadComponent: () => import('./maps/maps-gallery.component').then((m) => m.MapsGalleryComponent), title: 'Cartes' },
  { path: 'media', loadComponent: () => import('./media/media-gallery.component').then((m) => m.MediaGalleryComponent), title: 'Médias' },
  { path: 'interactions', loadComponent: () => import('./interactions/interactions-gallery.component').then((m) => m.InteractionsGalleryComponent), title: 'Interactions' },
  { path: 'material', loadComponent: () => import('./material/material-gallery.component').then((m) => m.MaterialGalleryComponent), title: 'Material & CDK' },
  { path: 'layout', loadComponent: () => import('./layout/layout-gallery.component').then((m) => m.LayoutGalleryComponent), title: 'Layout' },
] satisfies Routes;
