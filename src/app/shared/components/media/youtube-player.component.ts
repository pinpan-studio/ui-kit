import { Component, ElementRef, HostListener, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

/** Extrait l'identifiant d'une URL YouTube (watch, youtu.be, shorts, embed) ou renvoie l'id tel quel. */
export function youtubeId(urlOrId: string): string | null {
  const s = (urlOrId || '').trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  const m = s.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/);
  return m ? m[1] : null;
}

/**
 * Lecteur YouTube « façade » : seule la miniature est chargée ; l'iframe (domaine youtube-nocookie)
 * n'est insérée qu'au clic — page plus légère et aucun cookie avant consentement.
 * Contrôle via l'API postMessage de l'embed (lecture, pause, muet) sans script externe.
 *
 * ```html
 * <app-youtube-player video="https://youtu.be/xxxxxxxxxxx" title="Installer une balise" [start]="30" />
 * ```
 */
@Component({
  selector: 'app-youtube-player',
  standalone: true,
  imports: [MatIconModule, MatTooltipModule],
  template: `
    <div class="yt" [style.aspect-ratio]="aspectRatio()">
      @if (!id()) {
        <div class="yt-state"><mat-icon>link_off</mat-icon><strong>Vidéo introuvable</strong><span>L’URL ou l’identifiant YouTube est invalide.</span></div>
      } @else if (!activated()) {
        <button type="button" class="yt-facade" (click)="activate()" [attr.aria-label]="'Lire la vidéo : ' + (title() || id())">
          <img [src]="thumb()" [alt]="title()" loading="lazy" (error)="thumbFallback($event)" />
          <span class="yt-shade"></span>
          @if (title()) { <span class="yt-title">{{ title() }}</span> }
          <span class="yt-play"><svg viewBox="0 0 68 48" width="68" height="48"><path d="M66.5 7.7a8.5 8.5 0 0 0-6-6C55.3.3 34 .3 34 .3s-21.3 0-26.5 1.4a8.5 8.5 0 0 0-6 6C.1 13 .1 24 .1 24s0 11 1.4 16.3a8.5 8.5 0 0 0 6 6C12.7 47.7 34 47.7 34 47.7s21.3 0 26.5-1.4a8.5 8.5 0 0 0 6-6C67.9 35 67.9 24 67.9 24s0-11-1.4-16.3z" fill="#f00"/><path d="M45 24 27 14v20z" fill="#fff"/></svg></span>
          @if (duration()) { <span class="yt-duration">{{ duration() }}</span> }
          <span class="yt-consent"><mat-icon>shield</mat-icon>La vidéo sera chargée depuis YouTube</span>
        </button>
      } @else {
        <iframe #frame [src]="embedUrl()" [title]="title() || 'Vidéo YouTube'" frameborder="0" allowfullscreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin" (load)="onLoad()"></iframe>
      }
    </div>
    @if (controls() && activated()) {
      <div class="yt-bar">
        <button type="button" (click)="command(playing() ? 'pauseVideo' : 'playVideo')"><mat-icon>{{ playing() ? 'pause' : 'play_arrow' }}</mat-icon>{{ playing() ? 'Pause' : 'Lire' }}</button>
        <button type="button" (click)="toggleMute()"><mat-icon>{{ muted() ? 'volume_off' : 'volume_up' }}</mat-icon>{{ muted() ? 'Son coupé' : 'Son' }}</button>
        <button type="button" (click)="command('seekTo', [start(), true])"><mat-icon>replay</mat-icon>Revenir au début</button>
        <span class="spacer"></span>
        <a [href]="watchUrl()" target="_blank" rel="noopener" matTooltip="Ouvrir sur YouTube"><mat-icon>open_in_new</mat-icon></a>
      </div>
    }
  `,
  styleUrls: ['./youtube-player.component.scss'],
})
export class YoutubePlayerComponent {
  private sanitizer = inject(DomSanitizer);
  private frame = viewChild<ElementRef<HTMLIFrameElement>>('frame');

  /** URL YouTube ou identifiant de 11 caractères. */
  video = input.required<string>();
  title = input('');
  /** Durée affichée sur la miniature (texte libre, ex. « 4:12 »). */
  duration = input('');
  start = input(0);
  aspectRatio = input('16 / 9');
  /** Barre de contrôle externe (pilotage via postMessage). */
  controls = input(false);
  /** Charger directement l'iframe sans façade. */
  eager = input(false);
  stateChange = output<'playing' | 'paused' | 'ended'>();

  private clicked = signal(false);
  activated = computed(() => this.clicked() || this.eager());
  playing = signal(false);
  muted = signal(false);

  id = computed(() => youtubeId(this.video()));
  thumb = computed(() => `https://i.ytimg.com/vi/${this.id()}/hqdefault.jpg`);
  watchUrl = computed(() => `https://www.youtube.com/watch?v=${this.id()}${this.start() ? '&t=' + this.start() + 's' : ''}`);
  embedUrl = computed<SafeResourceUrl>(() => {
    const p = new URLSearchParams({ autoplay: this.clicked() ? '1' : '0', rel: '0', modestbranding: '1', enablejsapi: '1', playsinline: '1' });
    if (this.start()) p.set('start', String(this.start()));
    if (typeof location !== 'undefined') p.set('origin', location.origin);
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube-nocookie.com/embed/${this.id()}?${p}`);
  });

  activate(): void { this.clicked.set(true); this.playing.set(true); }

  thumbFallback(e: Event): void {
    const img = e.target as HTMLImageElement;
    if (!img.dataset['fb']) { img.dataset['fb'] = '1'; img.src = `https://i.ytimg.com/vi/${this.id()}/mqdefault.jpg`; }
  }

  /** Demande à l'iframe de nous envoyer ses changements d'état. */
  onLoad(): void { this.post({ event: 'listening', id: this.id() }); }

  command(func: string, args: unknown[] = []): void { this.post({ event: 'command', func, args }); }
  toggleMute(): void { this.command(this.muted() ? 'unMute' : 'mute'); this.muted.set(!this.muted()); }

  private post(msg: object): void {
    this.frame()?.nativeElement.contentWindow?.postMessage(JSON.stringify(msg), 'https://www.youtube-nocookie.com');
  }

  @HostListener('window:message', ['$event'])
  onMessage(e: MessageEvent): void {
    if (!/youtube(-nocookie)?\.com$/.test(new URL(e.origin || 'about:blank', 'https://x').hostname)) return;
    if (e.source !== this.frame()?.nativeElement.contentWindow) return;
    try {
      const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      const state = data?.info?.playerState ?? (data?.event === 'onStateChange' ? data.info : undefined);
      if (state === 1) { this.playing.set(true); this.stateChange.emit('playing'); }
      else if (state === 2) { this.playing.set(false); this.stateChange.emit('paused'); }
      else if (state === 0) { this.playing.set(false); this.stateChange.emit('ended'); }
      if (typeof data?.info?.muted === 'boolean') this.muted.set(data.info.muted);
    } catch { /* message étranger */ }
  }
}
