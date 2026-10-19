import {
  Component, DestroyRef, ElementRef, ViewEncapsulation, afterNextRender, computed, effect, inject, input, model, output, signal, viewChild,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import type * as Leaflet from 'leaflet';
import type { FeatureCollection } from 'geojson';
import { ThemeService } from '../../../core/services/theme.service';
import {
  BASEMAPS, BasemapKey, LeafletNs, MAP_MAX_ZOOM, MapDrawEngine, MapDrawShape, MapMarker, MapRoute, MapState, MapZone,
  escapeHtml, loadLeaflet, mapToneColor,
} from './map.models';

/* eslint-disable @typescript-eslint/no-explicit-any -- les API des plugins (draw, geoman, cluster) ne sont pas typées ici */

/**
 * Carte Leaflet générique, rendu flat (thème clair / sombre). Tout est optionnel :
 * fond de carte (+ sélecteur), marqueurs (+ clustering), trajets, zones, dessin (Leaflet Draw ou Geoman),
 * carte statique (`interactive=false`), états loading / error / empty, légende projetée via `[mapOverlay]`.
 */
@Component({
  selector: 'app-map',
  standalone: true,
  imports: [MatIconModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="kit-map" [class.kit-map--dim]="dim()" [class.kit-map--static]="!interactive()" [style.height]="height()">
      <div class="kit-map__canvas" #canvas></div>

      @if (basemapSwitcher() && state() === 'ready') {
        <div class="kit-map__switch">
          @for (b of basemapChoices(); track b.key) {
            <button type="button" [class.active]="basemap() === b.key" (click)="basemap.set(b.key)">{{ b.label }}</button>
          }
        </div>
      }
      <div class="kit-map__overlay"><ng-content select="[mapOverlay]"></ng-content></div>

      @switch (state()) {
        @case ('loading') { <div class="kit-map__state"><span class="kit-map__spinner"></span><span>{{ loadingLabel() }}</span></div> }
        @case ('error') {
          <div class="kit-map__state"><mat-icon>cloud_off</mat-icon><strong>Carte indisponible</strong><span>{{ errorLabel() }}</span>
            <button type="button" (click)="retry.emit()">Réessayer</button></div>
        }
        @case ('empty') { <div class="kit-map__state soft"><mat-icon>location_off</mat-icon><strong>Aucune position</strong><span>{{ emptyLabel() }}</span></div> }
      }
    </div>
  `,
  styleUrls: ['./map.component.scss'],
})
export class MapComponent {
  private theme = inject(ThemeService);
  private destroyRef = inject(DestroyRef);
  private canvas = viewChild.required<ElementRef<HTMLElement>>('canvas');

  center = input<[number, number]>([5.336, -4.027]);
  zoom = input(12);
  height = input('380px');
  basemap = model<BasemapKey>('auto');
  basemapSwitcher = input(false);
  basemapOptions = input<BasemapKey[]>(['auto', 'streets', 'topo', 'osm', 'esri-imagery']);
  markers = input<MapMarker[]>([]);
  cluster = input(false);
  routes = input<MapRoute[]>([]);
  zones = input<MapZone[]>([]);
  /** Ajuste la vue sur l'ensemble des objets affichés. */
  fitBounds = input(true);
  interactive = input(true);
  zoomControl = input(true);
  scale = input(false);
  draw = input<MapDrawEngine>('none');
  drawShapes = input<MapDrawShape[]>(['polygon', 'rectangle', 'circle', 'polyline', 'marker']);
  drawColor = input('var(--primary-color)');
  state = input<MapState>('ready');
  loadingLabel = input('Chargement de la carte…');
  errorLabel = input('Les tuiles n’ont pas pu être chargées.');
  emptyLabel = input('Aucun élément géolocalisé à afficher.');

  markerClick = output<MapMarker>();
  mapClick = output<{ lat: number; lng: number }>();
  /** GeoJSON des formes dessinées (cercles : `properties.radius` en mètres). */
  drawChange = output<FeatureCollection>();
  ready = output<Leaflet.Map>();
  retry = output<void>();

  private L!: LeafletNs;
  private map?: Leaflet.Map;
  private tiles?: Leaflet.TileLayer;
  private labels?: Leaflet.TileLayer;
  private markerLayer?: Leaflet.LayerGroup;
  private shapeLayer?: Leaflet.FeatureGroup;
  private drawnItems?: Leaflet.FeatureGroup;
  private loaded = signal(false);
  private fitted = false;

  private dark = computed(() => this.theme.mode() === 'dark');
  private resolvedBasemap = computed(() => {
    const b = this.basemap();
    return BASEMAPS[b === 'auto' ? (this.dark() ? 'dark' : 'light') : b];
  });
  dim = computed(() => this.dark() && !!this.resolvedBasemap().dimInDark);
  basemapChoices = computed(() => this.basemapOptions().map((k) => ({ key: k, label: k === 'auto' ? 'Plan' : BASEMAPS[k].label })));

  constructor() {
    // Initialisation à l'apparition à l'écran : évite de charger les tuiles de toutes les cartes d'une page d'un coup.
    afterNextRender(() => {
      const el = this.canvas().nativeElement;
      const io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) { io.disconnect(); void this.init(); }
      }, { rootMargin: '200px' });
      io.observe(el);
      this.destroyRef.onDestroy(() => io.disconnect());
    });

    effect(() => { const def = this.resolvedBasemap(); if (this.loaded()) this.applyBasemap(def); });
    effect(() => {
      const markers = this.markers(); const routes = this.routes(); const zones = this.zones(); this.cluster();
      this.dark(); // les couleurs SVG résolues dépendent du thème
      if (this.loaded()) this.renderData(markers, routes, zones);
    });
  }

  private async init(): Promise<void> {
    const engine = this.draw();
    this.L = await loadLeaflet({ cluster: this.cluster(), draw: engine === 'leaflet-draw', geoman: engine === 'geoman' });
    const L = this.L;
    const interactive = this.interactive();
    const map = L.map(this.canvas().nativeElement, {
      center: this.center(), zoom: this.zoom(), maxZoom: MAP_MAX_ZOOM, minZoom: 2, zoomControl: false, attributionControl: true,
      ...(engine === 'geoman' ? { pmIgnore: false } : {}),
      dragging: interactive, scrollWheelZoom: interactive, doubleClickZoom: interactive, touchZoom: interactive, boxZoom: interactive, keyboard: interactive,
    });
    map.attributionControl.setPrefix(false);
    const labelsPane = map.createPane('kit-labels');
    labelsPane.style.zIndex = '350';
    labelsPane.style.pointerEvents = 'none';
    if (interactive && this.zoomControl()) L.control.zoom({ position: 'topright', zoomInTitle: 'Zoom avant', zoomOutTitle: 'Zoom arrière' }).addTo(map);
    if (this.scale()) L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);
    map.on('click', (e: Leaflet.LeafletMouseEvent) => this.mapClick.emit({ lat: e.latlng.lat, lng: e.latlng.lng }));
    this.shapeLayer = L.featureGroup().addTo(map);
    this.map = map;

    if (engine === 'leaflet-draw') this.setupLeafletDraw();
    if (engine === 'geoman') this.setupGeoman();

    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(this.canvas().nativeElement);
    this.destroyRef.onDestroy(() => { ro.disconnect(); map.remove(); });

    this.loaded.set(true);
    this.ready.emit(map);
  }

  private applyBasemap(def: (typeof BASEMAPS)[keyof typeof BASEMAPS]): void {
    this.tiles?.remove();
    this.labels?.remove();
    const opts: Leaflet.TileLayerOptions = {
      attribution: def.attribution, maxZoom: MAP_MAX_ZOOM, maxNativeZoom: def.maxNativeZoom, subdomains: def.subdomains ?? 'abc',
      keepBuffer: 4,
    };
    this.tiles = this.retryOnError(this.L.tileLayer(def.url, opts)).addTo(this.map!);
    this.labels = def.labelsUrl ? this.retryOnError(this.L.tileLayer(def.labelsUrl, { ...opts, attribution: '', pane: 'kit-labels' })).addTo(this.map!) : undefined;
  }

  /** Relance une fois une tuile en échec (coupure réseau passagère) au lieu de laisser une case vide. */
  private retryOnError(layer: Leaflet.TileLayer): Leaflet.TileLayer {
    layer.on('tileerror', (e: Leaflet.TileErrorEvent) => {
      const img = e.tile as HTMLImageElement;
      if (img.dataset['retried']) return;
      img.dataset['retried'] = '1';
      const src = img.src;
      setTimeout(() => { img.src = ''; img.src = src; }, 800);
    });
    return layer;
  }

  // ─── Données ───────────────────────────────────────────────────────────
  pinIcon(m: Pick<MapMarker, 'icon' | 'tone' | 'color' | 'pulse' | 'heading'>): Leaflet.DivIcon {
    const color = m.color ?? mapToneColor(m.tone);
    const heading = m.heading != null ? `<span class="kit-pin__heading" style="transform: rotate(${m.heading}deg)"></span>` : '';
    return this.L.divIcon({
      className: 'kit-pin-wrap',
      html: `<div class="kit-pin${m.pulse ? ' kit-pin--pulse' : ''}" style="--pin:${color}">${heading}<span class="material-icons">${escapeHtml(m.icon ?? 'place')}</span></div>`,
      iconSize: [34, 34], iconAnchor: [17, 17], popupAnchor: [0, -18], tooltipAnchor: [16, 0],
    });
  }

  private popupHtml(m: MapMarker): string {
    const lines = (m.lines ?? []).map((l) => `<span>${escapeHtml(l)}</span>`).join('');
    return `<div class="kit-popup__body"><strong>${escapeHtml(m.title ?? '')}</strong>${lines}</div>`;
  }

  private renderData(markers: MapMarker[], routes: MapRoute[], zones: MapZone[]): void {
    const L = this.L as any;
    const map = this.map!;
    this.markerLayer?.remove();
    this.shapeLayer!.clearLayers();

    const group: Leaflet.LayerGroup = this.cluster()
      ? L.markerClusterGroup({
          showCoverageOnHover: false, maxClusterRadius: 50, spiderfyOnMaxZoom: true,
          iconCreateFunction: (c: any) => {
            const n = c.getChildCount();
            const size = n < 10 ? 34 : n < 100 ? 40 : 48;
            return L.divIcon({ className: 'kit-pin-wrap', html: `<div class="kit-cluster" style="width:${size}px;height:${size}px">${n}</div>`, iconSize: [size, size] });
          },
        })
      : L.layerGroup();

    for (const m of markers) {
      const mk = L.marker([m.lat, m.lng], { icon: this.pinIcon(m), keyboard: false });
      if (m.title || m.lines?.length) mk.bindPopup(this.popupHtml(m), { className: 'kit-popup', closeButton: false, maxWidth: 260 });
      if (m.tooltip) mk.bindTooltip(escapeHtml(m.tooltip), { className: 'kit-tooltip', direction: 'right' });
      mk.on('click', () => this.markerClick.emit(m));
      group.addLayer(mk);
    }
    this.markerLayer = group.addTo(map);

    for (const r of routes) {
      const color = this.cssColor(r.color ?? mapToneColor(r.tone));
      L.polyline(r.points, { color, weight: 4, opacity: 0.9, dashArray: r.dashed ? '8 8' : undefined, lineCap: 'round', lineJoin: 'round' })
        .bindTooltip(r.label ? escapeHtml(r.label) : '', { className: 'kit-tooltip', sticky: true })
        .addTo(this.shapeLayer);
      if (r.endpoints && r.points.length > 1) {
        L.marker(r.points[0], { icon: this.dotIcon(color, false), interactive: false }).addTo(this.shapeLayer);
        L.marker(r.points[r.points.length - 1], { icon: this.dotIcon(color, true), interactive: false }).addTo(this.shapeLayer);
      }
    }

    for (const z of zones) {
      const color = this.cssColor(z.color ?? mapToneColor(z.tone, 'var(--info-color)'));
      const style = { color, weight: 1.5, fillColor: color, fillOpacity: 0.12 };
      const layer = z.circle ? L.circle(z.circle.center, { ...style, radius: z.circle.radius }) : z.polygon ? L.polygon(z.polygon, style) : null;
      if (!layer) continue;
      if (z.label) layer.bindTooltip(escapeHtml(z.label), { className: 'kit-tooltip', sticky: true });
      layer.addTo(this.shapeLayer);
    }

    if (this.fitBounds() && !this.fitted) {
      const b = L.latLngBounds([]);
      markers.forEach((m) => b.extend([m.lat, m.lng]));
      this.shapeLayer!.eachLayer((l: any) => (l.getBounds ? b.extend(l.getBounds()) : l.getLatLng && b.extend(l.getLatLng())));
      if (b.isValid()) { map.fitBounds(b, { padding: [36, 36], maxZoom: 15 }); this.fitted = true; }
    }
  }

  private dotIcon(color: string, end: boolean): Leaflet.DivIcon {
    return this.L.divIcon({ className: 'kit-pin-wrap', html: `<span class="kit-dot${end ? ' kit-dot--end' : ''}" style="--pin:${color}"></span>`, iconSize: [14, 14], iconAnchor: [7, 7] });
  }

  /**
   * Les tracés SVG n'acceptent pas var(--x) : on résout la couleur sur le conteneur. Passer par
   * `color` (et non getPropertyValue) résout aussi light-dark() des rôles M3 selon le mode courant.
   */
  private cssColor(v: string): string {
    if (!v.startsWith('var(')) return v;
    const probe = document.createElement('span');
    probe.style.color = v;
    this.canvas().nativeElement.appendChild(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color || '#3b82f6';
  }

  // ─── Dessin ────────────────────────────────────────────────────────────
  private shapeStyle() { const c = this.cssColor(this.drawColor()); return { color: c, weight: 2, fillColor: c, fillOpacity: 0.15 }; }

  private emitDrawn(layers: Leaflet.Layer[]): void {
    const features = layers.map((l: any) => {
      const f = l.toGeoJSON();
      if (l instanceof this.L.Circle) f.properties = { ...f.properties, radius: Math.round(l.getRadius()) };
      return f;
    });
    this.drawChange.emit({ type: 'FeatureCollection', features });
  }

  private setupLeafletDraw(): void {
    const L = this.L as any;
    const has = (s: MapDrawShape) => this.drawShapes().includes(s);
    const shapeOptions = this.shapeStyle();
    this.drawnItems = L.featureGroup().addTo(this.map);
    const control = new L.Control.Draw({
      position: 'topleft',
      edit: { featureGroup: this.drawnItems, edit: { selectedPathOptions: { ...shapeOptions, dashArray: '6 6' } } },
      draw: {
        polyline: has('polyline') && { shapeOptions: { ...shapeOptions, fillOpacity: 0 } },
        polygon: has('polygon') && { allowIntersection: false, showArea: false, shapeOptions },
        rectangle: has('rectangle') && { showArea: false, shapeOptions },
        circle: has('circle') && { showRadius: true, metric: true, shapeOptions },
        marker: has('marker') && { icon: this.pinIcon({ icon: 'place', color: this.drawColor() }) },
        circlemarker: false,
      },
    });
    this.map!.addControl(control);
    const sync = () => this.emitDrawn(this.drawnItems!.getLayers());
    this.map!.on(L.Draw.Event.CREATED, (e: any) => { this.drawnItems!.addLayer(e.layer); sync(); });
    this.map!.on(L.Draw.Event.EDITED, sync);
    this.map!.on(L.Draw.Event.DELETED, sync);
  }

  private setupGeoman(): void {
    const map = this.map as any;
    const has = (s: MapDrawShape) => this.drawShapes().includes(s);
    map.pm.setLang('fr');
    map.pm.setGlobalOptions({ pathOptions: { ...this.shapeStyle(), pmIgnore: false }, templineStyle: { color: this.cssColor(this.drawColor()) }, hintlineStyle: { color: this.cssColor(this.drawColor()), dashArray: '5 5' }, markerStyle: { icon: this.pinIcon({ icon: 'place', color: this.drawColor() }), pmIgnore: false } as any });
    map.pm.addControls({
      position: 'topleft',
      drawMarker: has('marker'), drawPolyline: has('polyline'), drawPolygon: has('polygon'), drawRectangle: has('rectangle'), drawCircle: has('circle'),
      drawCircleMarker: false, drawText: false, rotateMode: false,
    });
    const sync = () => this.emitDrawn(map.pm.getGeomanLayers());
    map.on('pm:create', (e: any) => { e.layer.on('pm:edit pm:dragend', sync); sync(); });
    map.on('pm:remove pm:cut', sync);
  }
}
