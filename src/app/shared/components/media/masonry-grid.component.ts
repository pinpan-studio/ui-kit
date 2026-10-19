import {
  Component, DestroyRef, ElementRef, TemplateRef, afterNextRender, computed, contentChild, effect, inject, input, signal, viewChildren,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

/**
 * Grille masonry (« mur de briques ») générique : cartes de hauteurs différentes empilées sans trous,
 * en conservant l'ordre de lecture gauche → droite (contrairement aux colonnes CSS).
 * Technique : grille CSS à rangées fines ; chaque cellule est mesurée (ResizeObserver) et s'étend
 * sur le nombre de rangées correspondant à sa hauteur — les images qui se chargent sont prises en compte.
 * Colonnes responsives (largeur minimale) ou nombre fixe.
 *
 * ```html
 * <app-masonry-grid [items]="cartes" [minColumnWidth]="240" [gap]="16">
 *   <ng-template #item let-c let-i="index">…</ng-template>
 * </app-masonry-grid>
 * ```
 */
@Component({
  selector: 'app-masonry-grid',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    <div class="mg" [style.grid-template-columns]="template()" [style.column-gap.px]="gap()" [style.grid-auto-rows.px]="unit" [class.ready]="ready()">
      @for (it of items(); track trackBy()(it, $index); let i = $index) {
        <div class="mg-cell" [style.grid-row-end]="'span ' + (spans()[i] || 1)" [style.animation-delay.ms]="animate() ? Math.min(i, 12) * 35 : 0" [class.anim]="animate()">
          <div #inner class="mg-inner" [attr.data-i]="i" [style.padding-bottom.px]="gap()">
            @if (itemTpl(); as tpl) { <ng-container *ngTemplateOutlet="tpl; context: { $implicit: it, index: i }" /> }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .mg { display: grid; grid-auto-flow: row dense; align-items: start; }
    .mg-cell { min-width: 0; }
    .mg-inner { box-sizing: border-box; }
    .mg:not(.ready) { visibility: hidden; }
    .anim { animation: mg-in 0.35s ease both; }
    @keyframes mg-in { from { opacity: 0; transform: translateY(10px); } }
    @media (prefers-reduced-motion: reduce) { .anim { animation: none; } }
  `],
})
export class MasonryGridComponent<T = unknown> {
  items = input<T[]>([]);
  /** Largeur minimale d'une colonne (px) — le nombre de colonnes s'adapte à la largeur disponible. */
  minColumnWidth = input(240);
  /** Nombre de colonnes fixe (prioritaire sur minColumnWidth). */
  columns = input<number | null>(null);
  gap = input(16);
  animate = input(true);
  trackBy = input<(item: T, index: number) => unknown>((_it, i) => i);

  itemTpl = contentChild<TemplateRef<unknown>>('item');
  private inners = viewChildren<ElementRef<HTMLElement>>('inner');

  readonly Math = Math;
  /** Hauteur d'une rangée de la grille (px) : plus elle est fine, plus le placement est précis. */
  readonly unit = 4;
  spans = signal<number[]>([]);
  ready = signal(false);
  template = computed(() => {
    const c = this.columns();
    return c ? `repeat(${c}, minmax(0, 1fr))` : `repeat(auto-fill, minmax(min(100%, ${this.minColumnWidth()}px), 1fr))`;
  });

  private ro?: ResizeObserver;

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      this.ro = new ResizeObserver((entries) => {
        const next = [...this.spans()];
        let changed = false;
        for (const e of entries) {
          const i = +((e.target as HTMLElement).dataset['i'] ?? -1);
          const span = Math.max(1, Math.ceil(e.target.getBoundingClientRect().height / this.unit));
          if (i >= 0 && next[i] !== span) { next[i] = span; changed = true; }
        }
        if (changed) this.spans.set(next);
        this.ready.set(true);
      });
      destroyRef.onDestroy(() => this.ro?.disconnect());
      this.observe();
    });
    // Ré-observe les cellules quand la liste change.
    effect(() => { this.inners(); this.gap(); queueMicrotask(() => this.observe()); });
  }

  private observe(): void {
    if (!this.ro) return;
    this.ro.disconnect();
    this.spans.set(this.spans().slice(0, this.items().length));
    for (const el of this.inners()) this.ro.observe(el.nativeElement);
    if (!this.items().length) this.ready.set(true);
  }
}
