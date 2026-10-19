import { Component, ElementRef, HostListener, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

export type PdfZoom = 'page-fit' | 'page-width' | number;

/**
 * Lecteur PDF : rendu par le moteur PDF natif du navigateur (aucune dépendance), piloté par une barre
 * d'outils maison — navigation par page, sommaire des pages, zoom, téléchargement, impression, plein écran.
 * Repli propre (ouvrir / télécharger) quand le navigateur ne sait pas afficher de PDF intégré (mobiles).
 *
 * ```html
 * <app-pdf-viewer [src]="blobUrl" [blob]="file" name="contrat.pdf" height="640px" />
 * ```
 */
@Component({
  selector: 'app-pdf-viewer',
  standalone: true,
  imports: [MatIconModule, MatMenuModule, MatTooltipModule],
  template: `
    <div #shell class="pv" [style.height]="fullscreen() ? '100vh' : height()" [class.is-fullscreen]="fullscreen()">
      <div class="pv-toolbar">
        @if (pageCount() > 1) {
          <button type="button" class="pv-btn" [class.on]="sidebar()" (click)="sidebar.set(!sidebar())" matTooltip="Pages"><mat-icon>view_sidebar</mat-icon></button>
        }
        <div class="pv-name"><mat-icon>picture_as_pdf</mat-icon><span [title]="name()">{{ name() }}</span></div>
        <span class="spacer"></span>
        @if (src() && supported) {
          <div class="pv-pager">
            <button type="button" class="pv-btn" (click)="goto(page() - 1)" [disabled]="page() <= 1" matTooltip="Page précédente"><mat-icon>chevron_left</mat-icon></button>
            <input type="number" min="1" [max]="pageCount() || null" [value]="page()" (change)="goto(+$any($event.target).value)" aria-label="Page" />
            @if (pageCount()) { <span>/ {{ pageCount() }}</span> }
            <button type="button" class="pv-btn" (click)="goto(page() + 1)" [disabled]="!!pageCount() && page() >= pageCount()" matTooltip="Page suivante"><mat-icon>chevron_right</mat-icon></button>
          </div>
          <div class="pv-zoom hide-sm">
            <button type="button" class="pv-btn" (click)="stepZoom(-1)" matTooltip="Zoom arrière"><mat-icon>zoom_out</mat-icon></button>
            <button type="button" class="pv-zoom-label" [matMenuTriggerFor]="zoomMenu">{{ zoomLabel() }}<mat-icon>arrow_drop_down</mat-icon></button>
            <button type="button" class="pv-btn" (click)="stepZoom(1)" matTooltip="Zoom avant"><mat-icon>zoom_in</mat-icon></button>
          </div>
          <mat-menu #zoomMenu="matMenu" class="m3-dropdown-menu">
            <button mat-menu-item (click)="setZoom('page-fit')">Page entière</button>
            <button mat-menu-item (click)="setZoom('page-width')">Pleine largeur</button>
            @for (z of zooms; track z) { <button mat-menu-item (click)="setZoom(z)">{{ z }} %</button> }
          </mat-menu>
        }
        @if (src()) {
          <button type="button" class="pv-btn hide-xs" (click)="print()" matTooltip="Imprimer"><mat-icon>print</mat-icon></button>
          <a class="pv-btn" [href]="src()" [attr.download]="name()" matTooltip="Télécharger"><mat-icon>download</mat-icon></a>
          <button type="button" class="pv-btn hide-xs" (click)="toggleFullscreen()" [matTooltip]="fullscreen() ? 'Quitter le plein écran' : 'Plein écran'"><mat-icon>{{ fullscreen() ? 'fullscreen_exit' : 'fullscreen' }}</mat-icon></button>
        }
      </div>

      <div class="pv-body">
        @if (sidebar() && pageCount() > 1 && supported && src()) {
          <nav class="pv-pages" aria-label="Pages du document">
            @for (p of pageList(); track p) {
              <button type="button" class="pv-page" [class.active]="p === page()" (click)="goto(p)">
                <span class="sheet"><i></i><i></i><i></i><i class="short"></i></span><span class="num">{{ p }}</span>
              </button>
            }
          </nav>
        }
        <div class="pv-stage">
          @if (!src()) {
            <div class="pv-state"><mat-icon>description</mat-icon><strong>Aucun document</strong><span>{{ emptyLabel() }}</span></div>
          } @else if (!supported) {
            <div class="pv-state"><mat-icon>picture_as_pdf</mat-icon><strong>Aperçu indisponible sur cet appareil</strong>
              <span>Ce navigateur n’affiche pas les PDF intégrés.</span>
              <div class="pv-actions">
                <a [href]="src()" target="_blank" rel="noopener"><mat-icon>open_in_new</mat-icon>Ouvrir</a>
                <a [href]="src()" [attr.download]="name()"><mat-icon>download</mat-icon>Télécharger</a>
              </div></div>
          } @else {
            @for (k of [frameKey()]; track k) {
              <iframe #frame [src]="frameUrl()" [title]="name()"></iframe>
            }
          }
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./pdf-viewer.component.scss'],
})
export class PdfViewerComponent {
  private sanitizer = inject(DomSanitizer);
  private shell = viewChild<ElementRef<HTMLElement>>('shell');
  private frame = viewChild<ElementRef<HTMLIFrameElement>>('frame');

  /** URL du PDF (blob:, data: ou même origine). */
  src = input<string | null>(null);
  /** Fichier source : permet de compter les pages. */
  blob = input<Blob | null>(null);
  /** Nombre de pages connu (sinon déduit de `blob`). */
  pages = input<number | null>(null);
  name = input('document.pdf');
  height = input('620px');
  emptyLabel = input('Sélectionnez un fichier PDF pour l’afficher.');

  readonly supported = typeof navigator === 'undefined' || (navigator as any).pdfViewerEnabled !== false;
  readonly zooms = [50, 75, 100, 125, 150, 200];
  page = signal(1);
  zoom = signal<PdfZoom>('page-width');
  sidebar = signal(true);
  fullscreen = signal(false);
  private detected = signal(0);
  frameKey = signal(0);

  pageCount = computed(() => this.pages() ?? this.detected());
  pageList = computed(() => Array.from({ length: this.pageCount() }, (_, i) => i + 1));
  zoomLabel = computed(() => { const z = this.zoom(); return z === 'page-fit' ? 'Page' : z === 'page-width' ? 'Largeur' : `${z} %`; });
  frameUrl = computed<SafeResourceUrl>(() =>
    this.sanitizer.bypassSecurityTrustResourceUrl(`${this.src()}#page=${this.page()}&zoom=${this.zoom()}&toolbar=0&navpanes=0&view=FitH`));

  constructor() {
    effect(() => {
      const b = this.blob();
      this.page.set(1);
      this.detected.set(0);
      if (!b) return;
      void b.text().then((t) => this.detected.set((t.match(/\/Type\s*\/Page(?![s\w])/g) || []).length));
    });
  }

  goto(p: number): void {
    const max = this.pageCount() || Infinity;
    const n = Math.max(1, Math.min(max, Math.round(p) || 1));
    if (n === this.page()) return;
    this.page.set(n);
    this.reload();
  }
  setZoom(z: PdfZoom): void { this.zoom.set(z); this.reload(); }
  stepZoom(d: 1 | -1): void {
    const z = this.zoom();
    const cur = typeof z === 'number' ? z : 100;
    const next = d > 0 ? this.zooms.find((v) => v > cur) : [...this.zooms].reverse().find((v) => v < cur);
    this.setZoom(next ?? cur);
  }
  /** Le moteur natif ne réagit pas toujours au seul changement de fragment : on recrée l'iframe. */
  private reload(): void { this.frameKey.update((k) => k + 1); }

  print(): void {
    try { this.frame()?.nativeElement.contentWindow?.print(); }
    catch { window.open(this.src()!, '_blank'); }
  }
  toggleFullscreen(): void {
    const el = this.shell()?.nativeElement;
    document.fullscreenElement ? void document.exitFullscreen() : void el?.requestFullscreen?.();
  }
  @HostListener('document:fullscreenchange') onFs(): void { this.fullscreen.set(document.fullscreenElement === this.shell()?.nativeElement); }
}
