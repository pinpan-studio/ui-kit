import { Component, computed, effect, input, output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

/**
 * Recadrage d'image local (canvas) : glisser pour cadrer, molette / curseur pour zoomer, rotation par 90°,
 * cadre rond (avatar) ou rectangulaire au ratio voulu. `crop()` renvoie une data URL PNG/JPEG.
 *
 * ```html
 * <app-image-cropper #c [src]="photo" [round]="true" (cropped)="avatar = $event" />
 * ```
 */
@Component({
  selector: 'app-image-cropper',
  standalone: true,
  imports: [MatIconModule, MatTooltipModule],
  template: `
    <div class="ic">
      <div class="ic-stage" [style.width.px]="frameW() + pad * 2" [style.height.px]="frameH() + pad * 2"
        (pointerdown)="dragStart($event)" (wheel)="onWheel($event)">
        @if (img(); as i) {
          <img [src]="src()" alt="" draggable="false" [style.width.px]="i.naturalWidth" [style.height.px]="i.naturalHeight"
            [style.transform]="'translate(calc(-50% + ' + pos().x + 'px), calc(-50% + ' + pos().y + 'px)) rotate(' + rotation() + 'deg) scale(' + scale() + ')'" />
        } @else {
          <div class="ic-empty"><mat-icon>add_photo_alternate</mat-icon><span>Aucune image</span></div>
        }
        <div class="ic-frame" [class.round]="round()" [style.width.px]="frameW()" [style.height.px]="frameH()" [style.left.px]="pad" [style.top.px]="pad">
          @if (!round()) { <i class="g1"></i><i class="g2"></i><i class="g3"></i><i class="g4"></i> }
        </div>
      </div>
      <div class="ic-tools">
        <mat-icon>photo_size_select_small</mat-icon>
        <input type="range" min="1" max="4" step="0.01" [value]="zoom()" (input)="setZoom(+$any($event.target).value)" aria-label="Zoom" [disabled]="!img()" />
        <mat-icon>photo_size_select_large</mat-icon>
        <button type="button" (click)="rotateBy(-90)" matTooltip="Pivoter à gauche" [disabled]="!img()"><mat-icon>rotate_left</mat-icon></button>
        <button type="button" (click)="rotateBy(90)" matTooltip="Pivoter à droite" [disabled]="!img()"><mat-icon>rotate_right</mat-icon></button>
        <button type="button" (click)="reset()" matTooltip="Réinitialiser" [disabled]="!img()"><mat-icon>restart_alt</mat-icon></button>
      </div>
      @if (actions()) {
        <div class="ic-actions">
          <button type="button" class="ghost" (click)="cancel.emit()">Annuler</button>
          <button type="button" class="primary" (click)="apply()" [disabled]="!img()"><mat-icon>crop</mat-icon>Appliquer</button>
        </div>
      }
    </div>
  `,
  styleUrls: ['./image-cropper.component.scss'],
})
export class ImageCropperComponent {
  src = input<string | null>(null);
  /** Largeur / hauteur du cadre. */
  aspect = input(1);
  round = input(false);
  /** Largeur du cadre à l'écran (px). */
  frameSize = input(240);
  /** Largeur de l'image produite (px). */
  outputWidth = input(512);
  format = input<'image/png' | 'image/jpeg'>('image/png');
  actions = input(true);
  cropped = output<string>();
  cancel = output<void>();

  readonly pad = 28;
  img = signal<HTMLImageElement | null>(null);
  zoom = signal(1);
  rotation = signal(0);
  pos = signal({ x: 0, y: 0 });

  frameW = computed(() => this.frameSize());
  frameH = computed(() => Math.round(this.frameSize() / this.aspect()));
  private swapped = computed(() => Math.abs(this.rotation() / 90) % 2 === 1);
  /** Dimensions de l'image après rotation. */
  private dims = computed(() => {
    const i = this.img();
    if (!i) return { w: 1, h: 1 };
    return this.swapped() ? { w: i.naturalHeight, h: i.naturalWidth } : { w: i.naturalWidth, h: i.naturalHeight };
  });
  /** Échelle « couvrir le cadre » × zoom. */
  scale = computed(() => Math.max(this.frameW() / this.dims().w, this.frameH() / this.dims().h) * this.zoom());

  constructor() {
    effect(() => {
      const s = this.src();
      this.img.set(null);
      this.reset();
      if (!s) return;
      const im = new Image();
      im.onload = () => this.src() === s && this.img.set(im);
      im.src = s;
    });
  }

  reset(): void { this.zoom.set(1); this.rotation.set(0); this.pos.set({ x: 0, y: 0 }); }
  setZoom(z: number): void { this.zoom.set(Math.max(1, Math.min(4, z))); this.clamp(); }
  rotateBy(d: number): void { this.rotation.update((r) => r + d); this.clamp(); }
  onWheel(e: WheelEvent): void { if (!this.img()) return; e.preventDefault(); this.setZoom(this.zoom() * (e.deltaY < 0 ? 1.08 : 0.92)); }

  private clamp(p = this.pos()): void {
    const mx = Math.max(0, (this.dims().w * this.scale() - this.frameW()) / 2);
    const my = Math.max(0, (this.dims().h * this.scale() - this.frameH()) / 2);
    this.pos.set({ x: Math.max(-mx, Math.min(mx, p.x)), y: Math.max(-my, Math.min(my, p.y)) });
  }

  dragStart(e: PointerEvent): void {
    if (!this.img()) return;
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
    const o = this.pos(), sx = e.clientX, sy = e.clientY;
    const move = (ev: PointerEvent) => this.clamp({ x: o.x + ev.clientX - sx, y: o.y + ev.clientY - sy });
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', () => el.removeEventListener('pointermove', move), { once: true });
  }

  /** Produit l'image recadrée (data URL). */
  crop(): string | null {
    const i = this.img();
    if (!i) return null;
    const k = this.outputWidth() / this.frameW();
    const c = document.createElement('canvas');
    c.width = this.outputWidth();
    c.height = Math.round(this.frameH() * k);
    const g = c.getContext('2d')!;
    if (this.format() === 'image/jpeg') { g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); }
    if (this.round()) { g.beginPath(); g.ellipse(c.width / 2, c.height / 2, c.width / 2, c.height / 2, 0, 0, Math.PI * 2); g.clip(); }
    g.translate(c.width / 2 + this.pos().x * k, c.height / 2 + this.pos().y * k);
    g.rotate((this.rotation() * Math.PI) / 180);
    g.scale(this.scale() * k, this.scale() * k);
    g.imageSmoothingQuality = 'high';
    g.drawImage(i, -i.naturalWidth / 2, -i.naturalHeight / 2);
    return c.toDataURL(this.format(), 0.92);
  }

  apply(): void { const url = this.crop(); if (url) this.cropped.emit(url); }
}
