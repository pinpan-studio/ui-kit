import { Component, TemplateRef, computed, contentChild, effect, input, output, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export interface CarouselSlide { url?: string; title?: string; caption?: string; [key: string]: unknown; }

/**
 * Carrousel générique : images (`url`, `title`, `caption`) ou contenu libre via `<ng-template #slide let-item>`.
 * Flèches, points ou vignettes, défilement automatique (pause au survol / onglet masqué), boucle,
 * glisser au doigt ou à la souris, plusieurs éléments visibles, clavier ←/→.
 *
 * ```html
 * <app-carousel [items]="photos" [autoplay]="5000" indicators="thumbs" />
 * ```
 */
@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [NgTemplateOutlet, MatIconModule],
  template: `
    <div class="cr" tabindex="0" role="region" aria-roledescription="carrousel" (keydown.arrowleft)="prev()" (keydown.arrowright)="next()"
      (mouseenter)="hovered.set(true)" (mouseleave)="hovered.set(false)" [style.--per-view]="perView()" [style.--gap.px]="gap()">
      <div class="cr-viewport" [style.aspect-ratio]="slideTpl() ? null : aspectRatio()" (pointerdown)="dragStart($event)">
        <div class="cr-track" [class.dragging]="dragging()" [style.transform]="'translateX(calc(' + (-index() * (100 / perView())) + '% - ' + (index() * gap() / perView()) + 'px + ' + dragX() + 'px))'">
          @for (item of items(); track $index; let i = $index) {
            <div class="cr-slide" [attr.aria-hidden]="i < index() || i >= index() + perView()" role="group" [attr.aria-label]="(i + 1) + ' sur ' + items().length">
              @if (slideTpl(); as tpl) {
                <ng-container *ngTemplateOutlet="tpl; context: { $implicit: item, index: i }" />
              } @else {
                <img [src]="item.url" [alt]="item.title || ''" draggable="false" loading="lazy" />
                @if (item.title || item.caption) {
                  <div class="cr-caption">@if (item.title) { <strong>{{ item.title }}</strong> }@if (item.caption) { <span>{{ item.caption }}</span> }</div>
                }
              }
            </div>
          }
        </div>
        @if (arrows() && pages() > 1) {
          <button type="button" class="cr-arrow prev" (click)="prev()" [disabled]="!loop() && index() === 0" aria-label="Précédent"><mat-icon>chevron_left</mat-icon></button>
          <button type="button" class="cr-arrow next" (click)="next()" [disabled]="!loop() && index() >= maxIndex()" aria-label="Suivant"><mat-icon>chevron_right</mat-icon></button>
        }
        @if (autoplay() && pages() > 1) {
          <button type="button" class="cr-pause" (click)="paused.set(!paused())" [attr.aria-label]="paused() ? 'Reprendre le défilement' : 'Mettre en pause'">
            <mat-icon>{{ paused() ? 'play_arrow' : 'pause' }}</mat-icon></button>
        }
      </div>

      @if (indicators() === 'dots' && pages() > 1) {
        <div class="cr-dots">
          @for (p of pageList(); track p) { <button type="button" [class.active]="p === index()" (click)="goTo(p)" [attr.aria-label]="'Aller à ' + (p + 1)"></button> }
        </div>
      } @else if (indicators() === 'thumbs' && pages() > 1) {
        <div class="cr-thumbs">
          @for (item of items(); track $index; let i = $index) {
            <button type="button" [class.active]="i === index()" (click)="goTo(i)"><img [src]="item.url" alt="" /></button>
          }
        </div>
      }
    </div>
  `,
  styleUrls: ['./carousel.component.scss'],
})
export class CarouselComponent {
  items = input<CarouselSlide[]>([]);
  /** Délai du défilement automatique en ms (0 = désactivé). */
  autoplay = input(0);
  loop = input(true);
  arrows = input(true);
  indicators = input<'dots' | 'thumbs' | 'none'>('dots');
  perView = input(1);
  gap = input(12);
  aspectRatio = input('16 / 9');
  indexChange = output<number>();

  slideTpl = contentChild<TemplateRef<unknown>>('slide');

  index = signal(0);
  hovered = signal(false);
  paused = signal(false);
  dragging = signal(false);
  dragX = signal(0);
  maxIndex = computed(() => Math.max(0, this.items().length - this.perView()));
  pages = computed(() => this.maxIndex() + 1);
  pageList = computed(() => Array.from({ length: this.pages() }, (_, i) => i));

  constructor() {
    effect((onCleanup) => {
      const ms = this.autoplay();
      if (!ms || this.hovered() || this.paused() || this.dragging()) return;
      const t = setInterval(() => { if (!document.hidden) this.next(); }, ms);
      onCleanup(() => clearInterval(t));
    });
    effect(() => { if (this.index() > this.maxIndex()) this.index.set(this.maxIndex()); });
  }

  goTo(i: number): void {
    const max = this.maxIndex();
    const n = this.loop() ? (i < 0 ? max : i > max ? 0 : i) : Math.max(0, Math.min(max, i));
    this.index.set(n);
    this.indexChange.emit(n);
  }
  next(): void { this.goTo(this.index() + 1); }
  prev(): void { this.goTo(this.index() - 1); }

  dragStart(e: PointerEvent): void {
    if ((e.target as HTMLElement).closest('button') || e.button !== 0) return;
    const el = e.currentTarget as HTMLElement;
    const width = el.getBoundingClientRect().width / this.perView();
    const sx = e.clientX;
    el.setPointerCapture(e.pointerId);
    this.dragging.set(true);
    const move = (ev: PointerEvent) => this.dragX.set(ev.clientX - sx);
    const up = () => {
      el.removeEventListener('pointermove', move);
      const dx = this.dragX();
      this.dragging.set(false);
      this.dragX.set(0);
      if (Math.abs(dx) > width * 0.18) dx < 0 ? this.next() : this.prev();
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up, { once: true });
    el.addEventListener('pointercancel', up, { once: true });
  }

}
