import { Component, ElementRef, booleanAttribute, computed, forwardRef, input, signal, viewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MapComponent } from '../map/map.component';
import { MapMarker } from '../map/map.models';
import type * as Leaflet from 'leaflet';

export interface PlaceOption { id: string; label: string; detail?: string; city?: string; lat: number; lng: number; kind?: 'road' | 'poi' | 'area' | 'gps' | 'pin'; }
export type AddressValue = PlaceOption;

/**
 * Adresse avec autocomplétion et carte : la recherche est fournie par l'hôte (`search`, liste locale
 * ou géocodeur), « Ma position » via la géolocalisation du navigateur, et un clic sur la carte place
 * un repère précis. Valeur : `{ label, detail, lat, lng, … }`.
 *
 * ```html
 * <app-address-field [search]="searchPlaces" [(ngModel)]="adresse" [map]="true" />
 * ```
 */
@Component({
  selector: 'app-address-field',
  standalone: true,
  imports: [OverlayModule, MatIconModule, MatProgressSpinnerModule, MatTooltipModule, MapComponent],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AddressFieldComponent), multi: true }],
  template: `
    <div class="form-field kit-field">
      <div class="field-box" cdkOverlayOrigin #origin="cdkOverlayOrigin" [class.is-disabled]="disabled()">
        <mat-icon>location_on</mat-icon>
        <input #inp [placeholder]="placeholder()" [value]="text()" [disabled]="disabled()" autocomplete="off"
          (input)="onInput($any($event.target).value)" (keydown)="onKey($event)" (focus)="focused.set(true)" (blur)="onBlur()" />
        @if (loading()) { <mat-spinner diameter="18" /> }
        @if (value() && !disabled()) { <button type="button" class="af-btn" (click)="clear()" matTooltip="Effacer"><mat-icon>close</mat-icon></button> }
        @if (geolocation && !disabled()) {
          <button type="button" class="af-btn" (click)="locate()" [disabled]="locating()" matTooltip="Utiliser ma position"><mat-icon>{{ locating() ? 'hourglass_top' : 'my_location' }}</mat-icon></button>
        }
      </div>
    </div>
    @if (error()) { <span class="field-error">{{ error() }}</span> }
    @if (value() && showCoords()) {
      <span class="field-hint af-coords"><mat-icon>pin_drop</mat-icon>{{ value()!.lat.toFixed(5) }}, {{ value()!.lng.toFixed(5) }}@if (value()!.detail) { · {{ value()!.detail }} }</span>
    }
    @if (map()) {
      <div class="af-map">
        <app-map [markers]="markers()" [center]="center()" [zoom]="value() ? 15 : 7" [height]="mapHeight()" [fitBounds]="false" (mapClick)="pin($event)" (ready)="leaflet = $event" />
        <span class="af-map-hint"><mat-icon>touch_app</mat-icon>Cliquez sur la carte pour ajuster le point</span>
      </div>
    }
    <ng-template cdkConnectedOverlay [cdkConnectedOverlayOrigin]="origin" [cdkConnectedOverlayOpen]="focused() && (results().length > 0 || (searched() && !loading()))"
      [cdkConnectedOverlayPositions]="positions" [cdkConnectedOverlayWidth]="width()">
      <div class="kit-suggest-panel" (mousedown)="$event.preventDefault()">
        @for (p of results(); track p.id; let i = $index) {
          <div class="sg-item" [class.active]="i === active()" (click)="select(p)" (mouseenter)="active.set(i)">
            <mat-icon>{{ kindIcon[p.kind || 'road'] }}</mat-icon>
            <span class="sg-text"><span>{{ p.label }}</span>@if (p.detail) { <span>{{ p.detail }}</span> }</span>
          </div>
        } @empty { <div class="sg-empty">Aucune adresse trouvée pour « {{ text() }} »</div> }
      </div>
    </ng-template>
  `,
  styles: [`
    :host { display: block; }
    .af-btn { flex-shrink: 0; width: 32px; height: 32px; border: none; border-radius: 50%; background: transparent; color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; justify-content: center;
      mat-icon { font-size: 18px; width: 18px; height: 18px; } &:hover:not(:disabled) { background: var(--hover-bg); color: var(--primary-color); } }
    .af-coords { display: flex; align-items: center; gap: 4px; font-variant-numeric: tabular-nums;
      mat-icon { font-size: 14px; width: 14px; height: 14px; } }
    .af-map { position: relative; margin-top: 10px; border-radius: var(--r-m, 12px); overflow: hidden; }
    .af-map-hint { position: absolute; z-index: 500; left: 10px; bottom: 10px; display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 14px;
      background: color-mix(in srgb, var(--card-bg) 92%, transparent); color: var(--text-secondary); font-size: 11.5px; box-shadow: var(--elevation-1); pointer-events: none;
      mat-icon { font-size: 15px; width: 15px; height: 15px; } }
  `],
})
export class AddressFieldComponent implements ControlValueAccessor {
  /** Fonction de recherche (locale ou géocodeur fourni par l'hôte). */
  search = input.required<(q: string) => PlaceOption[] | Promise<PlaceOption[]>>();
  placeholder = input('Rechercher une adresse…');
  map = input(false, { transform: booleanAttribute });
  mapHeight = input('220px');
  showCoords = input(true, { transform: booleanAttribute });
  minChars = input(2);
  defaultCenter = input<[number, number]>([7.54, -5.55]);

  private inp = viewChild<ElementRef<HTMLInputElement>>('inp');
  private originEl = viewChild('origin', { read: ElementRef });
  readonly geolocation = typeof navigator !== 'undefined' && 'geolocation' in navigator;
  readonly kindIcon: Record<string, string> = { road: 'signpost', poi: 'place', area: 'location_city', gps: 'my_location', pin: 'push_pin' };
  readonly positions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 6 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -6 },
  ];

  value = signal<AddressValue | null>(null);
  text = signal('');
  results = signal<PlaceOption[]>([]);
  loading = signal(false);
  searched = signal(false);
  focused = signal(false);
  locating = signal(false);
  error = signal('');
  active = signal(0);
  disabled = signal(false);
  width = signal(300);
  markers = computed<MapMarker[]>(() => {
    const v = this.value();
    return v ? [{ id: 'addr', lat: v.lat, lng: v.lng, title: v.label, lines: v.detail ? [v.detail] : [], icon: 'location_on', tone: 'primary' }] : [];
  });
  center = computed<[number, number]>(() => { const v = this.value(); return v ? [v.lat, v.lng] : this.defaultCenter(); });

  private onChange: (v: AddressValue | null) => void = () => {};
  private touched: () => void = () => {};
  private timer?: ReturnType<typeof setTimeout>;
  private seq = 0;
  /** Carte Leaflet : app-map ne suit pas `center` après l'initialisation, on recentre nous-mêmes. */
  leaflet?: Leaflet.Map;

  onInput(q: string): void {
    this.text.set(q);
    this.error.set('');
    this.width.set(this.originEl()?.nativeElement.getBoundingClientRect().width ?? 300);
    clearTimeout(this.timer);
    if (q.trim().length < this.minChars()) { this.results.set([]); this.searched.set(false); return; }
    this.loading.set(true);
    const id = ++this.seq;
    this.timer = setTimeout(async () => {
      const r = await this.search()(q);
      if (id !== this.seq) return;
      this.results.set(r);
      this.active.set(0);
      this.searched.set(true);
      this.loading.set(false);
    }, 200);
  }
  onKey(e: KeyboardEvent): void {
    const r = this.results();
    if (e.key === 'ArrowDown' && r.length) { e.preventDefault(); this.active.set((this.active() + 1) % r.length); }
    else if (e.key === 'ArrowUp' && r.length) { e.preventDefault(); this.active.set((this.active() - 1 + r.length) % r.length); }
    else if (e.key === 'Enter' && r[this.active()]) { e.preventDefault(); this.select(r[this.active()]); }
    else if (e.key === 'Escape') this.focused.set(false);
  }
  onBlur(): void {
    this.focused.set(false);
    // Texte modifié sans choisir de suggestion : on revient à l'adresse validée.
    if (this.value() && this.text() !== this.value()!.label) this.text.set(this.value()!.label);
    this.touched();
  }
  select(p: PlaceOption): void {
    this.set(p);
    this.results.set([]);
    this.searched.set(false);
    this.inp()?.nativeElement.blur();
  }
  pin(e: { lat: number; lng: number }): void {
    if (this.disabled()) return;
    const prev = this.value();
    this.set({ id: 'pin-' + Date.now(), label: prev && prev.kind !== 'pin' ? prev.label : 'Point choisi sur la carte', detail: prev?.detail ?? 'Repère manuel', city: prev?.city, lat: e.lat, lng: e.lng, kind: 'pin' });
  }
  locate(): void {
    this.locating.set(true);
    this.error.set('');
    navigator.geolocation.getCurrentPosition(
      (pos) => { this.locating.set(false); this.set({ id: 'gps', label: 'Ma position actuelle', detail: `Précision ± ${Math.round(pos.coords.accuracy)} m`, lat: pos.coords.latitude, lng: pos.coords.longitude, kind: 'gps' }); },
      (err) => { this.locating.set(false); this.error.set(err.code === 1 ? 'Accès à la position refusé.' : 'Position indisponible.'); },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }
  clear(): void { this.set(null); this.inp()?.nativeElement.focus(); }
  private set(v: AddressValue | null): void {
    this.value.set(v);
    this.text.set(v?.label ?? '');
    this.onChange(v);
    if (v && v.kind !== 'pin') this.leaflet?.flyTo([v.lat, v.lng], 15, { duration: 0.6 });
  }

  writeValue(v: AddressValue | null): void { this.value.set(v); this.text.set(v?.label ?? ''); }
  registerOnChange(fn: (v: AddressValue | null) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.touched = fn; }
  setDisabledState(d: boolean): void { this.disabled.set(d); }
}
