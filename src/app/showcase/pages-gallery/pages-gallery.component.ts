import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { DOC_COMPONENTS } from '../shared/doc.components';
import { PAGE_REGISTRY } from '../../core/models/page-registry';
import { PageEntry, PageGroup } from '../../core/models/page-entry';

const KIND_LABEL: Record<NonNullable<PageEntry['kind']>, string> = {
  dashboard: 'Tableau de bord', list: 'Liste', detail: 'Détail', form: 'Formulaire', wizard: 'Assistant',
  calendar: 'Calendrier', kanban: 'Kanban', settings: 'Paramètres', auth: 'Authentification', public: 'Publique', other: 'Autre',
};
const KIND_ICON: Record<NonNullable<PageEntry['kind']>, string> = {
  dashboard: 'dashboard', list: 'view_list', detail: 'article', form: 'edit_note', wizard: 'linear_scale',
  calendar: 'calendar_month', kanban: 'view_kanban', settings: 'settings', auth: 'lock', public: 'public', other: 'web',
};

/** /pages — galerie de toutes les pages statiques, groupées par module. */
@Component({
  selector: 'app-pages-gallery',
  standalone: true,
  imports: [RouterLink, MaterialModule, ...DOC_COMPONENTS],
  templateUrl: './pages-gallery.component.html',
  styleUrls: ['./pages-gallery.component.scss'],
})
export class PagesGalleryComponent {
  readonly kindLabel = KIND_LABEL;
  readonly kindIcon = KIND_ICON;
  readonly kinds = Object.keys(KIND_LABEL) as NonNullable<PageEntry['kind']>[];

  query = signal('');
  kind = signal<string>('');
  moduleFilter = signal<string>('');

  readonly groups = computed<PageGroup[]>(() => {
    const q = this.query().toLowerCase().trim();
    const k = this.kind();
    const m = this.moduleFilter();
    return PAGE_REGISTRY
      .filter((g) => !m || g.id === m)
      .map((g) => ({
        ...g,
        pages: g.pages.filter((p) =>
          (!k || p.kind === k) &&
          (!q || p.label.toLowerCase().includes(q) || p.path.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q) || g.label.toLowerCase().includes(q))),
      }))
      .filter((g) => g.pages.length > 0 || (!q && !k));
  });

  readonly count = computed(() => this.groups().reduce((n, g) => n + g.pages.length, 0));
  readonly toc = computed(() => this.groups().map((g) => ({ id: g.id, label: `${g.label} (${g.pages.length})` })));
  readonly allGroups = PAGE_REGISTRY;

  reset(): void { this.query.set(''); this.kind.set(''); this.moduleFilter.set(''); }
}
