import type * as Leaflet from 'leaflet';

/**
 * Fonds de carte gratuits, sans clé d'API, choisis pour leur disponibilité et leur rapidité.
 * `auto` suit le thème (Esri Canvas gris clair / gris foncé).
 * (CARTO exige désormais une clé ; OpenTopoMap et OSM France sont trop lents : tuiles manquantes.)
 */
export type BasemapKey = 'auto' | 'light' | 'dark' | 'streets' | 'topo' | 'osm' | 'esri-imagery';

export interface BasemapDef {
  key: Exclude<BasemapKey, 'auto'>; label: string; url: string; attribution: string;
  /** Dernier niveau réellement servi : au-delà, Leaflet agrandit ces tuiles au lieu d'afficher des cases vides. */
  maxNativeZoom: number;
  subdomains?: string;
  /** Couche de libellés superposée (fonds Canvas sans toponymes). */
  labelsUrl?: string;
  dark?: boolean;
  /** Assombri en mode sombre (fonds clairs non prévus pour le sombre). */
  dimInDark?: boolean;
}

const OSM_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services';
const ESRI_ATTR = 'Tiles &copy; Esri — Esri, HERE, Garmin, &copy; OpenStreetMap';
export const BASEMAPS: Record<Exclude<BasemapKey, 'auto'>, BasemapDef> = {
  light: { key: 'light', label: 'Gris clair', url: `${ESRI}/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}`, labelsUrl: `${ESRI}/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}`, attribution: ESRI_ATTR, maxNativeZoom: 16 },
  dark: { key: 'dark', label: 'Gris foncé', url: `${ESRI}/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`, labelsUrl: `${ESRI}/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}`, attribution: ESRI_ATTR, maxNativeZoom: 16, dark: true },
  streets: { key: 'streets', label: 'Rues', url: `${ESRI}/World_Street_Map/MapServer/tile/{z}/{y}/{x}`, attribution: ESRI_ATTR, maxNativeZoom: 19, dimInDark: true },
  topo: { key: 'topo', label: 'Topographique', url: `${ESRI}/World_Topo_Map/MapServer/tile/{z}/{y}/{x}`, attribution: `${ESRI_ATTR}, USGS`, maxNativeZoom: 19, dimInDark: true },
  osm: { key: 'osm', label: 'OpenStreetMap', url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: OSM_ATTR, maxNativeZoom: 19, dimInDark: true },
  'esri-imagery': { key: 'esri-imagery', label: 'Satellite', url: `${ESRI}/World_Imagery/MapServer/tile/{z}/{y}/{x}`, attribution: 'Tiles &copy; Esri — Maxar, Earthstar Geographics', maxNativeZoom: 18, dark: true },
};

/** Zoom maximal de toutes les cartes (les fonds moins détaillés sont agrandis). */
export const MAP_MAX_ZOOM = 19;

export type MapTone = 'primary' | 'info' | 'success' | 'warning' | 'error' | 'purple' | 'neutral';
export function mapToneColor(tone: MapTone | undefined, fallback = 'var(--primary-color)'): string {
  if (!tone) return fallback;
  return tone === 'neutral' ? 'var(--text-muted)' : `var(--${tone}-color)`;
}

export interface MapMarker<T = unknown> {
  id: string;
  lat: number;
  lng: number;
  title?: string;
  /** Lignes secondaires de la popup. */
  lines?: string[];
  /** Icône Material Icons. */
  icon?: string;
  tone?: MapTone;
  color?: string;
  /** Halo animé (position en direct). */
  pulse?: boolean;
  /** Cap en degrés : affiche une flèche de direction. */
  heading?: number;
  /** Infobulle au survol (texte court). */
  tooltip?: string;
  data?: T;
}

export interface MapRoute { id: string; points: [number, number][]; tone?: MapTone; color?: string; dashed?: boolean; label?: string; /** Marqueurs départ / arrivée. */ endpoints?: boolean; }
export interface MapZone { id: string; label?: string; tone?: MapTone; color?: string; circle?: { center: [number, number]; radius: number }; polygon?: [number, number][]; }

export type MapDrawEngine = 'none' | 'leaflet-draw' | 'geoman';
export type MapDrawShape = 'marker' | 'polyline' | 'polygon' | 'rectangle' | 'circle';
export type MapState = 'ready' | 'loading' | 'error' | 'empty';

export type LeafletNs = typeof Leaflet;

let core: Promise<LeafletNs> | null = null;
let cluster: Promise<void> | null = null;
let draw: Promise<void> | null = null;
let geoman: Promise<void> | null = null;

/**
 * Chargement paresseux de Leaflet et de ses plugins (chunks séparés, une seule fois).
 * Les plugins s'attachent au `L` global que Leaflet 1.x expose sur `window`.
 */
export async function loadLeaflet(opts: { cluster?: boolean; draw?: boolean; geoman?: boolean } = {}): Promise<LeafletNs> {
  core ??= import('leaflet').then(() => (window as unknown as { L: LeafletNs }).L);
  const L = await core;
  const jobs: Promise<void>[] = [];
  if (opts.cluster) jobs.push(cluster ??= import('leaflet.markercluster').then(() => undefined));
  if (opts.draw) jobs.push(draw ??= import('leaflet-draw').then(() => undefined));
  // Geoman s'accroche à toutes les cartes et couches Leaflet : en opt-in, il n'agit que sur celles
  // créées avec `pmIgnore: false` (la carte qui l'utilise et ses formes).
  if (opts.geoman) jobs.push(geoman ??= import('@geoman-io/leaflet-geoman-free').then(() => { (L as unknown as { PM: { setOptIn(v: boolean): void } }).PM.setOptIn(true); }));
  await Promise.all(jobs);
  return L;
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}
