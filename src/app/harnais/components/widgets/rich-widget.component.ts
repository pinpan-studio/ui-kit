import { Component, computed, input, signal } from '@angular/core';
import { MaterialModule } from '../../../shared/material.module';
import type { HarnaisWidget } from '../../../data/static/harnais.data';
import { copyText } from '../../harnais.utils';

/** Icônes de fichiers disponibles dans assets/icons-files. */
const FILE_ICONS = new Set(['avi', 'bat', 'css', 'csv', 'eps', 'exe', 'gif', 'html', 'iso', 'jpg', 'js', 'mov', 'mp3', 'mp4', 'pdf', 'php', 'png', 'ppt', 'psd', 'sql', 'svg', 'tiff', 'ttf', 'txt', 'xls']);

/**
 * Widgets « de précision » : fiche clé/valeur, étapes, liste de contrôle, objectifs, diff de code,
 * sources citées, étiquettes, carte de chaleur, fichiers, cartes, comparatif.
 */
@Component({
  selector: 'app-hz-rich',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './rich-widget.component.html',
  styleUrls: ['./rich-widget.component.scss'],
})
export class HzRichComponent {
  readonly block = input.required<HarnaisWidget>();

  /** Liste de contrôle : état local coché / décoché. */
  private toggled = signal<Set<number>>(new Set());
  readonly copied = signal<string | null>(null);

  readonly checklist = computed(() => {
    const b = this.block();
    if (b.type !== 'checklist') return [];
    return b.items.map((it, i) => ({ ...it, done: this.toggled().has(i) ? !it.done : !!it.done }));
  });
  readonly checklistDone = computed(() => this.checklist().filter((i) => i.done).length);

  readonly diff = computed(() => {
    const b = this.block();
    if (b.type !== 'diff') return { lines: [], added: 0, removed: 0 };
    let oldN = 0, newN = 0, added = 0, removed = 0;
    const lines = b.patch.split('\n').map((raw) => {
      const hunk = /^@@ -(\d+)(?:,\d+)? \+(\d+)/.exec(raw);
      if (hunk) { oldN = +hunk[1] - 1; newN = +hunk[2] - 1; return { kind: 'hunk', text: raw, old: '', new: '' }; }
      const c = raw[0];
      const text = raw.slice(1);
      if (c === '+') { added++; return { kind: 'add', text, old: '', new: String(++newN) }; }
      if (c === '-') { removed++; return { kind: 'del', text, old: String(++oldN), new: '' }; }
      return { kind: 'ctx', text, old: String(++oldN), new: String(++newN) };
    });
    return { lines, added, removed };
  });

  readonly heatMax = computed(() => {
    const b = this.block();
    return b.type === 'heatmap' ? Math.max(1, ...b.values.flat()) : 1;
  });

  toggleCheck(i: number): void {
    this.toggled.update((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; });
  }

  copy(value: string): void {
    copyText(value);
    this.copied.set(value);
    setTimeout(() => this.copied.set(null), 1200);
  }

  pct = (v: number, target?: number) => Math.min(100, Math.round((v / (target ?? 100)) * 100));
  heat = (v: number) => `color-mix(in srgb, var(--primary-color) ${Math.round(8 + (v / this.heatMax()) * 82)}%, var(--hover-bg))`;
  fileIcon = (ext: string) => `assets/icons-files/${FILE_ICONS.has(ext.toLowerCase()) ? ext.toLowerCase() : 'other'}.png`;
  toneVar = (tone?: string) => (!tone || tone === 'primary' ? 'var(--primary-color)' : tone === 'neutral' ? 'var(--text-muted)' : `var(--${tone}-color)`);
  isBool = (v: boolean | string): v is boolean => typeof v === 'boolean';
  stepIcon = (s: string) => ({ done: 'check', current: 'more_horiz', error: 'priority_high', todo: '' }[s] ?? '');
}
