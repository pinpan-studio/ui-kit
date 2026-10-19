import { Component, computed, inject, input } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartData, ChartOptions, ChartType } from 'chart.js';
import { ThemeService } from '../../../core/services/theme.service';
import type { HarnaisWidget } from '../../../data/static/harnais.data';

type ChartBlock = Extract<HarnaisWidget, { type: 'chart' }>;

/** Palette lisible en clair comme en sombre (teal du kit, puis teintes sémantiques). */
const PALETTE = ['#0f9a9a', '#d97706', '#6366f1', '#a855f7', '#22c55e', '#ef4444', '#06b6d4', '#64748b'];
const alpha = (hex: string, a: number) => hex + Math.round(a * 255).toString(16).padStart(2, '0');

/** Graphique Chart.js piloté par un bloc déclaratif (type, libellés, séries). Options dérivées du thème. */
@Component({
  selector: 'app-hz-chart',
  standalone: true,
  imports: [BaseChartDirective],
  template: `<div class="box" [style.height.px]="block().height ?? (radial() ? 240 : 260)">
    <canvas baseChart [type]="type()" [data]="data()" [options]="options()"></canvas>
  </div>`,
  styles: [`:host { display: block; } .box { position: relative; width: 100%; }`],
})
export class HzChartComponent {
  readonly block = input.required<ChartBlock>();
  private theme = inject(ThemeService);

  readonly radial = computed(() => ['doughnut', 'pie', 'polar', 'radar'].includes(this.block().chart));

  readonly type = computed<ChartType>(() => {
    switch (this.block().chart) {
      case 'area': return 'line';
      case 'hbar': case 'stacked': return 'bar';
      case 'polar': return 'polarArea';
      default: return this.block().chart as ChartType;
    }
  });

  private tokens = computed(() => {
    const dark = this.theme.mode() === 'dark';
    return {
      text: dark ? '#cbd5e1' : '#4b5563', muted: dark ? '#94a3b8' : '#9ca3af',
      grid: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)', surface: dark ? '#1f2937' : '#ffffff',
    };
  });

  readonly data = computed<ChartData>(() => {
    const b = this.block();
    const t = this.tokens();
    const perPoint = ['doughnut', 'pie', 'polar'].includes(b.chart);
    return {
      labels: b.labels,
      datasets: b.series.map((s, i) => {
        const color = s.color ?? PALETTE[i % PALETTE.length];
        if (perPoint) {
          const colors = b.labels.map((_, j) => PALETTE[j % PALETTE.length]);
          return { label: s.label, data: s.data, backgroundColor: b.chart === 'polar' ? colors.map((c) => alpha(c, 0.7)) : colors, borderColor: t.surface, borderWidth: 2, hoverOffset: 4 };
        }
        if (b.chart === 'line' || b.chart === 'area' || b.chart === 'radar') {
          return {
            label: s.label, data: s.data, borderColor: color, pointBackgroundColor: color,
            backgroundColor: b.chart === 'line' ? 'transparent' : alpha(color, i === 0 ? 0.16 : 0.06),
            fill: b.chart !== 'line', tension: 0.35, borderWidth: 2, pointRadius: b.chart === 'radar' ? 2 : 0, pointHoverRadius: 4,
            borderDash: i > 0 && b.chart === 'area' ? [5, 4] : undefined,
          };
        }
        return { label: s.label, data: s.data, backgroundColor: alpha(color, 0.85), hoverBackgroundColor: color, borderRadius: 6, borderSkipped: false, maxBarThickness: 28 };
      }),
    } as ChartData;
  });

  readonly options = computed<ChartOptions>(() => {
    const b = this.block();
    const t = this.tokens();
    const unit = b.unit ?? '';
    const fmt = (v: number) => v.toLocaleString('fr-FR') + unit;
    const axis = (extra: object = {}) => ({ border: { display: false }, grid: { color: t.grid, drawTicks: false }, ticks: { color: t.muted, padding: 6, font: { size: 10.5 } }, ...extra });
    const multi = b.series.length > 1 || this.radial();
    const base: ChartOptions = {
      responsive: true, maintainAspectRatio: false, color: t.text,
      interaction: { mode: this.radial() ? 'nearest' : 'index', intersect: false },
      plugins: {
        legend: multi ? { position: this.radial() && b.chart !== 'radar' ? 'right' : 'top', align: 'end', labels: { boxWidth: 8, boxHeight: 8, usePointStyle: true, pointStyle: 'circle', color: t.text, font: { size: 11 }, padding: 14 } } : { display: false },
        tooltip: {
          backgroundColor: '#111827', titleColor: '#f9fafb', bodyColor: '#e5e7eb', cornerRadius: 8, padding: 10, boxPadding: 4, usePointStyle: true,
          callbacks: { label: (ctx) => ` ${ctx.dataset.label ?? ctx.label}: ${fmt(Number(ctx.raw))}` },
        },
      },
    };
    if (b.chart === 'doughnut') return { ...base, cutout: '68%' } as ChartOptions;
    if (b.chart === 'pie') return base;
    if (b.chart === 'radar' || b.chart === 'polar') {
      return { ...base, scales: { r: { angleLines: { color: t.grid }, grid: { color: t.grid }, pointLabels: { color: t.text, font: { size: 11 } }, ticks: { display: false } } } } as ChartOptions;
    }
    const horizontal = b.chart === 'hbar';
    const stacked = b.chart === 'stacked';
    const value = axis({ beginAtZero: true, stacked, ticks: { color: t.muted, padding: 6, font: { size: 10.5 }, callback: (v: string | number) => Number(v).toLocaleString('fr-FR') } });
    const category = axis({ grid: { display: false }, stacked });
    return { ...base, indexAxis: horizontal ? 'y' : 'x', scales: horizontal ? { x: value, y: category } : { x: category, y: value } } as ChartOptions;
  });
}
