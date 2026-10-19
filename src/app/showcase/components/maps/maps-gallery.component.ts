import { Component, inject, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import type { FeatureCollection } from 'geojson';
import { MaterialModule } from '../../../shared/material.module';
import { DOC_COMPONENTS, TocItem } from '../../shared/doc.components';
import { BASEMAPS, BasemapKey, MapComponent, MapMarker, MapState } from '../../../shared/components/map';
import { ABIDJAN, FLOTTE, POSITIONS_DENSES, TRAJETS, TRAJET_ETAPES, ZONES, ZONE_MARKERS } from '../../../data/static/map.data';

/** Galerie /components/maps — cartes Leaflet flat : fonds gratuits, marqueurs, clustering, trajets, zones, dessin. */
@Component({
  selector: 'app-maps-gallery',
  standalone: true,
  imports: [MaterialModule, JsonPipe, MapComponent, ...DOC_COMPONENTS],
  templateUrl: './maps-gallery.component.html',
  styleUrls: ['./maps-gallery.component.scss'],
})
export class MapsGalleryComponent {
  private snackBar = inject(MatSnackBar);

  readonly toc: TocItem[] = [
    { id: 'basemaps', label: 'Fonds de carte' }, { id: 'markers', label: 'Marqueurs' }, { id: 'cluster', label: 'Clustering' },
    { id: 'routes', label: 'Trajets' }, { id: 'zones', label: 'Zones' }, { id: 'draw', label: 'Leaflet Draw' },
    { id: 'geoman', label: 'Geoman (gratuit)' }, { id: 'compact', label: 'Carte compacte' }, { id: 'states', label: 'États' },
  ];

  readonly center = ABIDJAN;
  readonly flotte = FLOTTE;
  readonly denses = POSITIONS_DENSES;
  readonly trajets = TRAJETS;
  readonly etapes = TRAJET_ETAPES;
  readonly zones = ZONES;
  readonly zoneMarkers = ZONE_MARKERS;
  readonly single: MapMarker[] = [FLOTTE[0]];
  readonly basemapList = [{ key: 'auto' as BasemapKey, label: 'Auto (gris clair / gris foncé)', url: 'server.arcgisonline.com' }, ...Object.values(BASEMAPS).map((b) => ({ key: b.key as BasemapKey, label: b.label, url: new URL(b.url.replace('{s}', 'a').replace(/\{[a-z]\}/g, '0').replace('{r}', '')).host }))];

  basemap = signal<BasemapKey>('auto');
  drawGeo = signal<FeatureCollection | null>(null);
  geomanGeo = signal<FeatureCollection | null>(null);
  demoState = signal<MapState>('loading');
  lastClick = signal('—');

  pick(m: MapMarker) { this.snackBar.open(m.title ?? m.id, 'Fermer', { duration: 2000 }); }
  clicked(p: { lat: number; lng: number }) { this.lastClick.set(`${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`); }
  summary(fc: FeatureCollection | null): string {
    if (!fc?.features.length) return 'Aucune forme';
    const count = fc.features.reduce<Record<string, number>>((acc, f) => {
      const k = f.geometry.type === 'Point' && f.properties?.['radius'] ? 'Cercle' : f.geometry.type;
      acc[k] = (acc[k] ?? 0) + 1; return acc;
    }, {});
    return Object.entries(count).map(([k, n]) => `${n} ${k}`).join(' · ');
  }

  readonly code = {
    basemaps: `
<!-- auto = Esri Canvas gris clair en clair, gris foncé en sombre ; les fonds clairs sont assombris en mode sombre -->
<app-map [(basemap)]="basemap" [basemapSwitcher]="true"
  [basemapOptions]="['auto', 'streets', 'topo', 'osm', 'esri-imagery']" />`,
    markers: `
<app-map [markers]="vehicules" [scale]="true" (markerClick)="open($event)">
  <div mapOverlay class="legend">…</div>   <!-- contenu projeté en bas à droite -->
</app-map>

const vehicules: MapMarker[] = [{
  id: 'v1', lat: 5.3237, lng: -4.0193,
  title: 'CI-4521-AB', lines: ['En mouvement · 54 km/h'],   // popup
  icon: 'local_shipping', tone: 'success',                   // pastille flat
  pulse: true, heading: 120, tooltip: 'CI-4521-AB',
}];`,
    cluster: `<app-map [markers]="positions" [cluster]="true" [zoom]="7" />   <!-- leaflet.markercluster, chargé à la demande -->`,
    routes: `
<app-map [routes]="trajets" [markers]="etapes" />

const trajets: MapRoute[] = [
  { id: 't1', points: [[5.32, -4.01], …], tone: 'primary', endpoints: true, label: 'Trajet réalisé' },
  { id: 't2', points: […], tone: 'warning', dashed: true, label: 'Itinéraire prévu' },
];`,
    zones: `
const zones: MapZone[] = [
  { id: 'z1', label: 'Dépôt central', tone: 'success', circle: { center: [5.303, -3.985], radius: 600 } },
  { id: 'z2', label: 'Zone portuaire', tone: 'error', polygon: [[5.299, -4.018], …] },
];
<app-map [zones]="zones" [markers]="depots" />`,
    draw: `
<app-map draw="leaflet-draw" [drawShapes]="['polygon', 'rectangle', 'circle', 'polyline', 'marker']"
  (drawChange)="geojson = $event" />   <!-- FeatureCollection, cercles : properties.radius (m) -->`,
    geoman: `
<!-- @geoman-io/leaflet-geoman-free : dessin, édition, déplacement, découpe, suppression -->
<app-map draw="geoman" (drawChange)="geojson = $event" />`,
    compact: `<app-map [markers]="[vehicule]" [interactive]="false" [zoom]="15" height="180px" [fitBounds]="false" [center]="[v.lat, v.lng]" />`,
    states: `<app-map state="loading" />   <!-- loading | error | empty | ready ; (retry) sur l'état error -->`,
  };
}
