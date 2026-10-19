import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { MaterialModule } from '../../../shared/material.module';
import { MapComponent, MapMarker } from '../../../shared/components/map';
import { ThemeService } from '../../../core/services/theme.service';
import { ThemePalette, alpha, seeded, themePalette } from '../ex-utils';

export type AnalyticsTab = 'sales' | 'customers' | 'operations';

const MONTHS = ['Nov', 'Déc', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct'];
const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

/**
 * Catalogue de visualisations du tableau de bord, par onglet :
 * - Ventes : barres groupées, empilées, horizontales, mixte barres + courbe (double axe), cascade, aires empilées, escalier ;
 * - Clients : camembert, aire polaire, radar, nuage de points, bulles, treemap, carte ;
 * - Opérations : entonnoir, anneaux de progression, heatmap heures × jours, calendrier d'activité, classement à barres.
 * Couleurs lues sur les jetons du thème (clair / sombre / palette) et recalculées à chaque changement.
 */
@Component({
  selector: 'ex-dashboard-analytics',
  standalone: true,
  imports: [DecimalPipe, BaseChartDirective, MaterialModule, MapComponent],
  templateUrl: './ex-dashboard-analytics.component.html',
  styleUrls: ['./ex-dashboard-analytics.component.scss'],
})
export class ExDashboardAnalyticsComponent {
  private theme = inject(ThemeService);
  tab = input<AnalyticsTab>('sales');
  readonly c = signal<ThemePalette | null>(null);
  readonly days = DAYS;

  constructor() {
    effect(() => { this.theme.mode(); this.theme.label(); setTimeout(() => this.c.set(themePalette())); });
  }

  // ─── Options communes ────────────────────────────────────────
  private font = { family: 'Inter', size: 11 };
  private opts(o: { stacked?: boolean; horizontal?: boolean; unit?: string; legend?: boolean; y2?: string } = {}): any {
    const c = this.c()!;
    const axis = (grid: boolean, unit = '') => ({ stacked: !!o.stacked, grid: grid ? { color: c.grid } : { display: false }, border: { display: false },
      ticks: { color: c.muted, font: this.font, maxTicksLimit: 6, callback: unit ? (v: number | string) => (typeof v === 'number' ? v.toLocaleString('fr-FR') + unit : v) : undefined } });
    const valueAxis = axis(true, o.unit), catAxis = axis(false);
    // Les catégories doivent garder leur libellé : pas de callback sur l'axe des catégories.
    delete (catAxis.ticks as any).callback;
    (catAxis.ticks as any).autoSkip = !o.horizontal;
    const scales: any = o.horizontal ? { x: valueAxis, y: catAxis } : { x: catAxis, y: valueAxis };
    if (o.y2) scales.y2 = { position: 'right', grid: { display: false }, border: { display: false }, ticks: { color: c.muted, font: this.font, maxTicksLimit: 5, callback: (v: number) => v.toLocaleString('fr-FR') + o.y2 } };
    return {
      responsive: true, maintainAspectRatio: false, indexAxis: o.horizontal ? 'y' : 'x', interaction: { mode: 'index', intersect: false },
      plugins: { legend: { display: o.legend !== false, position: 'top', align: 'end', labels: { color: c.muted, usePointStyle: true, boxWidth: 8, font: this.font } }, datalabels: { display: false },
        tooltip: { callbacks: o.unit ? { label: (ctx: any) => ` ${ctx.dataset.label ?? ''} : ${(ctx.parsed.y ?? ctx.parsed.x ?? ctx.parsed).toLocaleString?.('fr-FR') ?? ctx.formattedValue}${o.unit}` } : {} } },
      scales,
    };
  }
  private radialOpts(extra: any = {}): any {
    const c = this.c()!;
    return { responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'right', labels: { color: c.text, usePointStyle: true, boxWidth: 8, font: this.font, padding: 12 } }, datalabels: { display: false } }, ...extra };
  }
  private series(): string[] { const c = this.c()!; return [c.primary, c.info, c.warning, c.success, c.purple, c.error, c.tertiary]; }

  // ─── Ventes ──────────────────────────────────────────────────
  /** Barres groupées : chiffre d'affaires par région, N vs N-1. */
  readonly regionBar = computed(() => this.c() && {
    data: { labels: ['Abidjan', 'Bouaké', 'San-Pédro', 'Yamoussoukro', 'Korhogo', 'Daloa'], datasets: [
      { label: '2025', data: [412, 128, 96, 74, 41, 38], backgroundColor: alpha(this.c()!.primary, .35), borderRadius: 4, barPercentage: .8, categoryPercentage: .7 },
      { label: '2026', data: [486, 141, 122, 81, 52, 36], backgroundColor: this.c()!.primary, borderRadius: 4, barPercentage: .8, categoryPercentage: .7 },
    ] } as ChartData<'bar'>,
    options: this.opts({ unit: ' M' }),
  });
  /** Barres empilées : encaissements par moyen de paiement. */
  readonly payStack = computed(() => {
    const c = this.c(); if (!c) return null;
    const r = seeded(3);
    const mk = (base: number) => MONTHS.map((_, i) => Math.round(base * (0.8 + r() * 0.5) * (1 + i * 0.03)));
    return {
      data: { labels: MONTHS, datasets: [
        { label: 'Orange Money', data: mk(28), backgroundColor: c.warning, stack: 'p' },
        { label: 'MTN MoMo', data: mk(19), backgroundColor: alpha(c.warning, .55), stack: 'p' },
        { label: 'Wave', data: mk(14), backgroundColor: c.info, stack: 'p' },
        { label: 'Virement', data: mk(22), backgroundColor: c.primary, stack: 'p' },
        { label: 'Carte', data: mk(9), backgroundColor: c.purple, stack: 'p', borderRadius: { topLeft: 4, topRight: 4 } },
      ] } as ChartData<'bar'>,
      options: this.opts({ stacked: true, unit: ' M' }),
    };
  });
  /** Barres horizontales : meilleures ventes. */
  readonly topProducts = computed(() => this.c() && {
    data: { labels: ['Balise GPS 4G', 'Abonnement Premium', 'Capteur carburant', 'Caméra embarquée', 'Installation', 'Formation', 'Lecteur RFID'], datasets: [
      { label: 'Unités', data: [1240, 980, 610, 455, 390, 210, 140], backgroundColor: this.series().map((x, i) => (i === 0 ? this.c()!.primary : alpha(this.c()!.primary, .55 - i * 0.05))), borderRadius: 4, barPercentage: .7 },
    ] } as ChartData<'bar'>,
    options: this.opts({ horizontal: true, legend: false }),
  });
  /** Mixte : commandes (barres) + panier moyen (courbe, axe secondaire). */
  readonly mixed = computed(() => {
    const c = this.c(); if (!c) return null;
    return {
      data: { labels: MONTHS, datasets: [
        { type: 'bar', label: 'Commandes', data: [312, 340, 288, 301, 356, 372, 398, 384, 361, 377, 420, 451], backgroundColor: alpha(c.info, .55), borderRadius: 4, yAxisID: 'y', order: 2 },
        { type: 'line', label: 'Panier moyen', data: [182, 188, 176, 179, 185, 191, 196, 194, 190, 198, 205, 212], borderColor: c.warning, backgroundColor: c.warning, tension: .35, pointRadius: 3, borderWidth: 2, yAxisID: 'y2', order: 1 },
      ] } as unknown as ChartData<'bar'>,
      options: this.opts({ y2: ' k' }),
    };
  });
  /** Cascade (waterfall) : du CA au résultat net — barres flottantes [début, fin]. */
  readonly waterfall = computed(() => {
    const c = this.c(); if (!c) return null;
    const steps: [string, number][] = [['CA', 1140], ['Achats', -412], ['Salaires', -286], ['Loyers', -64], ['Marketing', -58], ['Autres', -41], ['Impôts', -71]];
    let acc = 0;
    const bars = steps.map(([, v], i) => { const from = i === 0 ? 0 : acc; acc = i === 0 ? v : acc + v; return [from, acc] as [number, number]; });
    const labels = [...steps.map((s) => s[0]), 'Résultat'];
    bars.push([0, acc]);
    return {
      data: { labels, datasets: [{ label: 'Montant', data: bars as any, backgroundColor: bars.map((b, i) => (i === 0 || i === bars.length - 1 ? c.primary : b[1] < b[0] ? alpha(c.error, .75) : c.success)), borderRadius: 3, barPercentage: .7 }] } as ChartData<'bar'>,
      options: { ...this.opts({ legend: false, unit: ' M' }), plugins: { legend: { display: false }, datalabels: { display: false },
        tooltip: { callbacks: { label: (ctx: any) => { const [a, b] = ctx.raw as number[]; return ` ${(b - a).toLocaleString('fr-FR')} M`; } } } } },
    };
  });
  /** Aires empilées : visites par canal. */
  readonly channels = computed(() => {
    const c = this.c(); if (!c) return null;
    const r = seeded(9);
    const mk = (b: number) => DAYS.concat(DAYS).map((_, i) => Math.round(b * (0.7 + r() * 0.6) * (i % 7 > 4 ? 0.6 : 1)));
    const labels = DAYS.concat(DAYS).map((d, i) => `${d} ${i < 7 ? 'S1' : 'S2'}`);
    return {
      data: { labels, datasets: [
        { label: 'Direct', data: mk(420), borderColor: c.primary, backgroundColor: alpha(c.primary, .55), fill: true, tension: .35, pointRadius: 0 },
        { label: 'Recherche', data: mk(310), borderColor: c.info, backgroundColor: alpha(c.info, .45), fill: true, tension: .35, pointRadius: 0 },
        { label: 'Réseaux sociaux', data: mk(180), borderColor: c.purple, backgroundColor: alpha(c.purple, .4), fill: true, tension: .35, pointRadius: 0 },
        { label: 'E-mail', data: mk(90), borderColor: c.warning, backgroundColor: alpha(c.warning, .4), fill: true, tension: .35, pointRadius: 0 },
      ] } as ChartData<'line'>,
      options: this.opts({ stacked: true }),
    };
  });
  /** Courbe en escalier : niveau de stock et seuil de réapprovisionnement. */
  readonly stock = computed(() => {
    const c = this.c(); if (!c) return null;
    const lv = [420, 420, 380, 380, 310, 260, 260, 190, 140, 620, 620, 560, 500, 500, 430];
    return {
      data: { labels: lv.map((_, i) => `${i + 1} oct.`), datasets: [
        { label: 'Stock balises', data: lv, borderColor: c.primary, backgroundColor: alpha(c.primary, .08), fill: true, stepped: true, pointRadius: 0, borderWidth: 2 },
        { label: 'Seuil', data: lv.map(() => 200), borderColor: c.error, borderDash: [4, 4], pointRadius: 0, borderWidth: 1 },
      ] } as ChartData<'line'>,
      options: this.opts({}),
    };
  });

  // ─── Clients ─────────────────────────────────────────────────
  readonly sectors = [
    { label: 'Transport', v: 31 }, { label: 'Agro-industrie', v: 22 }, { label: 'BTP', v: 14 }, { label: 'Santé', v: 11 }, { label: 'Finance', v: 9 }, { label: 'Télécoms', v: 7 }, { label: 'Autres', v: 6 },
  ];
  readonly pie = computed(() => this.c() && {
    data: { labels: this.sectors.map((s) => s.label), datasets: [{ data: this.sectors.map((s) => s.v), backgroundColor: this.series(), borderColor: this.c()!.card, borderWidth: 2 }] } as ChartData<'pie'>,
    options: this.radialOpts(),
  });
  readonly polar = computed(() => {
    const c = this.c(); if (!c) return null;
    return {
      data: { labels: ['Facturation', 'Balises', 'Application', 'Livraison', 'Compte', 'Autre'], datasets: [{ data: [48, 36, 29, 22, 14, 9], backgroundColor: this.series().slice(0, 6).map((x) => alpha(x, .65)), borderColor: c.card, borderWidth: 2 }] } as ChartData<'polarArea'>,
      options: this.radialOpts({ scales: { r: { grid: { color: c.grid }, angleLines: { color: c.grid }, ticks: { display: false, backdropColor: 'transparent' } } } }),
    };
  });
  readonly radar = computed(() => {
    const c = this.c(); if (!c) return null;
    return {
      data: { labels: ['Rapidité', 'Facilité', 'Fiabilité', 'Support', 'Prix', 'Application mobile'], datasets: [
        { label: 'T3', data: [3.6, 4.1, 4.0, 3.4, 3.2, 3.5], borderColor: c.muted, backgroundColor: alpha(c.muted, .15), pointRadius: 2, borderWidth: 1.5 },
        { label: 'T4', data: [4.2, 4.3, 4.4, 4.0, 3.4, 4.1], borderColor: c.primary, backgroundColor: alpha(c.primary, .2), pointRadius: 3, borderWidth: 2 },
      ] } as ChartData<'radar'>,
      options: { ...this.radialOpts(), plugins: { legend: { position: 'top', align: 'end', labels: { color: c.muted, usePointStyle: true, boxWidth: 8, font: this.font } }, datalabels: { display: false } },
        scales: { r: { min: 0, max: 5, grid: { color: c.grid }, angleLines: { color: c.grid }, pointLabels: { color: c.text, font: this.font }, ticks: { display: false, stepSize: 1 } } } },
    };
  });
  /** Nuage de points : délai de paiement vs montant facturé. */
  readonly scatter = computed(() => {
    const c = this.c(); if (!c) return null;
    const r = seeded(21);
    const pts = (n: number, late: boolean) => Array.from({ length: n }, () => { const x = Math.round(r() * 12) / 2 + 0.5; return { x, y: Math.round((late ? 35 : 12) + r() * (late ? 40 : 22) + x * 2) }; });
    return {
      data: { datasets: [
        { label: 'Payées à temps', data: pts(38, false), backgroundColor: alpha(c.success, .7), pointRadius: 4 },
        { label: 'En retard', data: pts(14, true), backgroundColor: alpha(c.error, .75), pointRadius: 4, pointStyle: 'triangle' },
      ] } as ChartData<'scatter'>,
      options: { ...this.opts({}), interaction: { mode: 'nearest', intersect: true },
        scales: { x: { title: { display: true, text: 'Montant (M FCFA)', color: this.c()!.muted, font: this.font }, grid: { color: c.grid }, border: { display: false }, ticks: { color: c.muted, font: this.font } },
          y: { title: { display: true, text: 'Délai (jours)', color: c.muted, font: this.font }, grid: { color: c.grid }, border: { display: false }, ticks: { color: c.muted, font: this.font } } } },
    };
  });
  /** Bulles : chiffre d'affaires × marge, taille = nombre de sites. */
  readonly bubble = computed(() => {
    const c = this.c(); if (!c) return null;
    const pts = [['Cacao Plus', 121, 34, 14], ['Orca Télécom', 111, 22, 9], ['Energie Nord', 101, 28, 11], ['Ivoire Agro', 87, 31, 8], ['Clinique Riviera', 77, 18, 4], ['Hôtel Assinie', 67, 25, 3], ['Banque Lagune', 44, 38, 6], ['Batim CI', 34, 15, 5]] as const;
    return {
      data: { datasets: pts.map(([n, x, y, s], i) => ({ label: n, data: [{ x, y, r: 4 + s * 1.4 }], backgroundColor: alpha(this.series()[i % 7], .55), borderColor: this.series()[i % 7], borderWidth: 1 })) } as ChartData<'bubble'>,
      options: { ...this.opts({ legend: false }), interaction: { mode: 'nearest', intersect: true },
        plugins: { legend: { display: false }, datalabels: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label} : ${ctx.raw.x} M · marge ${ctx.raw.y} %` } } },
        scales: { x: { title: { display: true, text: 'CA (M FCFA)', color: c.muted, font: this.font }, grid: { color: c.grid }, border: { display: false }, ticks: { color: c.muted, font: this.font } },
          y: { title: { display: true, text: 'Marge (%)', color: c.muted, font: this.font }, grid: { color: c.grid }, border: { display: false }, ticks: { color: c.muted, font: this.font } } } },
    };
  });
  /** Treemap (disposition « slice and dice » en CSS) : CA par catégorie > sous-catégorie. */
  readonly treemap = [
    { label: 'Abonnements', v: 46, tone: 'primary', kids: [{ label: 'Premium', v: 28 }, { label: 'Standard', v: 13 }, { label: 'Essentiel', v: 5 }] },
    { label: 'Matériel', v: 31, tone: 'info', kids: [{ label: 'Balises', v: 18 }, { label: 'Capteurs', v: 8 }, { label: 'Caméras', v: 5 }] },
    { label: 'Services', v: 23, tone: 'purple', kids: [{ label: 'Installation', v: 11 }, { label: 'Formation', v: 7 }, { label: 'Support', v: 5 }] },
  ];
  readonly cityMarkers: MapMarker[] = [
    ['Abidjan', 5.345, -4.024, 486], ['Bouaké', 7.69, -5.03, 141], ['San-Pédro', 4.75, -6.64, 122], ['Yamoussoukro', 6.82, -5.28, 81], ['Korhogo', 9.46, -5.63, 52], ['Daloa', 6.88, -6.45, 36], ['Man', 7.41, -7.55, 24],
  ].map(([n, lat, lng, v]) => ({ id: n as string, lat: lat as number, lng: lng as number, title: n as string, lines: [`${v} M FCFA`], icon: 'storefront', tone: (v as number) > 120 ? 'primary' : (v as number) > 50 ? 'info' : 'neutral' }) as MapMarker);

  // ─── Opérations ──────────────────────────────────────────────
  readonly funnel = [
    { label: 'Visiteurs', v: 48200 }, { label: 'Demandes de démo', v: 3120 }, { label: 'Démos réalisées', v: 1480 }, { label: 'Devis envoyés', v: 920 }, { label: 'Contrats signés', v: 412 },
  ];
  readonly rings = [
    { label: 'Livraisons à l’heure', v: 94, tone: 'success' }, { label: 'Tickets résolus < 24 h', v: 81, tone: 'info' },
    { label: 'Taux d’occupation', v: 67, tone: 'warning' }, { label: 'Objectif mensuel', v: 72, tone: 'primary' },
  ];
  /** Heatmap commandes par heure (7 h – 20 h) × jour. */
  readonly hours = Array.from({ length: 14 }, (_, i) => i + 7);
  readonly heat = (() => {
    const r = seeded(7);
    return DAYS.map((_, d) => this.hours.map((h) => {
      const peak = Math.exp(-((h - 10) ** 2) / 6) + Math.exp(-((h - 15) ** 2) / 5) * 0.8;
      return Math.round((peak * (d > 4 ? 0.35 : 1) + r() * 0.25) * 100);
    }));
  })();
  readonly heatMax = Math.max(...this.heat.flat());
  /** Calendrier d'activité (52 semaines × 7 jours), façon contributions. */
  readonly calendar = (() => {
    const r = seeded(11);
    const start = new Date(2025, 9, 20);
    return Array.from({ length: 52 }, (_, w) => Array.from({ length: 7 }, (_, d) => {
      const date = new Date(start); date.setDate(start.getDate() + w * 7 + d);
      const base = d > 4 ? 0.15 : 0.6 + (w / 52) * 0.3;
      const v = r() < 0.1 ? 0 : Math.round(base * r() * 40);
      return { date, v, lvl: v === 0 ? 0 : v < 8 ? 1 : v < 16 ? 2 : v < 24 ? 3 : 4 };
    }));
  })();
  readonly monthsAxis = Array.from({ length: 12 }, (_, i) => ({ label: MONTHS[i], col: Math.round(i * 52 / 12) }));
  readonly ranking = [
    { name: 'Aya Koné', team: 'Opérations', v: 148, goal: 160 }, { name: 'Marc Yao', team: 'Technique', v: 131, goal: 120 },
    { name: 'Sarah Bamba', team: 'Formation', v: 117, goal: 130 }, { name: 'Jean Kouassi', team: 'Direction', v: 96, goal: 100 }, { name: 'Aïcha Diallo', team: 'Données', v: 88, goal: 110 },
  ];

  /** Anneau SVG : longueur de trait pour une valeur 0–100 (r = 40). */
  dash(v: number): string { const l = 2 * Math.PI * 40; return `${(l * v) / 100} ${l}`; }
  heatColor(v: number): string { return `color-mix(in srgb, var(--primary-color) ${Math.round((v / this.heatMax) * 100)}%, var(--hover-bg))`; }
  pct(a: number, b: number): number { return (a / b) * 100; }
  /** Largeur d'une étape d'entonnoir : échelle racine carrée pour garder les dernières étapes lisibles. */
  funnelWidth(v: number): number { return Math.max(6, Math.sqrt(v / this.funnel[0].v) * 100); }
  type<T extends ChartType>(t: T): T { return t; }
}
