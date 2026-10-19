import { Component, HostListener, Injectable, ViewEncapsulation, computed, effect, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PdfViewerComponent } from './pdf-viewer.component';
import { VideoPlayerComponent } from './video-player.component';
import { AudioPlayerComponent } from './audio-player.component';
import { MEDIA_ICON, MediaKind, mediaKind } from './media.utils';

export interface ViewerFile {
  name: string;
  url: string;
  /** Type MIME (sinon déduit de l'extension). */
  type?: string;
  size?: number;
  /** Fichier source (forme d'onde audio, nombre de pages PDF, contenu texte). */
  blob?: Blob;
}

interface ViewerData { files: ViewerFile[]; index: number; }

/**
 * Visionneuse plein écran : choisit l'aperçu selon le type (image zoomable/pivotable, PDF, vidéo,
 * audio, texte, sinon « aperçu indisponible »), navigation ←/→, bandeau de vignettes, téléchargement.
 * S'ouvre via `FileViewerService.open(files, index)`.
 */
@Component({
  selector: 'app-file-viewer',
  standalone: true,
  imports: [MatIconModule, MatTooltipModule, PdfViewerComponent, VideoPlayerComponent, AudioPlayerComponent],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="fv">
      <header class="fv-head">
        <mat-icon class="fv-kind" [class]="'fv-kind k-' + kind()">{{ icon(kind()) }}</mat-icon>
        <div class="fv-title">
          <strong [title]="file().name">{{ file().name }}</strong>
          <span>{{ kindLabel[kind()] }}@if (file().size) { · {{ size(file().size!) }} }@if (files.length > 1) { · {{ index() + 1 }} / {{ files.length }} }</span>
        </div>
        <span class="spacer"></span>
        @if (kind() === 'image') {
          <button type="button" class="fv-btn" (click)="zoomBy(-0.25)" matTooltip="Zoom arrière"><mat-icon>zoom_out</mat-icon></button>
          <span class="fv-zoom">{{ Math.round(zoom() * 100) }} %</span>
          <button type="button" class="fv-btn" (click)="zoomBy(0.25)" matTooltip="Zoom avant"><mat-icon>zoom_in</mat-icon></button>
          <button type="button" class="fv-btn" (click)="rotate.set(rotate() + 90)" matTooltip="Pivoter"><mat-icon>rotate_right</mat-icon></button>
          <button type="button" class="fv-btn" (click)="resetView()" matTooltip="Ajuster"><mat-icon>fit_screen</mat-icon></button>
        }
        <a class="fv-btn" [href]="file().url" [attr.download]="file().name" matTooltip="Télécharger"><mat-icon>download</mat-icon></a>
        <button type="button" class="fv-btn" (click)="ref.close()" matTooltip="Fermer (Échap)"><mat-icon>close</mat-icon></button>
      </header>

      <div class="fv-stage" [class.dark]="kind() === 'image' || kind() === 'video'">
        @if (files.length > 1) {
          <button type="button" class="fv-nav prev" (click)="go(-1)" [disabled]="index() === 0" aria-label="Précédent"><mat-icon>chevron_left</mat-icon></button>
          <button type="button" class="fv-nav next" (click)="go(1)" [disabled]="index() === files.length - 1" aria-label="Suivant"><mat-icon>chevron_right</mat-icon></button>
        }
        @switch (kind()) {
          @case ('image') {
            <div class="fv-image" (wheel)="onWheel($event)" (pointerdown)="panStart($event)" (dblclick)="zoom() > 1 ? resetView() : zoomBy(1)">
              <img [src]="file().url" [alt]="file().name" draggable="false"
                [style.transform]="'translate(' + pan().x + 'px,' + pan().y + 'px) scale(' + zoom() + ') rotate(' + rotate() + 'deg)'" />
            </div>
          }
          @case ('pdf') { <app-pdf-viewer class="fv-fill" [src]="file().url" [blob]="file().blob ?? null" [name]="file().name" height="100%" /> }
          @case ('video') { <div class="fv-center"><app-video-player class="fv-video" [src]="file().url" [title]="file().name" /></div> }
          @case ('audio') { <div class="fv-center"><app-audio-player class="fv-audio" [tracks]="[{ src: file().url, title: file().name, blob: file().blob }]" /></div> }
          @case ('text') { <pre class="fv-text">{{ text() ?? 'Chargement…' }}</pre> }
          @default {
            <div class="fv-none"><mat-icon>{{ icon(kind()) }}</mat-icon><strong>Aperçu indisponible</strong>
              <span>Ce type de fichier ne peut pas être affiché dans le navigateur.</span>
              <a [href]="file().url" [attr.download]="file().name"><mat-icon>download</mat-icon>Télécharger le fichier</a></div>
          }
        }
      </div>

      @if (files.length > 1) {
        <div class="fv-strip">
          @for (f of files; track f.url; let i = $index) {
            <button type="button" class="fv-thumb" [class.active]="i === index()" (click)="select(i)" [matTooltip]="f.name">
              @if (kindOf(f) === 'image') { <img [src]="f.url" alt="" /> } @else { <mat-icon>{{ icon(kindOf(f)) }}</mat-icon> }
            </button>
          }
        </div>
      }
    </div>
  `,
  styleUrls: ['./file-viewer.component.scss'],
})
export class FileViewerComponent {
  readonly ref = inject(MatDialogRef<FileViewerComponent>);
  private data = inject<ViewerData>(MAT_DIALOG_DATA);
  readonly files = this.data.files;
  readonly Math = Math;
  readonly kindLabel: Record<MediaKind, string> = { image: 'Image', pdf: 'Document PDF', video: 'Vidéo', audio: 'Audio', text: 'Texte', other: 'Fichier' };

  index = signal(Math.max(0, Math.min(this.data.index, this.files.length - 1)));
  file = computed(() => this.files[this.index()]);
  kind = computed(() => this.kindOf(this.file()));
  zoom = signal(1);
  rotate = signal(0);
  pan = signal({ x: 0, y: 0 });
  text = signal<string | null>(null);

  constructor() {
    effect(() => {
      const f = this.file();
      this.text.set(null);
      if (this.kindOf(f) === 'text') void (f.blob ? f.blob.text() : Promise.resolve('(contenu non disponible)')).then((t) => this.text.set(t.slice(0, 200_000)));
    });
  }

  kindOf(f: ViewerFile): MediaKind { return mediaKind(f.name, f.type); }
  icon(k: MediaKind): string { return MEDIA_ICON[k]; }
  size(b: number): string { return b > 1e6 ? `${(b / 1048576).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} Mo` : `${Math.max(1, Math.round(b / 1024))} Ko`; }

  select(i: number): void { this.index.set(i); this.resetView(); }
  go(d: number): void { const i = this.index() + d; if (i >= 0 && i < this.files.length) this.select(i); }
  resetView(): void { this.zoom.set(1); this.rotate.set(0); this.pan.set({ x: 0, y: 0 }); }
  zoomBy(d: number): void {
    const z = Math.max(0.25, Math.min(6, this.zoom() + d));
    this.zoom.set(z);
    if (z <= 1) this.pan.set({ x: 0, y: 0 });
  }
  onWheel(e: WheelEvent): void { e.preventDefault(); this.zoomBy(e.deltaY < 0 ? 0.2 : -0.2); }
  panStart(e: PointerEvent): void {
    if (this.zoom() <= 1) return;
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
    const o = { ...this.pan() }, sx = e.clientX, sy = e.clientY;
    const move = (ev: PointerEvent) => this.pan.set({ x: o.x + ev.clientX - sx, y: o.y + ev.clientY - sy });
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', () => el.removeEventListener('pointermove', move), { once: true });
  }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    if ((e.target as HTMLElement)?.closest?.('input, textarea, .vp')) return;
    if (e.key === 'ArrowLeft') this.go(-1);
    else if (e.key === 'ArrowRight') this.go(1);
    else if (this.kind() === 'image' && (e.key === '+' || e.key === '=')) this.zoomBy(0.25);
    else if (this.kind() === 'image' && e.key === '-') this.zoomBy(-0.25);
  }
}

/** Ouvre la visionneuse de fichiers dans une modale plein écran. */
@Injectable({ providedIn: 'root' })
export class FileViewerService {
  private dialog = inject(MatDialog);

  open(files: ViewerFile | ViewerFile[], index = 0): MatDialogRef<FileViewerComponent> {
    const list = Array.isArray(files) ? files : [files];
    return this.dialog.open(FileViewerComponent, {
      data: { files: list, index } satisfies ViewerData,
      width: '100vw', height: '100vh', maxWidth: '100vw', maxHeight: '100vh',
      panelClass: 'kit-file-viewer-panel', autoFocus: false,
    });
  }
}
