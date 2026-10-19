import { Routes } from '@angular/router';

/** /harnais — accueil (nouvelle conversation) et /harnais/:id — conversation existante. */
export default [
  { path: '', title: 'Harnais', loadComponent: () => import('./harnais.component').then((m) => m.HarnaisComponent) },
  { path: ':id', title: 'Harnais', loadComponent: () => import('./harnais.component').then((m) => m.HarnaisComponent) },
] satisfies Routes;
