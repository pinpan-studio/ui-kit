import { Component, computed, effect, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../shared/material.module';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { FilterDropdownComponent, FilterOption } from '../../shared/components/filter-dropdown/filter-dropdown.component';
import { ViewMode, ViewModeToggleComponent } from '../../shared/components/view-mode-toggle/view-mode-toggle.component';
import { PaginatorComponent } from '../../shared/components/paginator/paginator.component';
import { BulkAction, DataColumn, DataTableComponent } from '../../shared/components/data';
import { CLIENT_STATUS, ClientStatus, EX_CLIENTS, ExClient } from '../../data/static/examples.data';
import { ExAppShellComponent } from './ex-app-shell.component';
import { hue, initials } from './ex-utils';

/**
 * /examples/app/clients — liste de données : onglets de statut, filtres déroulants, table avancée
 * (tri, colonnes, densité, sélection et actions groupées, export, ligne dépliable) ou cartes paginées.
 */
@Component({
  selector: 'app-clients-example',
  standalone: true,
  imports: [DecimalPipe, MaterialModule, StatusBadgeComponent, EmptyStateComponent, FilterDropdownComponent, ViewModeToggleComponent,
    PaginatorComponent, DataTableComponent, ExAppShellComponent],
  template: `
    <ex-app-shell nav="sidebar" title="Clients" crumb="CRM">
      <div class="page-head">
        <div class="titles">
          <span class="eyebrow">CRM</span>
          <h1>Clients</h1>
          <p>{{ all.length }} comptes · {{ totalRevenue() / 1e6 | number: '1.0-0' }} M FCFA de chiffre d’affaires cumulé</p>
        </div>
        <div class="actions">
          <button mat-stroked-button><mat-icon>upload</mat-icon>Importer</button>
          <button mat-flat-button color="primary"><mat-icon>add</mat-icon>Nouveau client</button>
        </div>
      </div>

      <nav class="status-tabs" aria-label="Filtrer par statut">
        <button [class.on]="!statusFilter()" (click)="statusFilter.set('')">Tous<span>{{ all.length }}</span></button>
        @for (s of statuses; track s) {
          <button [class.on]="statusFilter() === s" (click)="statusFilter.set(s)">{{ status[s].label }}<span>{{ countBy(s) }}</span></button>
        }
      </nav>

      <div class="filters">
        <app-filter-dropdown labelPrefix="Ville" [options]="cityOptions" [(value)]="city" />
        <app-filter-dropdown labelPrefix="Responsable" [options]="ownerOptions" [(value)]="owner" />
        @if (city() || owner()) { <button mat-button (click)="city.set(null); owner.set(null)">Effacer les filtres</button> }
        <span class="spacer"></span>
        <app-view-mode-toggle [(mode)]="view" />
      </div>

      @if (!rows().length) {
        <div class="card"><app-empty-state icon="search_off" title="Aucun client" subtitle="Aucun compte ne correspond à ces critères." /></div>
      } @else if (view() === 'list') {
        <app-data-table [rows]="rows()" [columns]="columns" selectable [bulkActions]="bulk" [pageSize]="10" maxHeight="none"
          clickable (rowClick)="open($event)" (bulkAction)="onBulk($event)">
          <ng-template #expanded let-row>
            <div class="preview">
              <span><small>Contact</small>{{ row.contact }}</span>
              <span><small>Téléphone</small>{{ row.phone }}</span>
              <span><small>Factures</small>{{ row.invoices }}</span>
              <span><small>Responsable</small>{{ row.owner }}</span>
              <button mat-stroked-button (click)="open(row)">Ouvrir la fiche<mat-icon iconPositionEnd>arrow_forward</mat-icon></button>
            </div>
          </ng-template>
        </app-data-table>
      } @else {
        <div class="cards">
          @for (c of pageRows(); track c.id) {
            <button type="button" class="card ccard" (click)="open(c)">
              <div class="cc-top">
                <span class="ava" [style.background]="hue(c.name)">{{ initials(c.name) }}</span>
                <span class="grow"><strong>{{ c.name }}</strong><small>{{ c.sector }} · {{ c.city }}</small></span>
                <app-status-badge [label]="status[c.status].label" [color]="status[c.status].color" />
              </div>
              <dl class="cc-meta">
                <div><dt>Contact</dt><dd>{{ c.contact }}</dd></div>
                <div><dt>Factures</dt><dd>{{ c.invoices }}</dd></div>
                <div><dt>Chiffre d’affaires</dt><dd class="num">{{ c.revenue / 1e6 | number: '1.1-1' }} M FCFA</dd></div>
              </dl>
            </button>
          }
        </div>
        <app-paginator [total]="rows().length" [page]="page()" [itemPerPage]="size()" [pageSizeOptions]="[6, 12, 24]"
          (pageChange)="page.set($event)" (pageSizeChange)="size.set($event); page.set(1)" />
      }
    </ex-app-shell>
  `,
  styleUrls: ['./clients-example.component.scss'],
})
export class ClientsExampleComponent {
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  readonly all = EX_CLIENTS;
  readonly status = CLIENT_STATUS;
  readonly statuses = Object.keys(CLIENT_STATUS) as ClientStatus[];
  readonly hue = hue;
  readonly initials = initials;

  readonly statusFilter = signal<ClientStatus | ''>('');
  readonly city = signal<string | null>(null);
  readonly owner = signal<string | null>(null);
  readonly view = signal<ViewMode>(window.innerWidth < 768 ? 'card' : 'list');
  readonly page = signal(1);
  readonly size = signal(6);

  readonly cityOptions: FilterOption[] = this.optionsFor('city');
  readonly ownerOptions: FilterOption[] = this.optionsFor('owner');

  readonly columns: DataColumn<ExClient>[] = [
    { key: 'name', label: 'Client', width: 220, sticky: 'start', required: true },
    { key: 'sector', label: 'Secteur', width: 140 },
    { key: 'contact', label: 'Contact', width: 170 },
    { key: 'email', label: 'E-mail', width: 230, hidden: true },
    { key: 'city', label: 'Ville', width: 120 },
    { key: 'status', label: 'Statut', width: 110, type: 'badge', format: (r) => CLIENT_STATUS[r.status].label, tone: (r) => CLIENT_STATUS[r.status].color },
    { key: 'invoices', label: 'Factures', width: 90, type: 'number' },
    { key: 'revenue', label: 'Chiffre d’affaires', width: 150, type: 'currency', total: true },
    { key: 'since', label: 'Client depuis', width: 130, type: 'date', hidden: true },
  ];
  readonly bulk: BulkAction[] = [
    { id: 'mail', label: 'E-mail', icon: 'mail' },
    { id: 'tag', label: 'Étiqueter', icon: 'label' },
    { id: 'delete', label: 'Supprimer', icon: 'delete', tone: 'error' },
  ];

  readonly totalRevenue = computed(() => this.all.reduce((s, c) => s + c.revenue, 0));
  readonly rows = computed(() => this.all.filter((c) =>
    (!this.statusFilter() || c.status === this.statusFilter()) && (!this.city() || c.city === this.city()) && (!this.owner() || c.owner === this.owner())));
  readonly pageRows = computed(() => this.rows().slice((this.page() - 1) * this.size(), this.page() * this.size()));

  constructor() {
    effect(() => { this.rows(); this.page.set(1); });
  }

  countBy(s: ClientStatus): number { return this.all.filter((c) => c.status === s).length; }
  open(c: ExClient): void { this.router.navigate(['/examples/app/clients', c.id]); }
  onBulk(e: { action: string; rows: ExClient[] }): void {
    const verb: Record<string, string> = { mail: 'E-mail préparé pour', tag: 'Étiquette ajoutée à', delete: 'Suppression simulée de' };
    this.snack.open(`${verb[e.action]} ${e.rows.length} client(s)`, 'OK', { duration: 2500 });
  }

  private optionsFor(key: 'city' | 'owner'): FilterOption[] {
    const values = [...new Set(EX_CLIENTS.map((c) => c[key]))].sort();
    return values.map((v) => ({ value: v, label: v, count: EX_CLIENTS.filter((c) => c[key] === v).length }));
  }
}
