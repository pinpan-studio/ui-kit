import { Component, computed, input } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { AuditEntry, AuditLogComponent, DataColumn, DataTableComponent, DescriptionItem, DescriptionListComponent, TrendComponent } from '../../shared/components/data';
import { CopyFieldComponent } from '../../shared/components/fields';
import { CommentThreadComponent } from '../../shared/components/content';
import { CLIENT_STATUS, EX_CLIENTS, EX_INVOICES, ExInvoice } from '../../data/static/examples.data';
import { FEED_COMMENTS, ME, PEOPLE } from '../../data/static/content.data';
import { ExAppShellComponent } from './ex-app-shell.component';
import { hue, initials } from './ex-utils';

/** /examples/app/clients/:id — fiche détail : en-tête d'entité, indicateurs, onglets (aperçu, factures, historique, notes), colonne latérale. */
@Component({
  selector: 'app-client-detail-example',
  standalone: true,
  imports: [DatePipe, DecimalPipe, RouterLink, MaterialModule, StatusBadgeComponent, AuditLogComponent, DataTableComponent, DescriptionListComponent,
    TrendComponent, CopyFieldComponent, CommentThreadComponent, ExAppShellComponent],
  template: `
    <ex-app-shell nav="sidebar" [title]="client().name" crumb="Clients">
      @let c = client();
      <a routerLink="/examples/app/clients" class="back"><mat-icon>arrow_back</mat-icon>Clients</a>

      <header class="entity">
        <span class="ava lg" [style.background]="hue(c.name)">{{ initials(c.name) }}</span>
        <div class="e-text">
          <div class="e-title"><h1>{{ c.name }}</h1><app-status-badge [label]="status[c.status].label" [color]="status[c.status].color" /></div>
          <p><span>{{ c.sector }}</span><span>{{ c.city }}, Côte d’Ivoire</span><span>Client depuis {{ c.since | date: 'MMMM yyyy' }}</span></p>
        </div>
        <div class="e-actions">
          <button mat-stroked-button><mat-icon>edit</mat-icon>Modifier</button>
          <button mat-flat-button color="primary"><mat-icon>receipt_long</mat-icon>Facturer</button>
          <button mat-icon-button [matMenuTriggerFor]="more" aria-label="Plus d’actions"><mat-icon>more_vert</mat-icon></button>
          <mat-menu #more="matMenu" class="m3-dropdown-menu">
            <button mat-menu-item><mat-icon>mail</mat-icon>Envoyer un relevé</button>
            <button mat-menu-item><mat-icon>archive</mat-icon>Archiver</button>
            <mat-divider />
            <button mat-menu-item class="danger"><mat-icon>block</mat-icon>Suspendre le compte</button>
          </mat-menu>
        </div>
      </header>

      <div class="kpis">
        @for (k of kpis(); track k.label) {
          <div class="card kpi">
            <span class="k-label">{{ k.label }}</span>
            <span class="k-val">{{ k.value }}@if (k.unit) { <small>{{ k.unit }}</small> }</span>
            <span class="k-foot"><app-trend [value]="k.trend" [unit]="k.trendUnit" [inverse]="k.inverse" />{{ k.hint }}</span>
          </div>
        }
      </div>

      <div class="cols">
        <section class="card main-col">
          <mat-tab-group mat-stretch-tabs="false" mat-align-tabs="start" animationDuration="150ms">
            <mat-tab label="Aperçu">
              <div class="pane">
                <p class="lead">Compte stratégique du secteur {{ c.sector.toLowerCase() }}, suivi par {{ c.owner }}. Le contrat cadre couvre l’ensemble des sites de {{ c.city }} et arrive à échéance en mars 2027.</p>
                <h3>Contrat</h3>
                <app-description-list [items]="contract()" [columns]="3" />
                <h3>Objectifs 2026</h3>
                <div class="goals">
                  @for (g of goals; track g.label) {
                    <div class="goal"><div class="g-top"><span>{{ g.label }}</span><strong class="tabular">{{ g.value }} %</strong></div><mat-progress-bar mode="determinate" [value]="g.value" /></div>
                  }
                </div>
              </div>
            </mat-tab>
            <mat-tab>
              <ng-template mat-tab-label>Factures<span class="tab-n">{{ invoices.length }}</span></ng-template>
              <div class="pane flush">
                <app-data-table [rows]="invoices" [columns]="invoiceCols" rowKey="ref" [searchable]="false" [pageSize]="8" maxHeight="none" />
              </div>
            </mat-tab>
            <mat-tab label="Historique">
              <div class="pane"><app-audit-log [entries]="history()" /></div>
            </mat-tab>
            <mat-tab>
              <ng-template mat-tab-label>Notes<span class="tab-n">{{ notes.length }}</span></ng-template>
              <div class="pane"><app-comment-thread title="Notes internes" [comments]="notes" [me]="me" [mentionables]="people" compact /></div>
            </mat-tab>
          </mat-tab-group>
        </section>

        <aside class="side-col">
          <section class="card">
            <div class="card-head"><h2>Contact principal</h2></div>
            <div class="card-body contact">
              <div class="person"><span class="ava" [style.background]="hue(c.contact)">{{ initials(c.contact) }}</span><span><strong>{{ c.contact }}</strong><small>Responsable achats</small></span></div>
              <app-copy-field [value]="c.email" icon="mail" label="l’e-mail" />
              <app-copy-field [value]="c.phone" icon="call" label="le téléphone" />
            </div>
          </section>
          <section class="card">
            <div class="card-head"><h2>Informations</h2></div>
            <div class="card-body"><app-description-list [items]="info()" [columns]="1" layout="horizontal" /></div>
          </section>
          <section class="card">
            <div class="card-head"><h2>Étiquettes</h2></div>
            <div class="card-body"><mat-chip-set aria-label="Étiquettes">@for (t of tags; track t) { <mat-chip>{{ t }}</mat-chip> }</mat-chip-set></div>
          </section>
        </aside>
      </div>
    </ex-app-shell>
  `,
  styleUrls: ['./client-detail-example.component.scss'],
})
export class ClientDetailExampleComponent {
  id = input<string>('');

  readonly client = computed(() => EX_CLIENTS.find((c) => c.id === this.id()) ?? EX_CLIENTS[3]);
  readonly status = CLIENT_STATUS;
  readonly invoices = EX_INVOICES;
  readonly notes = FEED_COMMENTS[0];
  readonly me = ME;
  readonly people = PEOPLE;
  readonly hue = hue;
  readonly initials = initials;
  readonly tags = ['Grand compte', 'Contrat cadre', 'Multi-sites'];
  readonly goals = [
    { label: 'Objectif annuel de chiffre d’affaires', value: 72 },
    { label: 'Taux d’encaissement', value: 88 },
    { label: 'Déploiement des sites', value: 45 },
  ];

  readonly kpis = computed(() => [
    { label: 'Chiffre d’affaires', value: (this.client().revenue / 1e6).toLocaleString('fr-FR', { maximumFractionDigits: 1 }), unit: 'M FCFA', trend: 9.2, trendUnit: ' %', inverse: false, hint: 'sur 12 mois' },
    { label: 'Factures émises', value: String(this.client().invoices), unit: '', trend: 3, trendUnit: '', inverse: false, hint: 'ce trimestre' },
    { label: 'Délai de paiement', value: '27', unit: 'jours', trend: 4, trendUnit: ' j', inverse: true, hint: 'vs moyenne' },
    { label: 'Satisfaction', value: '4,6', unit: '/ 5', trend: 0.2, trendUnit: '', inverse: false, hint: 'NPS 48' },
  ]);

  readonly invoiceCols: DataColumn<ExInvoice>[] = [
    { key: 'ref', label: 'Référence', width: 170, type: 'mono', required: true },
    { key: 'date', label: 'Date', width: 130, type: 'date' },
    { key: 'status', label: 'Statut', width: 130, type: 'badge', format: (r) => r.status.charAt(0).toUpperCase() + r.status.slice(1),
      tone: (r) => (r.status === 'payée' ? 'success' : r.status === 'en retard' ? 'error' : 'warning') },
    { key: 'amount', label: 'Montant', width: 160, type: 'currency', total: true },
  ];

  readonly contract = computed<DescriptionItem[]>(() => [
    { label: 'Offre', value: 'Premium Flotte' },
    { label: 'Échéance', value: '28 février 2027', hint: 'Tacite reconduction' },
    { label: 'Conditions', value: '30 jours fin de mois' },
    { label: 'Sites couverts', value: 6 },
    { label: 'Remise', value: '8 %' },
    { label: 'Devise', value: 'FCFA (XOF)' },
  ]);

  readonly info = computed<DescriptionItem[]>(() => [
    { label: 'Identifiant', value: this.client().id.toUpperCase(), type: 'mono', copy: true },
    { label: 'Responsable', value: this.client().owner },
    { label: 'Secteur', value: this.client().sector },
    { label: 'N° contribuable', value: 'CI-2019-B-04512', type: 'mono' },
    { label: 'Statut', value: CLIENT_STATUS[this.client().status].label, type: 'badge', tone: CLIENT_STATUS[this.client().status].color },
  ]);

  readonly history = computed<AuditEntry[]>(() => {
    const c = this.client();
    const d = (days: number, h: number) => new Date(2026, 9, 17 - days, h, 12);
    const u = (name: string) => ({ name, initials: initials(name), color: hue(name) });
    return [
      { id: 'h1', at: d(0, 10), user: u('Jean Kouassi'), action: 'update', target: c.name, changes: [{ field: 'conditions', label: 'Conditions', before: '45 jours', after: '30 jours fin de mois' }] },
      { id: 'h2', at: d(0, 9), user: u('Fatou Diabaté'), action: 'comment', target: c.name, comment: 'Relance téléphonique faite, règlement annoncé pour vendredi.' },
      { id: 'h3', at: d(2, 15), user: u('Marc Yao'), action: 'create', target: 'Facture FAC-2026-0981' },
      { id: 'h4', at: d(6, 11), user: u('Jean Kouassi'), action: 'status', target: c.name, changes: [{ field: 'status', label: 'Statut', before: 'Prospect', after: 'Actif' }] },
      { id: 'h5', at: d(9, 8), user: u('Aïcha Diallo'), action: 'export', target: 'Relevé de compte (PDF)', meta: 'Chrome · Abidjan' },
    ];
  });
}
