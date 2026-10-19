import { Component, computed, input, signal } from '@angular/core';
import { MaterialModule } from '../../../shared/material.module';
import type { HarnaisWidget, HzColumn, HzRow } from '../../../data/static/harnais.data';

type TableBlock = Extract<HarnaisWidget, { type: 'table' }>;

/** Tableau déclaratif : tri par colonne, recherche, pagination, export CSV local. */
@Component({
  selector: 'app-hz-table',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './table-widget.component.html',
  styleUrls: ['./table-widget.component.scss'],
})
export class HzTableComponent {
  readonly block = input.required<TableBlock>();

  readonly query = signal('');
  readonly sort = signal<{ key: string; dir: 1 | -1 } | null>(null);
  readonly page = signal(0);

  readonly pageSize = computed(() => this.block().pageSize ?? 8);

  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    let rows = this.block().rows;
    if (q) rows = rows.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(q)));
    const s = this.sort();
    if (s) rows = [...rows].sort((a, b) => compare(a[s.key], b[s.key]) * s.dir);
    return rows;
  });
  readonly pages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize())));
  readonly visible = computed(() => {
    const start = Math.min(this.page(), this.pages() - 1) * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });
  readonly range = computed(() => {
    const total = this.filtered().length;
    if (!total) return '0 ligne';
    const start = Math.min(this.page(), this.pages() - 1) * this.pageSize();
    return `${start + 1}–${Math.min(start + this.pageSize(), total)} sur ${total}`;
  });

  toggleSort(key: string): void {
    const s = this.sort();
    this.sort.set(!s || s.key !== key ? { key, dir: 1 } : s.dir === 1 ? { key, dir: -1 } : null);
    this.page.set(0);
  }

  search(value: string): void { this.query.set(value); this.page.set(0); }

  isNumeric = (c: HzColumn) => c.kind === 'number' || c.kind === 'progress';
  format(c: HzColumn, v: string | number): string {
    return typeof v === 'number' && c.kind === 'number' ? v.toLocaleString('fr-FR') + (c.unit ?? '') : String(v);
  }
  tone = (c: HzColumn, v: string | number) => c.tones?.[String(v)] ?? 'neutral';
  initials = (v: string | number) => String(v).split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  /** Export CSV (séparateur « ; » pour Excel FR), généré localement. */
  exportCsv(): void {
    const b = this.block();
    const esc = (v: unknown) => `"${String(v).replace(/"/g, '""')}"`;
    const lines = [b.columns.map((c) => esc(c.label)).join(';'), ...this.filtered().map((r: HzRow) => b.columns.map((c) => esc(r[c.key] ?? '')).join(';'))];
    const url = URL.createObjectURL(new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' }));
    Object.assign(document.createElement('a'), { href: url, download: (b.title ?? 'export').replace(/\W+/g, '-').toLowerCase() + '.csv' }).click();
    URL.revokeObjectURL(url);
  }
}

function compare(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a ?? '').localeCompare(String(b ?? ''), 'fr', { numeric: true });
}
