import { Component, ElementRef, computed, effect, input, output, signal, viewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { computePeaks, formatMediaTime, pseudoPeaks } from './media.utils';

export interface AudioTrack {
  src: string;
  title: string;
  artist?: string;
  /** Fichier source : permet de calculer la vraie forme d'onde. */
  blob?: Blob;
  icon?: string;
}

export type AudioPlayerVariant = 'default' | 'compact' | 'playlist';

/**
 * Lecteur audio à forme d'onde cliquable.
 * - `default` : carte avec titre, forme d'onde, ±15 s, vitesse et volume ;
 * - `compact` : bulle de note vocale (lecture + onde + durée) ;
 * - `playlist` : lecteur + liste des pistes, enchaînement automatique.
 *
 * ```html
 * <app-audio-player [tracks]="[{ src: url, title: 'Appel client', blob }]" variant="compact" />
 * ```
 */
@Component({
  selector: 'app-audio-player',
  standalone: true,
  imports: [MatIconModule, MatTooltipModule],
  template: `
    <audio #audio [src]="track()?.src || null" preload="metadata"
      (loadedmetadata)="onMeta()" (durationchange)="onMeta()" (timeupdate)="current.set(audio.currentTime)" (play)="playing.set(true)"
      (pause)="playing.set(false)" (ended)="onEnded()" (error)="error.set(!!track())"></audio>

    <div class="ap" [class]="'ap ap--' + variant()">
      @if (variant() !== 'compact') {
        <div class="ap-head">
          <div class="ap-cover" [class.spin]="playing()"><mat-icon>{{ track()?.icon || 'graphic_eq' }}</mat-icon></div>
          <div class="ap-meta">
            <strong>{{ track()?.title || 'Aucune piste' }}</strong>
            @if (track()?.artist) { <span>{{ track()?.artist }}</span> }
          </div>
          @if (error()) { <span class="ap-error"><mat-icon>error</mat-icon>Format non pris en charge</span> }
        </div>
      }

      <div class="ap-main">
        @if (variant() === 'playlist') {
          <button type="button" class="ap-btn" (click)="go(-1)" [disabled]="index() === 0" matTooltip="Précédente"><mat-icon>skip_previous</mat-icon></button>
        } @else if (variant() === 'default') {
          <button type="button" class="ap-btn" (click)="skip(-15)" matTooltip="−15 s"><mat-icon>replay</mat-icon></button>
        }
        <button type="button" class="ap-play" (click)="toggle()" [disabled]="!track() || error()" [attr.aria-label]="playing() ? 'Pause' : 'Lire'">
          <mat-icon>{{ playing() ? 'pause' : 'play_arrow' }}</mat-icon>
        </button>
        @if (variant() === 'playlist') {
          <button type="button" class="ap-btn" (click)="go(1)" [disabled]="index() >= tracks().length - 1" matTooltip="Suivante"><mat-icon>skip_next</mat-icon></button>
        } @else if (variant() === 'default') {
          <button type="button" class="ap-btn" (click)="skip(15)" matTooltip="+15 s"><mat-icon>forward_media</mat-icon></button>
        }

        <div #wave class="ap-wave" role="slider" tabindex="0" aria-label="Position de lecture"
          [attr.aria-valuemax]="duration()" [attr.aria-valuenow]="current()" (pointerdown)="seek($event)" (keydown)="waveKey($event)">
          @for (p of peaks(); track $index) {
            <span [style.height.%]="p * 100" [class.done]="$index / peaks().length < ratio()"></span>
          }
        </div>
        <span class="ap-time">{{ variant() === 'compact' && !playing() && !current() ? fmt(duration()) : fmt(current()) }}</span>
        @if (variant() !== 'compact') {
          <span class="ap-time muted">/ {{ fmt(duration()) }}</span>
          <button type="button" class="ap-rate" (click)="cycleRate()" matTooltip="Vitesse">{{ rate() }}×</button>
          <button type="button" class="ap-btn" (click)="audio.muted = !audio.muted; muted.set(audio.muted)" [matTooltip]="muted() ? 'Activer le son' : 'Couper le son'">
            <mat-icon>{{ muted() ? 'volume_off' : 'volume_up' }}</mat-icon></button>
        } @else {
          <button type="button" class="ap-rate" (click)="cycleRate()">{{ rate() }}×</button>
        }
      </div>

      @if (variant() === 'playlist') {
        <ol class="ap-list">
          @for (t of tracks(); track t.src; let i = $index) {
            <li [class.active]="i === index()" (click)="select(i, true)">
              <span class="num">@if (i === index() && playing()) { <mat-icon>equalizer</mat-icon> } @else { {{ i + 1 }} }</span>
              <span class="t">{{ t.title }}</span>
              <span class="a">{{ t.artist }}</span>
            </li>
          }
        </ol>
      }
    </div>
  `,
  styleUrls: ['./audio-player.component.scss'],
})
export class AudioPlayerComponent {
  tracks = input<AudioTrack[]>([]);
  variant = input<AudioPlayerVariant>('default');
  bars = input(56);
  trackChange = output<AudioTrack>();

  private audioRef = viewChild.required<ElementRef<HTMLAudioElement>>('audio');
  private waveRef = viewChild.required<ElementRef<HTMLElement>>('wave');

  index = signal(0);
  playing = signal(false);
  error = signal(false);
  current = signal(0);
  duration = signal(0);
  rate = signal(1);
  muted = signal(false);
  peaks = signal<number[]>([]);

  track = computed(() => this.tracks()[this.index()] ?? null);
  ratio = computed(() => (this.duration() ? this.current() / this.duration() : 0));
  fmt = formatMediaTime;
  private autoplay = false;

  constructor() {
    effect(() => {
      const t = this.track();
      const bars = this.variant() === 'compact' ? Math.min(this.bars(), 36) : this.bars();
      this.error.set(false);
      this.current.set(0);
      if (!t) { this.peaks.set(pseudoPeaks('vide', bars).map(() => 0.12)); return; }
      this.peaks.set(pseudoPeaks(t.src + t.title, bars));
      if (t.blob) void computePeaks(t.blob, bars).then((p) => this.track() === t && this.peaks.set(p));
    });
  }

  private get audio(): HTMLAudioElement { return this.audioRef().nativeElement; }

  toggle(): void { this.audio.paused ? void this.audio.play().catch(() => this.error.set(true)) : this.audio.pause(); }
  skip(s: number): void { this.audio.currentTime = Math.max(0, Math.min(this.duration(), this.audio.currentTime + s)); }
  cycleRate(): void {
    const rates = [1, 1.5, 2, 0.75];
    const r = rates[(rates.indexOf(this.rate()) + 1) % rates.length];
    this.audio.playbackRate = r;
    this.rate.set(r);
  }
  onMeta(): void {
    const d = this.audio.duration;
    if (isFinite(d)) this.duration.set(d);
    this.audio.playbackRate = this.rate();
    if (this.autoplay) { this.autoplay = false; void this.audio.play().catch(() => {}); }
  }
  onEnded(): void {
    this.playing.set(false);
    if (this.variant() === 'playlist' && this.index() < this.tracks().length - 1) this.select(this.index() + 1, true);
  }
  go(d: number): void { this.select(this.index() + d, this.playing()); }
  select(i: number, play: boolean): void {
    if (i < 0 || i >= this.tracks().length) return;
    if (i === this.index()) { if (play) this.toggle(); return; }
    this.autoplay = play;
    this.index.set(i);
    this.trackChange.emit(this.tracks()[i]);
  }

  seek(e: PointerEvent): void {
    if (!this.duration()) return;
    const el = this.waveRef().nativeElement;
    el.setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => {
      const r = el.getBoundingClientRect();
      this.audio.currentTime = Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width)) * this.duration();
      this.current.set(this.audio.currentTime);
    };
    move(e);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', () => el.removeEventListener('pointermove', move), { once: true });
  }
  waveKey(e: KeyboardEvent): void {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); this.skip(e.key === 'ArrowLeft' ? -5 : 5); }
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); this.toggle(); }
  }
}
