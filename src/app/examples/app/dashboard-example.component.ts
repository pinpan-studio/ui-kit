import { Component, computed, effect, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { MaterialModule } from '../../shared/material.module';
import { BannerComponent } from '../../shared/components/feedback';
import { DataColumn, DataTableComponent, StatCounterComponent, TrendComponent } from '../../shared/components/data';
import { ThemeService } from '../../core/services/theme.service';
import { CLIENT_STATUS, EX_ACTIVITY, EX_CLIENTS, ExClient } from '../../data/static/examples.data';
import { ExAppShellComponent } from './ex-app-shell.component';
import { alpha, hue, resolveColor } from './ex-utils';
import { AnalyticsTab, ExDashboardAnalyticsComponent } from './dashboard/ex-dashboard-analytics.component';

type Period = '7j' | '30j' | '12m';

/** /examples/app/dashboard — sidebar complète, alerte, indicateurs animés, graphiques, classements, table de suivi. */
@Component({
  selector: 'app-dashboard-example',
  standalone: true,
  imports: [DecimalPipe, RouterLink, BaseChartDirective, MaterialModule, BannerComponent, DataTableComponent, StatCounterComponent, TrendComponent, ExDashboardAnalyticsComponent, ExAppShellComponent],
  template: `
    <ex-app-shell nav="sidebar" title="Tableau de bord" crumb="Accueil">
      <div class="page-head">
        <div class="titles">
          <span class="eyebrow">Vendredi 17 octobre 2026</span>
          <h1>Tableau de bord</h1>
          <p>Activité commerciale et encaissements de SC Storage.</p>
        </div>
        <div class="actions">
          <mat-button-toggle-group class="period" [value]="period()" (change)="period.set($event.value)" hideSingleSelectionIndicator aria-label="Période">
            @for (p of periods; track p.id) { <mat-button-toggle [value]="p.id">{{ p.label }}</mat-button-toggle> }
          </mat-button-toggle-group>
          <button mat-stroked-button><mat-icon>download</mat-icon>Exporter</button>
          <button mat-flat-button color="primary"><mat-icon>add</mat-icon>Nouvelle facture</button>
        </div>
      </div>

      <nav class="dash-tabs" aria-label="Sections du tableau de bord">
        @for (t of tabs; track t.id) {
          <button type="button" [class.on]="tab() === t.id" (click)="tab.set(t.id)"><mat-icon>{{ t.icon }}</mat-icon>{{ t.label }}</button>
        }
      </nav>

      @if (tab() === 'overview') {
      <app-banner class="alert" tone="warning" title="3 factures en retard" actionLabel="Voir les relances" compact>
        7,3 M FCFA d’encours dépassent l’échéance de plus de 30 jours.
      </app-banner>

      <div class="kpis">
        @for (k of kpis(); track k.label) {
          <div class="card kpi">
            <span class="k-label"><mat-icon>{{ k.icon }}</mat-icon>{{ k.label }}</span>
            <span class="k-val"><app-stat-counter [value]="k.value" [format]="k.format" [decimals]="k.decimals" />@if (k.unit) { <small>{{ k.unit }}</small> }</span>
            <span class="k-foot"><app-trend [value]="k.trend" [inverse]="!!k.inverse" />{{ compareLabel() }}</span>
            <div class="spark"><canvas baseChart type="line" [data]="spark(k.series, k.inverse)" [options]="sparkOptions"></canvas></div>
          </div>
        }
      </div>

      <div class="grid">
        <section class="card chart-card">
          <div class="card-head"><h2>Chiffre d’affaires</h2><span class="sub">en millions de FCFA</span></div>
          <div class="card-body"><div class="chart"><canvas baseChart type="line" [data]="lineData()" [options]="lineOptions()"></canvas></div></div>
        </section>

        <section class="card">
          <div class="card-head"><h2>Portefeuille clients</h2></div>
          <div class="card-body">
            <div class="donut"><canvas baseChart type="doughnut" [data]="donutData()" [options]="donutOptions()"></canvas>
              <div class="center"><strong>{{ clients.length }}</strong><span>comptes</span></div></div>
            <ul class="legend">
              @for (s of statusCounts(); track s.key) {
                <li><i [style.background]="s.color"></i><span>{{ s.label }}</span><b>{{ s.n }}</b><em>{{ s.n / clients.length * 100 | number: '1.0-0' }} %</em></li>
              }
            </ul>
          </div>
        </section>

        <section class="card">
          <div class="card-head"><h2>Meilleurs clients</h2><a routerLink="/examples/app/clients">Tout voir</a></div>
          <div class="rows list">
            @for (c of top; track c.id; let i = $index) {
              <a class="row" [routerLink]="['/examples/app/clients', c.id]">
                <span class="rank">{{ i + 1 }}</span>
                <span class="grow"><strong>{{ c.name }}</strong><small>{{ c.city }} · {{ c.sector }}</small></span>
                <span class="num">{{ c.revenue / 1e6 | number: '1.1-1' }} M</span>
              </a>
            }
          </div>
        </section>

        <section class="card">
          <div class="card-head"><h2>Activité récente</h2><span class="live"><i></i>En direct</span></div>
          <ol class="feed">
            @for (a of activity; track a.text) {
              <li><span class="dot" [class]="'dot tone-' + a.tone"></span>
                <div><p>{{ a.text }}</p><small>{{ a.who }} · {{ a.at }}</small></div></li>
            }
          </ol>
        </section>

        <section class="card">
          <div class="card-head"><h2>Objectifs du trimestre</h2><span class="sub">T4 2026</span></div>
          <div class="card-body goals">
            @for (g of goals; track g.label) {
              <div class="goal">
                <div class="g-top"><span>{{ g.label }}</span><strong class="tabular">{{ g.value }} %</strong></div>
                <mat-progress-bar mode="determinate" [value]="g.value" />
                <small>{{ g.detail }}</small>
              </div>
            }
          </div>
        </section>

        <app-data-table class="wide" title="Comptes à surveiller" [rows]="late" [columns]="lateCols" [pageSize]="5" maxHeight="none" [searchable]="false" clickable (rowClick)="router.navigate(['/examples/app/clients', $event.id])" />
      </div>
      } @else {
        <ex-dashboard-analytics [tab]="$any(tab())" />
      }
    </ex-app-shell>
  `,
  styleUrls: ['./dashboard-example.component.scss'],
})
export class DashboardExampleComponent {
  private theme = inject(ThemeService);
  readonly router = inject(Router);

  readonly hue = hue;
  readonly clients = EX_CLIENTS;
  readonly activity = EX_ACTIVITY.slice(0, 5);
  readonly top = [...EX_CLIENTS].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  readonly late = EX_CLIENTS.filter((c) => c.status !== 'actif');
  readonly periods: { id: Period; label: string; compare: string }[] = [
    { id: '7j', label: '7 jours', compare: 'vs semaine précédente' },
    { id: '30j', label: '30 jours', compare: 'vs mois précédent' },
    { id: '12m', label: '12 mois', compare: 'vs année précédente' },
  ];
  readonly period = signal<Period>('12m');
  readonly tabs: { id: 'overview' | AnalyticsTab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Vue d’ensemble', icon: 'space_dashboard' }, { id: 'sales', label: 'Ventes', icon: 'bar_chart' },
    { id: 'customers', label: 'Clients', icon: 'pie_chart' }, { id: 'operations', label: 'Opérations', icon: 'insights' },
  ];
  /** Lien direct vers un onglet : ?tab=ventes | clients | operations. */
  readonly tab = signal<'overview' | AnalyticsTab>(({ ventes: 'sales', clients: 'customers', operations: 'operations' } as Record<string, AnalyticsTab>)[inject(ActivatedRoute).snapshot.queryParamMap.get('tab') ?? ''] ?? 'overview');
  readonly compareLabel = computed(() => this.periods.find((p) => p.id === this.period())!.compare);

  readonly goals = [
    { label: 'Chiffre d’affaires', value: 72, detail: '128,4 M sur 178 M FCFA' },
    { label: 'Taux d’encaissement', value: 88, detail: 'Cible 90 %' },
    { label: 'Nouveaux comptes', value: 45, detail: '38 sur 85' },
  ];

  readonly lateCols: DataColumn<ExClient>[] = [
    { key: 'name', label: 'Client', width: 220, required: true },
    { key: 'owner', label: 'Responsable', width: 160 },
    { key: 'city', label: 'Ville', width: 130 },
    { key: 'status', label: 'Statut', width: 120, type: 'badge', format: (r) => CLIENT_STATUS[r.status].label, tone: (r) => CLIENT_STATUS[r.status].color },
    { key: 'invoices', label: 'Factures', width: 100, type: 'number' },
    { key: 'revenue', label: 'Encours', width: 150, type: 'currency', format: (r) => (r.revenue / 10).toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' F', align: 'right' },
  ];

  private readonly data: Record<Period, { kpi: number[]; trend: number[]; labels: string[]; a: number[]; b: number[] }> = {
    '7j': { kpi: [27.9e6, 22.1e6, 9, 7.3e6], trend: [6.2, 4.8, 12.5, -3.1],
      labels: ['Sam', 'Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven'], a: [2.1, 0.8, 4.6, 5.2, 3.9, 6.1, 5.4], b: [1.8, 0.6, 3.1, 4.4, 3.2, 4.9, 4.1] },
    '30j': { kpi: [119e6, 96.1e6, 38, 7.3e6], trend: [9.4, 8.1, 4.6, -2.3],
      labels: ['S1', 'S2', 'S3', 'S4'], a: [24, 31, 28, 36], b: [19, 26, 24, 27] },
    '12m': { kpi: [1.14e9, 0.99e9, 412, 7.3e6], trend: [12.4, 10.2, 18.0, -8.5],
      labels: ['Nov', 'Déc', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct'], a: [82, 95, 71, 78, 90, 99, 104, 97, 88, 93, 115, 128], b: [70, 81, 66, 70, 79, 84, 92, 85, 80, 82, 98, 96] },
  };

  readonly kpis = computed(() => {
    const d = this.data[this.period()];
    return [
      { label: 'Chiffre d’affaires', icon: 'payments', value: d.kpi[0], format: 'compact' as const, decimals: 1, unit: 'FCFA', trend: d.trend[0], series: d.a },
      { label: 'Encaissé', icon: 'account_balance_wallet', value: d.kpi[1], format: 'compact' as const, decimals: 1, unit: 'FCFA', trend: d.trend[1], series: d.b },
      { label: 'Nouveaux clients', icon: 'person_add', value: d.kpi[2], format: 'number' as const, decimals: 0, unit: '', trend: d.trend[2], series: d.a.map((v, i) => Math.round(v / 3 + (i % 3) * 2)) },
      { label: 'Impayés', icon: 'schedule', value: d.kpi[3], format: 'compact' as const, decimals: 1, unit: 'FCFA', trend: d.trend[3], inverse: true, series: d.a.map((v, i) => Math.round(18 - i * 0.6 + (i % 2) * 2)) },
    ];
  });

  /** Couleurs lues sur les jetons CSS du thème courant (recalculées à chaque changement de thème). */
  private readonly colors = signal({ primary: '#006a6a', muted: '#9ca3af', grid: '#e5e7eb', card: '#fff', success: '#22c55e', info: '#3b82f6', warning: '#eab308', error: '#ef4444', neutral: '#9ca3af' });

  constructor() {
    effect(() => {
      this.theme.mode(); this.theme.label();
      setTimeout(() => {
        const v = resolveColor;
        this.colors.set({ primary: v('--primary-color'), muted: v('--text-muted'), grid: v('--border-color'), card: v('--card-bg'),
          success: v('--success-color'), info: v('--info-color'), warning: v('--warning-color'), error: v('--error-color'), neutral: v('--border-color') });
      });
    });
  }

  readonly lineData = computed<ChartData<'line'>>(() => {
    const s = this.data[this.period()];
    const c = this.colors();
    return {
      labels: s.labels,
      datasets: [
        { label: 'Facturé', data: s.a, borderColor: c.primary, backgroundColor: alpha(c.primary, .08), fill: true, tension: .35, pointRadius: 0, pointHoverRadius: 4, borderWidth: 2 },
        { label: 'Encaissé', data: s.b, borderColor: c.muted, borderDash: [4, 4], tension: .35, pointRadius: 0, pointHoverRadius: 4, borderWidth: 1.5 },
      ],
    };
  });

  readonly lineOptions = computed<ChartConfiguration<'line'>['options']>(() => {
    const c = this.colors();
    const font = { family: getComputedStyle(document.body).getPropertyValue('--font-body').trim() || 'Inter', size: 12 };
    return {
      responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
      plugins: { legend: { position: 'top', align: 'end', labels: { color: c.muted, usePointStyle: true, pointStyle: 'line', boxWidth: 16, font } }, datalabels: { display: false } } as any,
      scales: {
        x: { grid: { display: false }, border: { display: false }, ticks: { color: c.muted, font } },
        y: { grid: { color: c.grid }, border: { display: false }, ticks: { color: c.muted, font, maxTicksLimit: 5 } },
      },
    };
  });

  readonly statusCounts = computed(() => {
    const c = this.colors();
    const palette: Record<string, string> = { actif: c.success, prospect: c.info, suspendu: c.warning, inactif: c.neutral };
    return (Object.keys(CLIENT_STATUS) as (keyof typeof CLIENT_STATUS)[]).map((k) => ({
      key: k, label: CLIENT_STATUS[k].label, color: palette[k], n: EX_CLIENTS.filter((x) => x.status === k).length,
    }));
  });

  readonly donutData = computed<ChartData<'doughnut'>>(() => ({
    labels: this.statusCounts().map((s) => s.label),
    datasets: [{ data: this.statusCounts().map((s) => s.n), backgroundColor: this.statusCounts().map((s) => s.color), borderColor: this.colors().card, borderWidth: 2 }],
  }));

  readonly donutOptions = computed<ChartConfiguration<'doughnut'>['options']>(() => ({
    responsive: true, maintainAspectRatio: false, cutout: '76%', plugins: { legend: { display: false }, datalabels: { display: false } } as any,
  }));

  /** Mini-courbe d'un indicateur (couleur selon que la tendance est favorable). */
  spark(series: number[], inverse = false): ChartData<'line'> {
    const c = this.colors();
    const up = series[series.length - 1] >= series[0];
    const color = up !== inverse ? c.success : c.error;
    return { labels: series.map((_, i) => i), datasets: [{ data: series, borderColor: color, backgroundColor: alpha(color, .12), fill: true, tension: .4, pointRadius: 0, borderWidth: 1.5 }] };
  }
  readonly sparkOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true, maintainAspectRatio: false, animation: false, events: [],
    plugins: { legend: { display: false }, tooltip: { enabled: false }, datalabels: { display: false } } as any,
    scales: { x: { display: false }, y: { display: false } }, layout: { padding: 2 },
  };
}
