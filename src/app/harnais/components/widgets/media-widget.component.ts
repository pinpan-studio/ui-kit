import { Component, OnDestroy, OnInit, input, signal } from '@angular/core';
import { MaterialModule } from '../../../shared/material.module';
import {
  AudioPlayerComponent, AudioTrack, GalleryImage, ImageGalleryComponent, PdfViewerComponent, VideoGalleryComponent, VideoItem,
  VideoPlayerComponent, YoutubePlayerComponent,
} from '../../../shared/components/media';
import { buildSampleImageSet, buildSamplePdf, buildSampleWav, recordSampleVideo } from '../../../data/static/media.data';
import type { HarnaisWidget } from '../../../data/static/harnais.data';

type MediaBlock = Extract<HarnaisWidget, { type: 'video' | 'videos' | 'audio' | 'pdf' | 'gallery' | 'image' }>;

/** Teintes des vidéos d'exemple générées (une par vidéo de galerie). */
const VIDEO_HUES = ['#4f6bed', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4'];

/**
 * Widgets médias : lecteur vidéo (fichier ou YouTube), galerie vidéo, lecteur audio, lecteur PDF,
 * galerie d'images, image légendée. Sans source fournie, un exemple est généré localement
 * (canvas, WAV, PDF) : aucun téléchargement.
 */
@Component({
  selector: 'app-hz-media',
  standalone: true,
  imports: [MaterialModule, VideoPlayerComponent, YoutubePlayerComponent, VideoGalleryComponent, AudioPlayerComponent, PdfViewerComponent, ImageGalleryComponent],
  template: `
    @let b = block();
    @switch (b.type) {
      @case ('video') {
        @if (b.youtube) {
          <app-youtube-player [video]="b.youtube" [title]="b.title ?? ''" [duration]="b.duration ?? ''" />
        } @else if (loading()) {
          <div class="pending"><mat-spinner diameter="22" /><span>Préparation de la vidéo…</span></div>
        } @else {
          <app-video-player [src]="videoSrc()" [poster]="b.poster ?? ''" [title]="b.title ?? ''"
            emptyLabel="Ce navigateur ne sait pas générer la vidéo d’exemple." />
        }
        @if (b.caption) { <p class="caption">{{ b.caption }}</p> }
      }
      @case ('videos') {
        @if (loading()) { <div class="pending"><mat-spinner diameter="22" /><span>Préparation des vidéos…</span></div> }
        @else { <app-video-gallery [videos]="videos()" [layout]="b.layout ?? 'grid'" [minCardWidth]="200" /> }
      }
      @case ('audio') { <app-audio-player [tracks]="tracks()" [variant]="b.variant ?? (b.tracks.length > 1 ? 'playlist' : 'default')" /> }
      @case ('pdf') {
        <app-pdf-viewer [src]="pdfSrc()" [blob]="pdf()" [name]="b.name ?? 'document.pdf'" [height]="(b.height ?? 460) + 'px'" />
      }
      @case ('gallery') { <app-image-gallery [images]="images()" [layout]="b.layout ?? 'grid'" [minWidth]="150" [rowHeight]="150" /> }
      @case ('image') {
        <figure class="image">
          <img [src]="b.src" [alt]="b.alt ?? b.caption ?? ''" loading="lazy" />
          @if (b.caption) { <figcaption>{{ b.caption }}</figcaption> }
        </figure>
      }
    }
  `,
  styles: [`
    :host { display: block; }
    .pending {
      display: flex; align-items: center; justify-content: center; gap: 10px; aspect-ratio: 16 / 9;
      border-radius: 12px; background: var(--hover-bg); color: var(--text-muted); font-size: var(--hz-ui);
    }
    .caption { margin: 8px 0 0; font-size: var(--hz-meta); color: var(--text-muted); }
    .image { margin: 0; }
    .image img { display: block; width: 100%; max-height: 420px; object-fit: cover; border-radius: 12px; }
    .image figcaption { margin-top: 8px; font-size: var(--hz-meta); color: var(--text-muted); text-align: center; }
  `],
})
export class HzMediaComponent implements OnInit, OnDestroy {
  readonly block = input.required<MediaBlock>();

  readonly loading = signal(false);
  readonly videoSrc = signal<string | null>(null);
  readonly videos = signal<VideoItem[]>([]);
  readonly tracks = signal<AudioTrack[]>([]);
  readonly pdf = signal<Blob | null>(null);
  readonly pdfSrc = signal<string | null>(null);
  readonly images = signal<GalleryImage[]>([]);

  private urls: string[] = [];
  private destroyed = false;

  ngOnInit(): void {
    const b = this.block();
    switch (b.type) {
      case 'video':
        if (b.src) this.videoSrc.set(b.src);
        else if (!b.youtube) {
          this.loading.set(true);
          void recordSampleVideo(b.seconds ?? 6, 640, 360, { title: b.title }).then((blob) => {
            if (this.destroyed) return;
            this.videoSrc.set(blob ? this.url(blob) : null);
            this.loading.set(false);
          });
        }
        break;
      case 'videos': {
        const samples = b.videos.filter((v) => v.sample && !v.src && !v.youtube);
        if (!samples.length) { this.videos.set(b.videos); break; }
        this.loading.set(true);
        void Promise.all(samples.map((v, i) => recordSampleVideo(5, 640, 360, { title: v.title, color: VIDEO_HUES[i % VIDEO_HUES.length] }))).then((blobs) => {
          if (this.destroyed) return;
          const src = new Map(samples.map((v, i) => [v.id, blobs[i] ? this.url(blobs[i]!) : undefined]));
          // Les vidéos d'exemple que le navigateur n'a pas su enregistrer sont écartées.
          this.videos.set(b.videos.filter((v) => !src.has(v.id) || src.get(v.id)).map((v) => (src.get(v.id) ? { ...v, src: src.get(v.id) } : v)));
          this.loading.set(false);
        });
        break;
      }
      case 'audio':
        this.tracks.set(b.tracks.map((t, i) => {
          if (t.src) return { title: t.title, artist: t.artist, src: t.src, icon: t.icon };
          const blob = buildSampleWav(t.sample ?? 12, i);
          return { title: t.title, artist: t.artist, icon: t.icon, src: this.url(blob), blob };
        }));
        break;
      case 'pdf':
        if (b.src) this.pdfSrc.set(b.src);
        else {
          const blob = buildSamplePdf(b.title ?? 'Document', b.pages ?? 3);
          this.pdf.set(blob);
          this.pdfSrc.set(this.url(blob));
        }
        break;
      case 'gallery':
        this.images.set(b.images?.length ? b.images : buildSampleImageSet(b.sample ?? 8).map((img) => ({
          url: img.url, width: img.width, height: img.height, category: img.category, name: img.name, title: img.caption, caption: img.category,
        })));
        break;
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.urls.forEach((u) => URL.revokeObjectURL(u));
  }

  private url(blob: Blob): string {
    const u = URL.createObjectURL(blob);
    this.urls.push(u);
    return u;
  }
}
