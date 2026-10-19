import { PlaceOption } from '../../shared/components/fields/address-field.component';

/** Répertoire d'adresses statique (Côte d'Ivoire) pour app-address-field — aucun géocodage distant. */
export const DEMO_PLACES: PlaceOption[] = [
  { id: 'a1', label: 'Boulevard de la République', detail: 'Plateau, Abidjan', city: 'Abidjan', lat: 5.3237, lng: -4.0193, kind: 'road' },
  { id: 'a2', label: 'Riviera 2, rue des Jardins', detail: 'Cocody, Abidjan', city: 'Abidjan', lat: 5.3600, lng: -3.9900, kind: 'road' },
  { id: 'a3', label: 'Carrefour Selmer', detail: 'Yopougon, Abidjan', city: 'Abidjan', lat: 5.3450, lng: -4.0800, kind: 'poi' },
  { id: 'a4', label: 'Zone 4, rue du Docteur Blanchard', detail: 'Marcory, Abidjan', city: 'Abidjan', lat: 5.3030, lng: -3.9850, kind: 'road' },
  { id: 'a5', label: 'Port autonome d’Abidjan', detail: 'Treichville, Abidjan', city: 'Abidjan', lat: 5.2930, lng: -4.0050, kind: 'poi' },
  { id: 'a6', label: 'Gare routière d’Abobo', detail: 'Abobo, Abidjan', city: 'Abidjan', lat: 5.4180, lng: -4.0200, kind: 'poi' },
  { id: 'a7', label: 'Aéroport Félix-Houphouët-Boigny', detail: 'Port-Bouët, Abidjan', city: 'Abidjan', lat: 5.2550, lng: -3.9300, kind: 'poi' },
  { id: 'a8', label: 'Boulevard Valéry Giscard d’Estaing', detail: 'Koumassi, Abidjan', city: 'Abidjan', lat: 5.2970, lng: -3.9480, kind: 'road' },
  { id: 'a9', label: 'Angré 8e tranche', detail: 'Cocody, Abidjan', city: 'Abidjan', lat: 5.3980, lng: -3.9870, kind: 'area' },
  { id: 'a10', label: 'Avenue Houphouët-Boigny', detail: 'Bouaké', city: 'Bouaké', lat: 7.6906, lng: -5.0306, kind: 'road' },
  { id: 'a11', label: 'Basilique Notre-Dame de la Paix', detail: 'Yamoussoukro', city: 'Yamoussoukro', lat: 6.8115, lng: -5.2970, kind: 'poi' },
  { id: 'a12', label: 'Port de San-Pédro', detail: 'San-Pédro', city: 'San-Pédro', lat: 4.7485, lng: -6.6363, kind: 'poi' },
  { id: 'a13', label: 'Quartier Commerce', detail: 'Korhogo', city: 'Korhogo', lat: 9.4580, lng: -5.6296, kind: 'area' },
  { id: 'a14', label: 'Marché central', detail: 'Daloa', city: 'Daloa', lat: 6.8774, lng: -6.4502, kind: 'poi' },
  { id: 'a15', label: 'Plage d’Assinie Mafia', detail: 'Assinie', city: 'Assinie', lat: 5.1330, lng: -3.2830, kind: 'area' },
  { id: 'a16', label: 'Quartier France', detail: 'Grand-Bassam', city: 'Grand-Bassam', lat: 5.1980, lng: -3.7380, kind: 'area' },
];

/** Recherche locale insensible aux accents (simule un géocodeur, avec un léger délai). */
export function searchPlaces(q: string): Promise<PlaceOption[]> {
  const n = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  const t = n(q.trim());
  const res = DEMO_PLACES.filter((p) => n(`${p.label} ${p.detail}`).includes(t)).slice(0, 6);
  return new Promise((r) => setTimeout(() => r(res), 250));
}
