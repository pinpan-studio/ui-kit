import { Component, ElementRef, HostListener, OnDestroy, computed, input, output, signal, viewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { formatMediaTime } from './media.utils';

export interface VideoTrack { src: string; label: string; srclang: string; default?: boolean; }

/**
 * Lecteur vidéo aux contrôles maison (thème clair / sombre) au-dessus d'un <video> natif :
 * lecture, barre de progression avec tampon et aperçu du temps, volume, vitesse, sous-titres,
 * image dans l'image, plein écran et raccourcis clavier (Espace/K, J/L, ←/→, ↑/↓, M, F, C).
 *
 * ```html
 * <app-video-player [src]="url" poster="assets/bg.jpg" title="Trajet CI-4521-AB" [tracks]="subs" />
 * ```
 */
@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [MatIconModule, MatMenuModule, MatTooltipModule, MatProgressSpinnerModule],
  template: `
    <div #shell class="vp" [class.is-playing]="playing()" [class.show-ui]="uiVisible() || !playing()" [class.is-fullscreen]="fullscreen()"
      [style.aspect-ratio]="aspectRatio()" tabindex="0" (mousemove)="poke()" (mouseleave)="hideSoon(300)" (keydown)="onKey($event)">
      @if (src()) {
        <video #video [src]="src()" [poster]="poster() || null" [muted]="muted()" [loop]="loop()" playsinline preload="metadata"
          (click)="toggle()" (dblclick)="toggleFullscreen()" (loadedmetadata)="onMeta()" (durationchange)="onMeta()" (timeupdate)="onTime()" (progress)="onProgress()"
          (play)="playing.set(true)" (pause)="playing.set(false)" (ended)="onEnded()" (waiting)="buffering.set(true)" (playing)="buffering.set(false)"
          (canplay)="onCanPlay()" (volumechange)="onVolume()" (error)="error.set(true)" (emptied)="reset()">
          @for (t of tracks(); track t.src) { <track kind="subtitles" [src]="t.src" [label]="t.label" [srclang]="t.srclang" [default]="t.default" /> }
        </video>
      }

      @if (error() || !src()) {
        <div class="vp-state"><mat-icon>{{ src() ? 'videocam_off' : 'movie' }}</mat-icon>
          <strong>{{ src() ? 'Lecture impossible' : 'Aucune vidéo' }}</strong>
          <span>{{ src() ? 'Le format de ce fichier n’est pas pris en charge par le navigateur.' : emptyLabel() }}</span></div>
      } @else {
        @if (buffering() && playing()) { <div class="vp-center"><mat-spinner diameter="44" /></div> }
        @if (!playing() && !buffering()) {
          <button type="button" class="vp-big-play" (click)="toggle()" aria-label="Lire"><mat-icon>play_arrow</mat-icon></button>
        }
        @if (title()) { <div class="vp-title">{{ title() }}</div> }

        <div class="vp-controls" (click)="$event.stopPropagation()">
          <div #bar class="vp-progress" (pointerdown)="seekStart($event)" (pointermove)="hover($event)" (pointerleave)="hoverX.set(null)">
            <div class="vp-buffer" [style.width.%]="bufferedPct()"></div>
            <div class="vp-played" [style.width.%]="playedPct()"></div>
            <div class="vp-thumb" [style.left.%]="playedPct()"></div>
            @if (hoverX() !== null) { <div class="vp-tip" [style.left.px]="hoverX()">{{ fmt(hoverTime()) }}</div> }
          </div>
          <div class="vp-row">
            <button type="button" class="vp-btn" (click)="toggle()" [matTooltip]="playing() ? 'Pause (K)' : 'Lire (K)'"><mat-icon>{{ playing() ? 'pause' : 'play_arrow' }}</mat-icon></button>
            <button type="button" class="vp-btn hide-xs" (click)="skip(-10)" matTooltip="Reculer de 10 s (J)"><mat-icon>replay_10</mat-icon></button>
            <button type="button" class="vp-btn hide-xs" (click)="skip(10)" matTooltip="Avancer de 10 s (L)"><mat-icon>forward_10</mat-icon></button>
            <div class="vp-volume">
              <button type="button" class="vp-btn" (click)="toggleMute()" [matTooltip]="muted() ? 'Activer le son (M)' : 'Couper le son (M)'"><mat-icon>{{ volumeIcon() }}</mat-icon></button>
              <input type="range" min="0" max="1" step="0.05" [value]="muted() ? 0 : volume()" (input)="setVolume(+$any($event.target).value)" aria-label="Volume" />
            </div>
            <span class="vp-time">{{ fmt(current()) }} / {{ fmt(duration()) }}</span>
            <span class="spacer"></span>
            @if (tracks().length) {
              <button type="button" class="vp-btn" [class.on]="captions()" (click)="toggleCaptions()" matTooltip="Sous-titres (C)"><mat-icon>{{ captions() ? 'subtitles' : 'subtitles_off' }}</mat-icon></button>
            }
            <button type="button" class="vp-btn rate" [matMenuTriggerFor]="rateMenu" matTooltip="Vitesse de lecture">{{ rate() === 1 ? '1×' : rate() + '×' }}</button>
            <mat-menu #rateMenu="matMenu" class="m3-dropdown-menu">
              @for (r of rates; track r) { <button mat-menu-item (click)="setRate(r)"><mat-icon>{{ r === rate() ? 'check' : '' }}</mat-icon>{{ r === 1 ? 'Normale' : r + '×' }}</button> }
            </mat-menu>
            @if (pipSupported) { <button type="button" class="vp-btn hide-xs" (click)="pip()" matTooltip="Image dans l’image"><mat-icon>picture_in_picture_alt</mat-icon></button> }
            <button type="button" class="vp-btn" (click)="toggleFullscreen()" [matTooltip]="fullscreen() ? 'Quitter le plein écran (F)' : 'Plein écran (F)'"><mat-icon>{{ fullscreen() ? 'fullscreen_exit' : 'fullscreen' }}</mat-icon></button>
          </div>
        </div>
      }
    </div>
  `,
  styleUrls: ['./video-player.component.scss'],
})
export class VideoPlayerComponent implements OnDestroy {
  src = input<string | null>(null);
  poster = input<string>('');
  title = input<string>('');
  tracks = input<VideoTrack[]>([]);
  loop = input(false);
  /** Démarre la lecture dès que la vidéo est prête (navigateurs : seulement après une interaction). */
  autoplay = input(false);
  aspectRatio = input('16 / 9');
  emptyLabel = input('Sélectionnez un fichier vidéo pour le lire.');
  ended = output<void>();

  private shell = viewChild<ElementRef<HTMLElement>>('shell');
  private videoRef = viewChild<ElementRef<HTMLVideoElement>>('video');
  private bar = viewChild<ElementRef<HTMLElement>>('bar');

  readonly rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
  readonly pipSupported = typeof document !== 'undefined' && 'pictureInPictureEnabled' in document && (document as any).pictureInPictureEnabled;
  playing = signal(false);
  buffering = signal(false);
  error = signal(false);
  current = signal(0);
  duration = signal(0);
  buffered = signal(0);
  volume = signal(1);
  muted = signal(false);
  rate = signal(1);
  captions = signal(false);
  fullscreen = signal(false);
  uiVisible = signal(true);
  hoverX = signal<number | null>(null);
  hoverTime = signal(0);

  playedPct = computed(() => (this.duration() ? (this.current() / this.duration()) * 100 : 0));
  bufferedPct = computed(() => (this.duration() ? (this.buffered() / this.duration()) * 100 : 0));
  volumeIcon = computed(() => (this.muted() || this.volume() === 0 ? 'volume_off' : this.volume() < 0.5 ? 'volume_down' : 'volume_up'));
  fmt = formatMediaTime;

  private hideTimer?: ReturnType<typeof setTimeout>;
  private fixingDuration = false;

  private get video(): HTMLVideoElement | undefined { return this.videoRef()?.nativeElement; }

  toggle(): void {
    const v = this.video;
    if (!v) return;
    v.paused ? void v.play().catch(() => this.error.set(true)) : v.pause();
    this.poke();
  }
  skip(s: number): void { const v = this.video; if (v) v.currentTime = Math.max(0, Math.min(this.duration(), v.currentTime + s)); this.poke(); }
  setVolume(val: number): void { const v = this.video; if (!v) return; v.volume = val; v.muted = val === 0; }
  toggleMute(): void { const v = this.video; if (v) v.muted = !v.muted; }
  setRate(r: number): void { if (this.video) this.video.playbackRate = r; this.rate.set(r); }
  toggleCaptions(): void {
    const on = !this.captions();
    this.captions.set(on);
    const list = this.video?.textTracks;
    if (list) for (let i = 0; i < list.length; i++) list[i].mode = on && i === 0 ? 'showing' : 'hidden';
  }
  pip(): void {
    const v = this.video as any;
    if (!v) return;
    (document as any).pictureInPictureElement ? (document as any).exitPictureInPicture() : v.requestPictureInPicture?.();
  }
  toggleFullscreen(): void {
    const el = this.shell()?.nativeElement;
    if (!el) return;
    document.fullscreenElement ? void document.exitFullscreen() : void el.requestFullscreen?.();
  }
  @HostListener('document:fullscreenchange') onFs(): void { this.fullscreen.set(document.fullscreenElement === this.shell()?.nativeElement); }

  onMeta(): void {
    const v = this.video;
    if (!v) return;
    this.error.set(false);
    // Les WebM produits par MediaRecorder n'ont pas de durée : on force le calcul en sautant à la fin.
    if (v.duration === Infinity && !this.fixingDuration) {
      this.fixingDuration = true;
      v.currentTime = 1e101;
      v.addEventListener('timeupdate', () => { v.currentTime = 0; this.fixingDuration = false; this.duration.set(v.duration); }, { once: true });
      return;
    }
    if (isFinite(v.duration)) this.duration.set(v.duration);
    this.captions.set(this.tracks().some((t) => t.default));
  }
  onTime(): void { if (!this.fixingDuration && this.video) this.current.set(this.video.currentTime); }
  onProgress(): void {
    const v = this.video;
    if (v?.buffered.length) this.buffered.set(v.buffered.end(v.buffered.length - 1));
  }
  onVolume(): void { const v = this.video; if (v) { this.volume.set(v.volume); this.muted.set(v.muted); } }
  onEnded(): void { this.playing.set(false); this.ended.emit(); }
  /** Changement de source : on repart d'un état propre (le même lecteur sert pour toute une playlist). */
  reset(): void { this.playing.set(false); this.current.set(0); this.duration.set(0); this.buffered.set(0); this.error.set(false); this.fixingDuration = false; }
  onCanPlay(): void {
    this.buffering.set(false);
    if (this.autoplay() && this.video?.paused && !this.current()) void this.video.play().catch(() => {});
  }

  // ── Progression ────────────────────────────────────
  private timeAt(e: PointerEvent): number {
    const r = this.bar()!.nativeElement.getBoundingClientRect();
    return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * this.duration();
  }
  hover(e: PointerEvent): void {
    const r = this.bar()!.nativeElement.getBoundingClientRect();
    this.hoverX.set(Math.max(0, Math.min(r.width, e.clientX - r.left)));
    this.hoverTime.set(this.timeAt(e));
  }
  seekStart(e: PointerEvent): void {
    const v = this.video;
    if (!v || !this.duration()) return;
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => { v.currentTime = this.timeAt(ev); this.current.set(v.currentTime); };
    move(e);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', () => el.removeEventListener('pointermove', move), { once: true });
  }

  // ── Affichage des contrôles ────────────────────────
  poke(): void { this.uiVisible.set(true); this.hideSoon(2500); }
  hideSoon(ms: number): void {
    clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => this.playing() && this.uiVisible.set(false), ms);
  }

  onKey(e: KeyboardEvent): void {
    const map: Record<string, () => void> = {
      ' ': () => this.toggle(), k: () => this.toggle(), j: () => this.skip(-10), l: () => this.skip(10),
      ArrowLeft: () => this.skip(-5), ArrowRight: () => this.skip(5), m: () => this.toggleMute(), f: () => this.toggleFullscreen(),
      c: () => this.tracks().length && this.toggleCaptions(),
      ArrowUp: () => this.setVolume(Math.min(1, this.volume() + 0.1)), ArrowDown: () => this.setVolume(Math.max(0, this.volume() - 0.1)),
    };
    const fn = map[e.key.length === 1 ? e.key.toLowerCase() : e.key];
    if (fn) { e.preventDefault(); fn(); this.poke(); }
  }

  ngOnDestroy(): void { clearTimeout(this.hideTimer); }
}
