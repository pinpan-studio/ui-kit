import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { DOC_COMPONENTS } from '../shared/doc.components';

interface LayoutCard {
  id: string;
  title: string;
  icon: string;
  file: string;
  description: string;
  wire: 'shell' | 'module' | 'auth' | 'kit' | 'public' | 'drawer' | 'dialog' | 'detail';
  links: { label: string; path: string }[];
}

/** /layouts — layouts complets du projet, avec maquette schématique et liens vers les exemples vivants. */
@Component({
  selector: 'app-layouts-gallery',
  standalone: true,
  imports: [RouterLink, MaterialModule, ...DOC_COMPONENTS],
  templateUrl: './layouts-gallery.component.html',
  styleUrls: ['./layouts-gallery.component.scss'],
})
export class LayoutsGalleryComponent {
  readonly layouts: LayoutCard[] = [
    { id: 'shell', title: 'Shell applicatif', icon: 'space_dashboard', wire: 'shell', file: 'layouts/app-shell/app-shell.component.*',
      description: 'Rail d’icônes (modules) + barre d’outils sticky (titre, thème, tâches, notifications, compte) + contenu routé + drawer droit. En mobile, le rail passe en mode « over ».',
      links: [{ label: 'Ouvrir le shell', path: '/main' }] },
    { id: 'detail', title: 'Fiche détail', icon: 'article', wire: 'detail', file: 'styles/_detail-page.scss',
      description: 'En-tête (retour, titre, statut, actions), grille KPI, colonnes principale + latérale de panneaux, onglets de sous-listes.',
      links: [] },
    { id: 'drawer', title: 'Drawer droit', icon: 'right_panel_open', wire: 'drawer', file: 'layouts/app-shell/panels/*',
      description: 'Panneau flottant 360px : paramètres du compte, notifications, tâches du jour. Ouvert depuis la barre d’outils du shell.',
      links: [{ label: 'Ouvrir l’application', path: '/main' }, { label: 'Démo drawer', path: '/components/feedback' }] },
    { id: 'dialog', title: 'Dialogs', icon: 'open_in_new', wire: 'dialog', file: 'shared/components/{crud-dialog,confirm-dialog,dialogs}',
      description: 'Modales de formulaire (CrudDialog, panelClass assac-dialog-panel), confirmations, messages poussés, dialogs de compte.',
      links: [{ label: 'Galerie Feedback', path: '/components/feedback' }, { label: 'Formulaire en modale', path: '/components/forms' }] },
    { id: 'kit', title: 'Catalogue (UI Kit)', icon: 'widgets', wire: 'kit', file: 'layouts/kit-layout/kit-layout.component.*',
      description: 'Layout de ce catalogue : sidebar arborescente recherchable (Showcase, Components, Layouts, Pages), barre supérieure, contenu documentaire.',
      links: [{ label: 'UI Showcase', path: '/ui-showcase' }, { label: 'Pages', path: '/pages' }] },
  ];
}
