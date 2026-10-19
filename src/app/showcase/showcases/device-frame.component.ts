import { Component, DestroyRef, ElementRef, booleanAttribute, computed, effect, inject, input, output, signal, untracked, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DeviceKind } from './showcases.data';

/** Dimensions CSS de la zone d'affichage (viewport de l'iframe) de chaque appareil, en portrait. */
export const DEVICE_SPECS: Record<DeviceKind, { label: string; icon: string; width: number; height: number; model: string }> = {
  desktop: { label: 'Ordinateur', icon: 'desktop_windows', width: 1440, height: 860, model: 'Écran 1440 × 860' },
  tablet: { label: 'Tablette', icon: 'tablet_mac', width: 820, height: 1180, model: 'iPad Air · 820 × 1180' },
  phone: { label: 'Mobile', icon: 'phone_iphone', width: 393, height: 852, model: 'iPhone 15 Pro · 393 × 852' },
};

/** Épaisseurs du cadre autour de la zone d'affichage (bordure, barre du navigateur, pied d'écran). */
const BEZEL = { desktop: { x: 14, top: 14 + 84, bottom: 26 + 96 }, tablet: { x: 22, top: 22, bottom: 22 }, phone: { x: 13, top: 13, bottom: 13 } };
/** Barre d'état iOS / iPadOS, posée au-dessus de l'iframe. */
const STATUS_BAR = { desktop: 0, tablet: 24, phone: 54 };

/**
 * Cadre d'appareil autour d'une iframe : ordinateur (écran + navigateur), tablette (iPad) ou téléphone (iPhone).
 * Le cadre garde ses dimensions réelles et est mis à l'échelle pour tenir dans son conteneur
 * (`zoom="fit"`), ou affiché à une échelle fixe. Les media queries de la page affichée
 * réagissent donc à la vraie largeur de l'appareil.
 */
@Component({
  selector: 'kit-device-frame',
  standalone: true,
  imports: [NgTemplateOutlet, MatIconModule, MatTooltipModule],
  templateUrl: './device-frame.component.html',
  styleUrls: ['./device-frame.component.scss'],
  host: { '[class.thumb]': 'thumbnail()', '[class.scrollable]': 'zoom() !== "fit"' },
})
export class DeviceFrameComponent {
  private sanitizer = inject(DomSanitizer);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** URL de même origine chargée dans l'iframe. */
  src = input.required<string>();
  device = input<DeviceKind>('desktop');
  landscape = input(false, { transform: booleanAttribute });
  /** 'fit' : ajuste au conteneur ; sinon facteur d'échelle fixe (1 = taille réelle). */
  zoom = input<'fit' | number>('fit');
  /** Vignette : non interactive, iframe chargée à la demande, sans suivi d'URL. */
  thumbnail = input(false, { transform: booleanAttribute });
  title = input('Aperçu');

  /** Chemin courant affiché dans l'iframe (suit la navigation interne). */
  readonly urlChange = output<string>();

  private iframe = viewChild<ElementRef<HTMLIFrameElement>>('frame');
  private box = signal({ w: 0, h: 0 });

  readonly loading = signal(true);
  readonly currentPath = signal('');
  readonly pageTitle = signal('');
  readonly host$ = location.host;
  readonly clock = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(new Date(2026, 0, 1, 9, 41));

  /** L'ordinateur et les appareils mobiles n'ont pas le même cadre : passer de l'un à l'autre recrée l'iframe. */
  private isDesktop = computed(() => this.device() === 'desktop');
  private loadedSrc = '';

  /** URL de l'iframe ; quand le cadre est recréé, reprend la page où l'on était. */
  readonly safeSrc = computed(() => {
    const src = this.src();
    this.isDesktop();
    const resume = untracked(this.currentPath);
    const url = resume && this.loadedSrc === src ? resume : src;
    this.loadedSrc = src;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  /** Viewport (orienté) de l'iframe, barre d'état comprise. */
  readonly screen = computed(() => {
    const s = DEVICE_SPECS[this.device()];
    const rotate = this.landscape() && this.device() !== 'desktop';
    return rotate ? { w: s.height, h: s.width } : { w: s.width, h: s.height };
  });

  /** Barre d'état : masquée sur iPhone en paysage, comme sur l'appareil. */
  readonly statusBar = computed(() => (this.device() === 'phone' && this.landscape() ? 0 : STATUS_BAR[this.device()]));

  readonly frameSize = computed(() => {
    const b = BEZEL[this.device()];
    const sc = this.screen();
    return { w: sc.w + b.x * 2, h: sc.h + b.top + b.bottom };
  });

  readonly scale = computed(() => {
    const z = this.zoom();
    if (z !== 'fit') return z;
    const { w, h } = this.box();
    const f = this.frameSize();
    if (!w || !h) return 0.0001;
    const pad = this.thumbnail() ? 0 : 32;
    return Math.min(1, (w - pad) / f.w, (h - pad) / f.h);
  });

  constructor() {
    const ro = new ResizeObserver(([e]) => this.box.set({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(this.host.nativeElement);

    // Le routeur de l'application affichée navigue sans recharger l'iframe : on suit son URL.
    const timer = setInterval(() => this.trackLocation(), 600);
    inject(DestroyRef).onDestroy(() => { ro.disconnect(); clearInterval(timer); });

    effect(() => { this.src(); this.isDesktop(); this.loading.set(true); });
  }

  onLoad(): void {
    this.loading.set(false);
    this.trackLocation();
  }

  reload(): void {
    this.loading.set(true);
    this.win()?.location.reload();
  }

  back(): void { this.win()?.history.back(); }
  forward(): void { this.win()?.history.forward(); }

  /** Navigue dans l'iframe (saisie dans la barre d'adresse). */
  go(value: string): void {
    const path = value.trim().replace(/^https?:\/\/[^/]+/, '') || '/';
    const win = this.win();
    if (!win) return;
    this.loading.set(true);
    win.location.href = path.startsWith('/') ? path : '/' + path;
  }

  private win(): Window | null {
    return this.iframe()?.nativeElement.contentWindow ?? null;
  }

  private trackLocation(): void {
    if (this.thumbnail()) return;
    try {
      const win = this.win();
      if (!win || win.location.href === 'about:blank') return;
      const path = win.location.pathname + win.location.search + win.location.hash;
      if (path !== this.currentPath()) { this.currentPath.set(path); this.urlChange.emit(path); }
      const t = win.document.title;
      if (t !== this.pageTitle()) this.pageTitle.set(t);
    } catch { /* document d'une autre origine : rien à suivre */ }
  }
}
