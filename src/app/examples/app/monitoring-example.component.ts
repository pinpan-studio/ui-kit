import { Component, DestroyRef, ElementRef, WritableSignal, computed, effect, inject, signal, viewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../shared/material.module';
import { BannerComponent } from '../../shared/components/feedback';
import { DataColumn, DataTableComponent, TrendComponent } from '../../shared/components/data';
import { MapComponent, MapMarker } from '../../shared/components/map';
import { ThemeService } from '../../core/services/theme.service';
import { ExAppShellComponent } from './ex-app-shell.component';
import { ThemePalette, alpha, seeded, themePalette } from './ex-utils';

type Health = 'up' | 'degraded' | 'down' | 'maintenance';
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface Service { id: string; name: string; group: string; icon: string; status: Health; uptime: number; latency: number; days: Health[]; }
interface Host { id: string; name: string; role: string; region: string; cpu: number; ram: number; disk: number; net: number; status: string; uptime: string; }
interface LogLine { id: number; at: Date; level: LogLevel; source: string; msg: string; }
interface Incident { id: string; title: string; severity: 'critique' | 'majeur' | 'mineur'; status: 'en cours' | 'surveillance' | 'résolu'; started: string; service: string; owner: string; }
interface Sensor { id: string; label: string; site: string; value: number; unit: string; min: number; max: number; warn: number; icon: string;
  /** Seuil bas (alerte quand la valeur passe SOUS `warn`). */
  low?: boolean; }
interface Job { name: string; schedule: string; last: string; duration: string; status: 'ok' | 'running' | 'failed'; }

const POINTS = 40;
const HEALTH: Record<Health, { label: string; tone: string }> = {
  up: { label: 'Opérationnel', tone: 'success' }, degraded: { label: 'Dégradé', tone: 'warning' },
  down: { label: 'Panne', tone: 'error' }, maintenance: { label: 'Maintenance', tone: 'info' },
};

/**
 * /examples/app/monitoring — supervision « de tout » : santé globale, indicateurs en direct, services et
 * disponibilité 90 jours, trafic / latence / erreurs en temps réel, serveurs, bases et files, flotte GPS,
 * capteurs IoT des entrepôts, tâches planifiées, incidents et journaux en flux. Données simulées localement.
 */
@Component({
  selector: 'app-monitoring-example',
  standalone: true,
  imports: [DecimalPipe, BaseChartDirective, MaterialModule, BannerComponent, DataTableComponent, TrendComponent, MapComponent, ExAppShellComponent],
  templateUrl: './monitoring-example.component.html',
  styleUrls: ['./monitoring-example.component.scss'],
})
export class MonitoringExampleComponent {
  private theme = inject(ThemeService);
  private snack = inject(MatSnackBar);
  private logBox = viewChild<ElementRef<HTMLElement>>('logBox');
  private rnd = seeded(42);

  readonly health = HEALTH;
  readonly live = signal(true);
  readonly range = signal<'1h' | '24h' | '7j'>('1h');
  readonly tick = signal(0);
  readonly lastUpdate = signal(new Date());
  readonly colors = signal<ThemePalette | null>(null);

  // ─── Services & disponibilité 90 jours ──────────────────────
  readonly services = signal<Service[]>([
    this.svc('api', 'API publique', 'Plateforme', 'api', 'up', 99.98, 84),
    this.svc('pay', 'Paiements Mobile Money', 'Plateforme', 'payments', 'degraded', 99.71, 412, [3, 17, 58]),
    this.svc('web', 'Application web', 'Plateforme', 'language', 'up', 99.99, 120),
    this.svc('mobile', 'API mobile', 'Plateforme', 'smartphone', 'up', 99.95, 96, [22]),
    this.svc('gps', 'Passerelle GPS (balises)', 'Terrain', 'satellite_alt', 'up', 99.9, 38, [40, 41]),
    this.svc('sms', 'Envoi SMS', 'Tiers', 'sms', 'up', 99.6, 640, [8, 63, 64]),
    this.svc('mail', 'E-mails transactionnels', 'Tiers', 'mail', 'maintenance', 99.92, 230),
    this.svc('backup', 'Sauvegardes', 'Infrastructure', 'backup', 'up', 100, 0),
  ]);
  readonly globalStatus = computed<Health>(() => {
    const s = this.services().map((x) => x.status);
    return s.includes('down') ? 'down' : s.includes('degraded') ? 'degraded' : 'up';
  });
  readonly counts = computed(() => (['up', 'degraded', 'down', 'maintenance'] as Health[]).map((h) => ({ h, n: this.services().filter((s) => s.status === h).length })));

  // ─── Séries temps réel ───────────────────────────────────────
  readonly labels = signal<string[]>(this.initLabels());
  readonly rpm = signal<number[]>(this.walk(1850, 220, POINTS));
  readonly p95 = signal<number[]>(this.walk(180, 40, POINTS));
  readonly p50 = signal<number[]>(this.walk(72, 12, POINTS));
  readonly errors = signal<number[]>(this.walk(0.6, 0.35, POINTS).map((v) => Math.max(0.05, v)));
  readonly cpu = signal<number[]>(this.walk(46, 9, POINTS));
  readonly mem = signal<number[]>(this.walk(63, 4, POINTS));

  readonly kpis = computed(() => {
    const last = <T extends number>(a: T[]) => a[a.length - 1];
    const prev = <T extends number>(a: T[]) => a[a.length - 6] ?? a[0];
    const pct = (a: number[]) => ((last(a) - prev(a)) / (prev(a) || 1)) * 100;
    return [
      { label: 'Disponibilité (30 j)', value: '99,94', unit: '%', icon: 'verified', trend: 0.02, inverse: false, hint: 'SLO 99,9 %' },
      { label: 'Requêtes / min', value: Math.round(last(this.rpm())).toLocaleString('fr-FR'), unit: '', icon: 'swap_vert', trend: pct(this.rpm()), inverse: false, hint: '5 dernières min' },
      { label: 'Latence p95', value: Math.round(last(this.p95())).toLocaleString('fr-FR'), unit: 'ms', icon: 'speed', trend: pct(this.p95()), inverse: true, hint: 'objectif < 250 ms' },
      { label: 'Taux d’erreur', value: last(this.errors()).toLocaleString('fr-FR', { maximumFractionDigits: 2 }), unit: '%', icon: 'error_outline', trend: pct(this.errors()), inverse: true, hint: '5xx / total' },
      { label: 'Alertes actives', value: String(this.alerts().length), unit: '', icon: 'notifications_active', trend: 0, inverse: true, hint: '1 critique' },
      { label: 'Balises en ligne', value: `${this.fleetOnline()}`, unit: `/ ${this.fleet().length}`, icon: 'local_shipping', trend: 0, inverse: false, hint: 'flotte GPS' },
    ];
  });

  // ─── Serveurs, bases, files ─────────────────────────────────
  readonly hosts = signal<Host[]>([
    { id: 'h1', name: 'api-prod-01', role: 'API', region: 'Abidjan-1', cpu: 48, ram: 62, disk: 41, net: 182, status: 'OK', uptime: '42 j' },
    { id: 'h2', name: 'api-prod-02', role: 'API', region: 'Abidjan-1', cpu: 55, ram: 66, disk: 41, net: 176, status: 'OK', uptime: '42 j' },
    { id: 'h3', name: 'pay-worker-01', role: 'Paiements', region: 'Abidjan-1', cpu: 87, ram: 78, disk: 52, net: 96, status: 'Charge élevée', uptime: '12 j' },
    { id: 'h4', name: 'gps-ingest-01', role: 'Ingestion GPS', region: 'Abidjan-2', cpu: 39, ram: 51, disk: 68, net: 420, status: 'OK', uptime: '88 j' },
    { id: 'h5', name: 'db-primary', role: 'PostgreSQL', region: 'Abidjan-1', cpu: 34, ram: 81, disk: 74, net: 210, status: 'OK', uptime: '120 j' },
    { id: 'h6', name: 'db-replica', role: 'PostgreSQL', region: 'Abidjan-2', cpu: 21, ram: 77, disk: 74, net: 160, status: 'OK', uptime: '120 j' },
    { id: 'h7', name: 'cache-01', role: 'Redis', region: 'Abidjan-1', cpu: 12, ram: 58, disk: 9, net: 300, status: 'OK', uptime: '64 j' },
    { id: 'h8', name: 'queue-01', role: 'RabbitMQ', region: 'Abidjan-1', cpu: 27, ram: 44, disk: 31, net: 140, status: 'OK', uptime: '64 j' },
  ]);
  readonly hostCols: DataColumn<Host>[] = [
    { key: 'name', label: 'Hôte', width: 150, type: 'mono', required: true, sticky: 'start' },
    { key: 'role', label: 'Rôle', width: 118 },
    { key: 'region', label: 'Zone', width: 100 },
    { key: 'cpu', label: 'CPU', width: 118, type: 'progress' },
    { key: 'ram', label: 'Mémoire', width: 118, type: 'progress' },
    { key: 'disk', label: 'Disque', width: 118, type: 'progress' },
    { key: 'net', label: 'Réseau', width: 110, type: 'number', format: (r) => `${r.net} Mb/s`, align: 'right' },
    { key: 'status', label: 'État', width: 130, type: 'badge', tone: (r) => (r.status === 'OK' ? 'success' : 'warning') },
    { key: 'uptime', label: 'Uptime', width: 80, hidden: true, align: 'right' },
  ];
  readonly stores = [
    { name: 'PostgreSQL', icon: 'database', value: 312, unit: 'req/s', meta: '42 connexions · réplication 0,4 s', tone: 'success' },
    { name: 'Redis', icon: 'memory', value: 96.4, unit: '% hits', meta: '1,2 Go · 18 k clés/s', tone: 'success' },
    { name: 'RabbitMQ', icon: 'low_priority', value: 1284, unit: 'en file', meta: 'paiements.callbacks · 38 msg/s', tone: 'warning' },
    { name: 'Stockage objets', icon: 'cloud', value: 6.6, unit: 'To', meta: '44 % du quota · 1,8 M objets', tone: 'success' },
  ];

  // ─── Flotte GPS ──────────────────────────────────────────────
  readonly fleet = signal<MapMarker[]>(this.initFleet());
  readonly fleetOnline = computed(() => this.fleet().filter((m) => m.tone !== 'neutral').length);

  // ─── Capteurs IoT ────────────────────────────────────────────
  readonly sensors = signal<Sensor[]>([
    { id: 's1', label: 'Chambre froide', site: 'Vridi', value: 3.8, unit: '°C', min: -2, max: 12, warn: 6, icon: 'ac_unit' },
    { id: 's2', label: 'Humidité', site: 'Vridi', value: 61, unit: '%', min: 0, max: 100, warn: 75, icon: 'water_drop' },
    { id: 's3', label: 'Température', site: 'Yopougon', value: 29.4, unit: '°C', min: 10, max: 45, warn: 35, icon: 'thermostat' },
    { id: 's4', label: 'Groupe électrogène', site: 'San-Pédro', value: 72, unit: '% carburant', min: 0, max: 100, warn: 20, icon: 'bolt', low: true },
  ]);

  readonly jobs: Job[] = [
    { name: 'Relances automatiques', schedule: 'Chaque jour · 09:00', last: 'aujourd’hui 09:00', duration: '42 s', status: 'ok' },
    { name: 'Synchronisation comptable', schedule: 'Toutes les heures', last: 'il y a 12 min', duration: '3 min 08', status: 'running' },
    { name: 'Export Sage', schedule: 'Chaque nuit · 02:00', last: 'aujourd’hui 02:00', duration: '—', status: 'failed' },
    { name: 'Sauvegarde complète', schedule: 'Chaque nuit · 03:30', last: 'aujourd’hui 03:30', duration: '18 min', status: 'ok' },
    { name: 'Purge des journaux', schedule: 'Dimanche · 04:00', last: 'il y a 5 j', duration: '1 min 12', status: 'ok' },
  ];

  readonly incidents = signal<Incident[]>([
    { id: 'INC-214', title: 'Latence élevée sur les callbacks Mobile Money', severity: 'majeur', status: 'en cours', started: 'il y a 38 min', service: 'Paiements', owner: 'Marc Yao' },
    { id: 'INC-213', title: 'Échec de l’export Sage nocturne', severity: 'mineur', status: 'surveillance', started: 'il y a 7 h', service: 'Tâches planifiées', owner: 'Fatou Diabaté' },
    { id: 'INC-211', title: 'Perte de signal de 2 balises sur l’axe nord', severity: 'mineur', status: 'résolu', started: 'hier', service: 'Passerelle GPS', owner: 'Aya Koné' },
    { id: 'INC-207', title: 'Indisponibilité partielle des SMS (opérateur)', severity: 'critique', status: 'résolu', started: 'il y a 3 j', service: 'Envoi SMS', owner: 'Ibrahim Sanogo' },
  ]);
  readonly alerts = computed(() => [
    ...this.hosts().filter((h) => h.cpu > 80).map((h) => ({ icon: 'memory', tone: 'warning', text: `CPU ${h.cpu} % sur ${h.name}`, at: 'en cours' })),
    ...this.sensors().filter((s) => this.alarm(s)).map((s) => ({ icon: s.icon, tone: 'error', text: `${s.label} ${s.site} : ${s.value.toLocaleString('fr-FR')} ${s.unit}`, at: 'en cours' })),
    { icon: 'payments', tone: 'warning', text: 'p95 callbacks paiements > 400 ms', at: 'depuis 38 min' },
    { icon: 'schedule', tone: 'error', text: 'Tâche « Export Sage » en échec', at: 'depuis 7 h' },
  ]);

  // ─── Journaux ────────────────────────────────────────────────
  readonly logs = signal<LogLine[]>([]);
  readonly logLevel = signal<LogLevel | 'all'>('all');
  readonly logQuery = signal('');
  readonly visibleLogs = computed(() => {
    const q = this.logQuery().trim().toLowerCase();
    return this.logs().filter((l) => (this.logLevel() === 'all' || l.level === this.logLevel()) && (!q || (l.source + l.msg).toLowerCase().includes(q)));
  });
  private logSeq = 0;

  constructor() {
    for (let i = 0; i < 18; i++) this.pushLog(new Date(Date.now() - (18 - i) * 4000));
    effect(() => { this.theme.mode(); this.theme.label(); setTimeout(() => this.colors.set(themePalette())); });
    const timer = setInterval(() => this.live() && this.step(), 2000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  // ─── Graphiques ──────────────────────────────────────────────
  private base(c: ThemePalette, unit = ''): ChartConfiguration['options'] {
    const font = { family: 'Inter', size: 11 };
    return {
      responsive: true, maintainAspectRatio: false, animation: { duration: 300 }, interaction: { mode: 'index', intersect: false },
      plugins: { legend: { position: 'top', align: 'end', labels: { color: c.muted, usePointStyle: true, pointStyle: 'line', boxWidth: 14, font } }, datalabels: { display: false } } as any,
      scales: {
        x: { grid: { display: false }, border: { display: false }, ticks: { color: c.muted, font, maxTicksLimit: 6, autoSkip: true } },
        y: { grid: { color: c.grid }, border: { display: false }, ticks: { color: c.muted, font, maxTicksLimit: 5, callback: (v) => v + unit } },
      },
    };
  }
  readonly trafficData = computed<ChartData<'line'>>(() => {
    const c = this.colors(); if (!c) return { labels: [], datasets: [] };
    return { labels: this.labels(), datasets: [
      { label: 'Requêtes / min', data: this.rpm(), borderColor: c.primary, backgroundColor: alpha(c.primary, .1), fill: true, tension: .35, pointRadius: 0, borderWidth: 2 },
    ] };
  });
  readonly latencyData = computed<ChartData<'line'>>(() => {
    const c = this.colors(); if (!c) return { labels: [], datasets: [] };
    return { labels: this.labels(), datasets: [
      { label: 'p95', data: this.p95(), borderColor: c.warning, tension: .35, pointRadius: 0, borderWidth: 2 },
      { label: 'p50', data: this.p50(), borderColor: c.info, tension: .35, pointRadius: 0, borderWidth: 2 },
      { label: 'Seuil', data: this.labels().map(() => 250), borderColor: c.error, borderDash: [4, 4], pointRadius: 0, borderWidth: 1 },
    ] };
  });
  readonly errorData = computed<ChartData<'bar'>>(() => {
    const c = this.colors(); if (!c) return { labels: [], datasets: [] };
    return { labels: this.labels(), datasets: [
      { label: '% erreurs', data: this.errors(), backgroundColor: this.errors().map((v) => (v > 1 ? c.error : alpha(c.error, .45))), borderRadius: 2, barPercentage: .8 },
    ] };
  });
  readonly resourceData = computed<ChartData<'line'>>(() => {
    const c = this.colors(); if (!c) return { labels: [], datasets: [] };
    return { labels: this.labels(), datasets: [
      { label: 'CPU', data: this.cpu(), borderColor: c.purple, backgroundColor: alpha(c.purple, .08), fill: true, tension: .35, pointRadius: 0, borderWidth: 2 },
      { label: 'Mémoire', data: this.mem(), borderColor: c.success, tension: .35, pointRadius: 0, borderWidth: 2 },
    ] };
  });
  readonly trafficOpts = computed(() => (this.colors() ? this.base(this.colors()!) : {}) as ChartConfiguration<'line'>['options']);
  readonly latencyOpts = computed(() => (this.colors() ? this.base(this.colors()!, ' ms') : {}) as ChartConfiguration<'line'>['options']);
  readonly errorOpts = computed(() => (this.colors() ? { ...this.base(this.colors()!, ' %'), plugins: { legend: { display: false }, datalabels: { display: false } } } : {}) as ChartConfiguration<'bar'>['options']);
  readonly resourceOpts = computed(() => {
    const o = this.colors() ? this.base(this.colors()!, ' %') : {};
    if ((o as any).scales) (o as any).scales.y.max = 100;
    return o as ChartConfiguration<'line'>['options'];
  });

  // ─── Actions ─────────────────────────────────────────────────
  toggleLive(): void { this.live.update((v) => !v); }
  ack(i: Incident): void {
    this.incidents.update((l) => l.map((x) => (x.id === i.id ? { ...x, status: 'surveillance' } : x)));
    this.snack.open(`${i.id} pris en charge`, 'OK', { duration: 2000 });
  }
  alarm(s: Sensor): boolean { return s.low ? s.value < s.warn : s.value > s.warn; }
  gauge(s: Sensor): number { return Math.max(0, Math.min(1, (s.value - s.min) / (s.max - s.min))); }
  /** Arc SVG (demi-cercle) pour une jauge 0–1. */
  arc(p: number): string {
    const a = Math.PI * (1 - p), r = 40, cx = 50, cy = 50;
    return `M 10 50 A ${r} ${r} 0 0 1 ${cx + r * Math.cos(a)} ${cy - r * Math.sin(a)}`;
  }
  lvlTone(l: LogLevel): string { return { info: 'info', warn: 'warning', error: 'error', debug: 'neutral' }[l]; }
  sevTone(s: Incident['severity']): string { return { critique: 'error', majeur: 'warning', mineur: 'info' }[s]; }
  jobTone(s: Job['status']): string { return { ok: 'success', running: 'info', failed: 'error' }[s]; }

  // ─── Simulation ──────────────────────────────────────────────
  private step(): void {
    const r = this.rnd;
    const push = (sig: WritableSignal<number[]>, base: number, amp: number, min = 0, max = Infinity) =>
      sig.update((a) => [...a.slice(1), Math.min(max, Math.max(min, a[a.length - 1] + (r() - 0.5) * amp + (base - a[a.length - 1]) * 0.15))]);
    push(this.rpm, 1850, 260, 900);
    push(this.p95, 190, 50, 90);
    push(this.p50, 72, 10, 40);
    push(this.errors, 0.6, 0.5, 0.05, 4);
    push(this.cpu, 48, 10, 5, 99);
    push(this.mem, 63, 3, 20, 99);
    this.labels.update((l) => [...l.slice(1), new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })]);
    this.hosts.update((l) => l.map((h) => ({ ...h, cpu: Math.round(Math.min(99, Math.max(5, h.cpu + (r() - 0.5) * 8))), net: Math.max(20, Math.round(h.net + (r() - 0.5) * 30)) })));
    this.sensors.update((l) => l.map((s) => ({ ...s, value: Math.round((s.value + (r() - 0.5) * (s.max - s.min) * 0.02) * 10) / 10 })));
    this.fleet.update((l) => l.map((m) => (m.tone === 'neutral' ? m : { ...m, lat: m.lat + (r() - 0.5) * 0.004, lng: m.lng + (r() - 0.5) * 0.004 })));
    this.services.update((l) => l.map((s) => ({ ...s, latency: s.latency ? Math.max(20, Math.round(s.latency + (r() - 0.5) * s.latency * 0.1)) : 0 })));
    this.pushLog(new Date());
    this.tick.update((t) => t + 1);
    this.lastUpdate.set(new Date());
  }

  private pushLog(at: Date): void {
    const r = this.rnd;
    const pool: [LogLevel, string, string][] = [
      ['info', 'api', 'GET /v1/clients 200 · 84 ms'], ['info', 'api', 'POST /v1/factures 201 · 132 ms'], ['info', 'gps-ingest', 'Lot de 248 positions reçu (CI-4521-AB…)'],
      ['warn', 'payments', 'Callback Orange Money lent : 612 ms'], ['info', 'auth', 'Connexion réussie · jean.kouassi'], ['debug', 'cache', 'Éviction LRU · 1 204 clés'],
      ['error', 'payments', 'Délai dépassé : callback MTN MoMo (txn 88412)'], ['info', 'scheduler', 'Synchronisation comptable · lot 14/20'],
      ['warn', 'sms', 'Opérateur : file d’attente 1,2 s'], ['info', 'web', 'Déploiement v2.4.1 : 3/3 pods prêts'], ['error', 'scheduler', 'Export Sage : connexion refusée (port 1433)'],
    ];
    const [level, source, msg] = pool[Math.floor(r() * pool.length)];
    this.logs.update((l) => [...l.slice(-199), { id: ++this.logSeq, at, level, source, msg }]);
    queueMicrotask(() => { const el = this.logBox()?.nativeElement; if (el && el.scrollHeight - el.scrollTop - el.clientHeight < 80) el.scrollTop = el.scrollHeight; });
  }

  private svc(id: string, name: string, group: string, icon: string, status: Health, uptime: number, latency: number, bad: number[] = []): Service {
    const days = Array.from({ length: 90 }, (_, i) => (bad.includes(i) ? (i % 3 ? 'degraded' : 'down') : 'up') as Health);
    if (status !== 'up') days[89] = status;
    return { id, name, group, icon, status, uptime, latency, days };
  }
  private walk(base: number, amp: number, n: number): number[] {
    const out: number[] = [];
    let v = base;
    for (let i = 0; i < n; i++) { v = v + (this.rnd() - 0.5) * amp + (base - v) * 0.15; out.push(Math.round(v * 100) / 100); }
    return out;
  }
  private initLabels(): string[] {
    const now = Date.now();
    return Array.from({ length: POINTS }, (_, i) => new Date(now - (POINTS - 1 - i) * 2000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  }
  private initFleet(): MapMarker[] {
    const spots: [string, number, number][] = [['CI-4521-AB', 5.36, -4.01], ['CI-9902-NP', 5.30, -4.02], ['CI-0418-GH', 5.34, -3.98], ['CI-6630-QR', 5.39, -4.06], ['CI-1287-KT', 5.29, -3.95],
      ['CI-7755-BD', 5.42, -3.99], ['CI-3310-MV', 5.33, -4.09], ['CI-5521-ZA', 5.37, -3.93], ['CI-8044-LP', 5.27, -4.04], ['CI-2190-FX', 5.40, -4.03]];
    return spots.map(([plate, lat, lng], i) => ({
      id: plate, lat, lng, title: plate, icon: 'local_shipping',
      tone: i === 2 ? 'error' : i === 7 ? 'neutral' : i % 4 === 1 ? 'warning' : 'success',
      lines: [i === 2 ? 'Sortie de zone' : i === 7 ? 'Hors ligne depuis 2 h' : `${30 + i * 4} km/h`], pulse: i === 2,
    }) as MapMarker);
  }
}
