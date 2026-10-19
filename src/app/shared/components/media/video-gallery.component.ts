import { Component, booleanAttribute, computed, effect, inject, input, linkedSignal, output, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { VideoPlayerComponent } from './video-player.component';
import { YoutubePlayerComponent, youtubeId } from './youtube-player.component';

export interface VideoItem {
  id: string;
  title: string;
  /** Vidéo locale / même origine (blob:, data:, assets). */
  src?: string;
  /** URL ou identifiant YouTube (alternative à src). */
  youtube?: string;
  poster?: string;
  /** Durée affichée (« 4:12 »). */
  duration?: string;
  category?: string;
  author?: string;
  /** Ligne secondaire libre (« 1 248 vues · il y a 2 j »). */
  meta?: string;
  description?: string;
}

/** Extrait une image d'une vidéo locale (≈ 1 s) pour servir de miniature. */
export function captureVideoFrame(src: string, at = 1): Promise<string | null> {
  return new Promise((resolve) => {
    const v = document.createElement('video');
    v.muted = true; v.preload = 'auto'; v.playsInline = true; v.src = src;
    const fail = () => resolve(null);
    const timer = setTimeout(fail, 8000);
    v.addEventListener('error', () => { clearTimeout(timer); fail(); }, { once: true });
    v.addEventListener('loadeddata', () => { v.currentTime = Math.min(at, (isFinite(v.duration) ? v.duration : at * 2) / 2); }, { once: true });
    v.addEventListener('seeked', () => {
      clearTimeout(timer);
      try {
        const c = document.createElement('canvas');
        c.width = 480; c.height = Math.round((480 * (v.videoHeight || 9)) / (v.videoWidth || 16));
        c.getContext('2d')!.drawImage(v, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', 0.8));
      } catch { fail(); }
    }, { once: true });
  });
}

/**
 * Galerie vidéo :
 * - `grid` : cartes (miniature, durée, titre, auteur), lecture dans une modale avec précédent / suivant ;
 * - `theater` : grand lecteur + playlist latérale « À suivre », enchaînement automatique.
 * Mélange vidéos locales (miniature extraite automatiquement) et YouTube (mode façade), filtres par catégorie.
 *
 * ```html
 * <app-video-gallery [videos]="videos" layout="theater" filters />
 * ```
 */
@Component({
  selector: 'app-video-gallery',
  standalone: true,
  imports: [MatIconModule, MatTooltipModule, VideoPlayerComponent, YoutubePlayerComponent],
  templateUrl: './video-gallery.component.html',
  styleUrls: ['./video-gallery.component.scss'],
})
export class VideoGalleryComponent {
  private dialog = inject(MatDialog);

  videos = input<VideoItem[]>([]);
  layout = input<'grid' | 'theater'>('grid');
  filters = input(false, { transform: booleanAttribute });
  autoplayNext = input(true, { transform: booleanAttribute });
  minCardWidth = input(240);
  selectedChange = output<VideoItem>();

  category = signal<string | null>(null);
  /** Une lecture a déjà eu lieu (clic ou fin de vidéo) : les suivantes démarrent seules — jamais au chargement. */
  started = signal(false);
  current = linkedSignal(() => this.filtered()[0] ?? null);
  private thumbs = signal<Record<string, string>>({});

  categories = computed(() => [...new Set(this.videos().map((v) => v.category).filter((c): c is string => !!c))]);
  filtered = computed(() => this.videos().filter((v) => !this.category() || v.category === this.category()));
  next = computed(() => {
    const l = this.filtered(), i = l.findIndex((v) => v.id === this.current()?.id);
    return i >= 0 && i < l.length - 1 ? l[i + 1] : null;
  });

  constructor() {
    // Miniatures des vidéos locales sans poster.
    effect(() => {
      for (const v of this.videos()) {
        if (v.poster || v.youtube || !v.src || this.thumbs()[v.id]) continue;
        void captureVideoFrame(v.src).then((url) => url && this.thumbs.update((t) => ({ ...t, [v.id]: url })));
      }
    });
  }

  thumb(v: VideoItem): string | null {
    if (v.poster) return v.poster;
    if (v.youtube) { const id = youtubeId(v.youtube); return id ? `https://i.ytimg.com/vi/${id}/mqdefault.jpg` : null; }
    return this.thumbs()[v.id] ?? null;
  }

  select(v: VideoItem): void {
    if (this.layout() === 'theater') { this.started.set(true); this.current.set(v); this.selectedChange.emit(v); return; }
    const list = this.filtered();
    this.dialog.open(VideoGalleryDialogComponent, {
      data: { videos: list, index: list.indexOf(v) } satisfies VideoDialogData,
      width: '1000px', maxWidth: 'calc(100vw - 32px)', panelClass: 'kit-video-dialog-panel', autoFocus: false,
    });
    this.selectedChange.emit(v);
  }
  onEnded(): void { const n = this.next(); if (n && this.autoplayNext()) { this.started.set(true); this.current.set(n); } }
}

// ── Lecture en modale (mode grille) ─────────────────────
interface VideoDialogData { videos: VideoItem[]; index: number; }

@Component({
  selector: 'app-video-gallery-dialog',
  standalone: true,
  imports: [MatIconModule, MatTooltipModule, VideoPlayerComponent, YoutubePlayerComponent],
  template: `
    <div class="vgd">
      @if (video(); as v) {
        @if (v.youtube) { <app-youtube-player [video]="v.youtube" [title]="v.title" [eager]="true" /> }
        @else { <app-video-player [src]="v.src ?? null" [poster]="v.poster ?? ''" [autoplay]="true" (ended)="next()" /> }
        <div class="vgd-info">
          <div class="vgd-text">
            <strong>{{ v.title }}</strong>
            <span>@if (v.author) { {{ v.author }} · }{{ v.meta || v.category }}</span>
            @if (v.description) { <p>{{ v.description }}</p> }
          </div>
          <div class="vgd-nav">
            <button type="button" (click)="go(-1)" [disabled]="index() === 0" matTooltip="Précédente"><mat-icon>skip_previous</mat-icon></button>
            <span>{{ index() + 1 }} / {{ data.videos.length }}</span>
            <button type="button" (click)="go(1)" [disabled]="index() >= data.videos.length - 1" matTooltip="Suivante"><mat-icon>skip_next</mat-icon></button>
            <button type="button" (click)="ref.close()" matTooltip="Fermer (Échap)"><mat-icon>close</mat-icon></button>
          </div>
        </div>
      }
    </div>
  `,
})
export class VideoGalleryDialogComponent {
  readonly data = inject<VideoDialogData>(MAT_DIALOG_DATA);
  readonly ref = inject(MatDialogRef<VideoGalleryDialogComponent>);
  index = signal(this.data.index);
  video = computed(() => this.data.videos[this.index()]);
  go(d: number): void { const i = this.index() + d; if (i >= 0 && i < this.data.videos.length) this.index.set(i); }
  next(): void { this.go(1); }
}
