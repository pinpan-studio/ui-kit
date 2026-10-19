import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { StatCounterComponent } from '../../shared/components/data';
import { CommandPaletteService, KbdComponent } from '../../shared/components/interaction';
import { EX_ACTIVITY, EX_MODULES } from '../../data/static/examples.data';
import { ExAppShellComponent } from './ex-app-shell.component';

/** /examples/app/modules — navigation horizontale, accueil : recherche, raccourcis, chiffres du jour, tuiles de modules, récents, activité. */
@Component({
  selector: 'app-modules-example',
  standalone: true,
  imports: [RouterLink, MaterialModule, EmptyStateComponent, StatCounterComponent, KbdComponent, ExAppShellComponent],
  template: `
    <ex-app-shell nav="topnav" title="Modules">
      <div class="wrap">
        <section class="hero">
          <span class="eyebrow">Vendredi 17 octobre</span>
          <h1>Bonjour Jean</h1>
          <p>Que voulez-vous faire aujourd’hui ?</p>
          <label class="big-search">
            <mat-icon>search</mat-icon>
            <input type="search" placeholder="Filtrer les modules…" [value]="query()" (input)="query.set($any($event.target).value)" />
            <button type="button" class="palette" (click)="palette.open()">Toutes les commandes <app-kbd keys="mod+k" /></button>
          </label>
          <div class="quick">
            @for (q of quick; track q.label) { <a class="chip-filter" [routerLink]="q.path"><mat-icon>{{ q.icon }}</mat-icon>{{ q.label }}</a> }
          </div>
        </section>

        <div class="today">
          @for (t of today; track t.label) {
            <div class="t-item"><span class="t-val"><app-stat-counter [value]="t.value" [format]="t.format" [decimals]="t.decimals" />@if (t.unit) { <small>{{ t.unit }}</small> }</span><span class="t-lbl">{{ t.label }}</span></div>
          }
        </div>

        <div class="section-title"><h2>Modules</h2><span>{{ modules().length }} disponibles</span></div>
        <div class="tiles">
          @for (m of modules(); track m.id) {
            <a class="card tile" [routerLink]="link(m.id)" [style.--c]="m.color">
              <span class="t-ic"><mat-icon>{{ m.icon }}</mat-icon></span>
              <span class="t-txt"><strong>{{ m.label }}@if (m.badge) { <b>{{ m.badge }}</b> }</strong><span>{{ m.description }}</span></span>
              @if (m.count) { <small>{{ m.count }}</small> }
            </a>
          } @empty {
            <div class="card none"><app-empty-state icon="search_off" title="Aucun module" subtitle="Essayez un autre mot-clé ou ouvrez la palette de commandes." /></div>
          }
        </div>

        <div class="bottom">
          <section class="card">
            <div class="card-head"><h2>Récemment consultés</h2></div>
            <div class="rows list">
              @for (r of recent; track r.label) {
                <a [routerLink]="r.path" class="row"><span class="ic-tile"><mat-icon>{{ r.icon }}</mat-icon></span><span class="grow"><strong>{{ r.label }}</strong><small>{{ r.sub }}</small></span><mat-icon class="chev">chevron_right</mat-icon></a>
              }
            </div>
          </section>
          <section class="card">
            <div class="card-head"><h2>Activité</h2><a routerLink="/examples/app/feed">Fil d’équipe</a></div>
            <div class="rows list">
              @for (a of activity; track a.text) {
                <div class="row"><span [class]="'ic-tile tone-' + a.tone"><mat-icon>{{ a.icon }}</mat-icon></span><span class="grow"><strong class="wrap">{{ a.text }}</strong><small>{{ a.who }} · {{ a.at }}</small></span></div>
              }
            </div>
          </section>
        </div>
      </div>
    </ex-app-shell>
  `,
  styleUrls: ['./modules-example.component.scss'],
})
export class ModulesExampleComponent {
  readonly palette = inject(CommandPaletteService);

  readonly query = signal('');
  readonly modules = computed(() => {
    const q = this.query().trim().toLowerCase();
    return EX_MODULES.filter((m) => !q || (m.label + m.description).toLowerCase().includes(q));
  });
  readonly activity = EX_ACTIVITY.slice(0, 4);
  readonly quick = [
    { label: 'Nouvelle facture', icon: 'receipt_long', path: '/examples/app/dashboard' }, { label: 'Ajouter un client', icon: 'person_add', path: '/examples/app/clients' },
    { label: 'Planifier', icon: 'event', path: '/examples/app/board' }, { label: 'Réserver une salle', icon: 'meeting_room', path: '/examples/forms/booking' },
  ];
  readonly today = [
    { label: 'Encaissé aujourd’hui', value: 4.25e6, format: 'compact' as const, decimals: 2, unit: 'FCFA' },
    { label: 'Interventions prévues', value: 14, format: 'number' as const, decimals: 0, unit: '' },
    { label: 'Tickets ouverts', value: 7, format: 'number' as const, decimals: 0, unit: '' },
    { label: 'Taux de service', value: 98.2, format: 'percent' as const, decimals: 1, unit: '' },
  ];
  readonly recent = [
    { label: 'Cacao Plus', sub: 'Client · modifié il y a 10 min', icon: 'business', path: '/examples/app/clients/c-104' },
    { label: 'Clients actifs', sub: 'Liste · 12 résultats', icon: 'group', path: '/examples/app/clients' },
    { label: 'Déploiement Sotra', sub: 'Projet · 10 tâches', icon: 'view_kanban', path: '/examples/app/board' },
    { label: 'Catalogue matériel', sub: 'Catalogue · 12 articles', icon: 'inventory_2', path: '/examples/app/catalog' },
  ];

  link(id: string): string {
    const map: Record<string, string> = { crm: '/examples/app/clients', billing: '/examples/app/dashboard', stock: '/examples/app/catalog', planning: '/examples/app/board', support: '/examples/app/inbox', settings: '/examples/app/settings', docs: '/examples/app/docs', reports: '/examples/app/dashboard' };
    return map[id] ?? '/examples/app/modules';
  }
}
