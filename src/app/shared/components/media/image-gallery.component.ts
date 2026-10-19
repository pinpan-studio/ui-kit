import { Component, DestroyRef, ElementRef, afterNextRender, booleanAttribute, computed, inject, input, linkedSignal, output, signal, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FileViewerService } from './file-viewer.component';
import { MasonryGridComponent } from './masonry-grid.component';

export interface GalleryImage {
  url: string;
  title?: string;
  caption?: string;
  /** Dimensions d'origine (nécessaires pour les lignes justifiées ; sinon 4:3). */
  width?: number;
  height?: number;
  category?: string;
  alt?: string;
  name?: string;
}

export type ImageGalleryLayout = 'grid' | 'justified' | 'masonry';

interface JustifiedRow { items: { img: GalleryImage; index: number; w: number }[]; height: number; }

/**
 * Galerie d'images : grille régulière (vignettes recadrées), lignes justifiées (proportions respectées,
 * hauteur de ligne homogène) ou masonry. Filtres par catégorie, légende au survol, sélection multiple,
 * « Afficher plus », ouverture dans la visionneuse plein écran (zoom, rotation, ←/→).
 *
 * ```html
 * <app-image-gallery [images]="photos" layout="justified" [rowHeight]="200" filters selectable />
 * ```
 */
@Component({
  selector: 'app-image-gallery',
  standalone: true,
  imports: [NgTemplateOutlet, MatIconModule, MatTooltipModule, MasonryGridComponent],
  templateUrl: './image-gallery.component.html',
  styleUrls: ['./image-gallery.component.scss'],
})
export class ImageGalleryComponent {
  private viewer = inject(FileViewerService);
  private host = viewChild<ElementRef<HTMLElement>>('stage');

  images = input<GalleryImage[]>([]);
  layoutInput = input<ImageGalleryLayout>('grid', { alias: 'layout' });
  /** Afficher le sélecteur de disposition. */
  switcher = input(false, { transform: booleanAttribute });
  filters = input(false, { transform: booleanAttribute });
  selectable = input(false, { transform: booleanAttribute });
  /** Grille : largeur minimale d'une vignette et ratio. */
  minWidth = input(200);
  aspectRatio = input('1 / 1');
  /** Lignes justifiées : hauteur cible. */
  rowHeight = input(200);
  gap = input(8);
  /** Nombre d'images affichées avant « Afficher plus » (0 = toutes). */
  pageSize = input(0);
  selectionChange = output<GalleryImage[]>();

  layout = linkedSignal(() => this.layoutInput());
  category = signal<string | null>(null);
  selected = signal<Set<GalleryImage>>(new Set());
  shown = linkedSignal(() => this.pageSize() || Infinity);
  width = signal(0);

  categories = computed(() => {
    const m = new Map<string, number>();
    this.images().forEach((i) => i.category && m.set(i.category, (m.get(i.category) ?? 0) + 1));
    return [...m.entries()].map(([name, count]) => ({ name, count }));
  });
  filtered = computed(() => this.images().filter((i) => !this.category() || i.category === this.category()));
  visible = computed(() => this.filtered().slice(0, this.shown()));
  remaining = computed(() => Math.max(0, this.filtered().length - this.visible().length));

  /** Lignes justifiées : on remplit chaque ligne jusqu'à la largeur, puis on ajuste sa hauteur. */
  rows = computed<JustifiedRow[]>(() => {
    const W = this.width(), target = this.rowHeight(), gap = this.gap();
    if (!W) return [];
    const rows: JustifiedRow[] = [];
    let row: { img: GalleryImage; index: number; ratio: number }[] = [];
    let sum = 0;
    const flush = (last: boolean) => {
      if (!row.length) return;
      const avail = W - gap * (row.length - 1);
      const h = last && sum * target < avail ? target : avail / sum;
      rows.push({ height: Math.round(h), items: row.map((r) => ({ img: r.img, index: r.index, w: Math.floor(r.ratio * h) })) });
      row = []; sum = 0;
    };
    this.visible().forEach((img, index) => {
      const ratio = (img.width ?? 4) / (img.height ?? 3);
      row.push({ img, index, ratio });
      sum += ratio;
      if (sum * target + gap * (row.length - 1) >= W) flush(false);
    });
    flush(true);
    return rows;
  });

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const el = this.host()?.nativeElement;
      if (!el) return;
      const ro = new ResizeObserver(() => this.width.set(Math.floor(el.getBoundingClientRect().width)));
      ro.observe(el);
      destroyRef.onDestroy(() => ro.disconnect());
    });
  }

  readonly trackUrl = (img: GalleryImage) => img.url;

  open(index: number): void {
    const list = this.visible();
    this.viewer.open(list.map((i, k) => ({ name: i.name ?? i.title ?? `image-${k + 1}.jpg`, url: i.url, type: 'image/jpeg' })), index);
  }
  toggle(img: GalleryImage, e?: Event): void {
    e?.stopPropagation();
    const s = new Set(this.selected());
    s.has(img) ? s.delete(img) : s.add(img);
    this.selected.set(s);
    this.selectionChange.emit([...s]);
  }
  click(img: GalleryImage, index: number, e: MouseEvent): void {
    if (this.selectable() && (this.selected().size || e.shiftKey || e.metaKey || e.ctrlKey)) this.toggle(img);
    else this.open(index);
  }
  clearSelection(): void { this.selected.set(new Set()); this.selectionChange.emit([]); }
  selectAll(): void { this.selected.set(new Set(this.filtered())); this.selectionChange.emit(this.filtered()); }
  more(): void { this.shown.update((n) => n + (this.pageSize() || Infinity)); }
  setCategory(c: string | null): void { this.category.set(c); this.shown.set(this.pageSize() || Infinity); }
}
