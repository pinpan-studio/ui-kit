import { PlanningColumn, PlanningGroup, PlanningItem } from '../../shared/components/planning/planning.models';
import { FilterOption } from '../../shared/components/filter-dropdown/filter-dropdown.component';

/**
 * Jeux de données génériques des composants de planification (/components/planning).
 * Les dates sont relatives à aujourd'hui pour que retards, ligne « aujourd'hui » et agenda restent parlants.
 */
const D = (offsetDays: number, h = 0, m = 0): Date => {
  const d = new Date(); d.setHours(h, m, 0, 0); d.setDate(d.getDate() + offsetDays); return d;
};

// ─── Interventions terrain (kanban, notes, vue groupée, calendrier) ──────────
export const INTERVENTION_COLUMNS: PlanningColumn[] = [
  { key: 'planifiee', label: 'Planifiée', color: 'var(--info-color)' },
  { key: 'en_route', label: 'En route', color: 'var(--purple-color)' },
  { key: 'sur_site', label: 'Sur site', color: 'var(--warning-color)' },
  { key: 'cloturee', label: 'Clôturée', color: 'var(--success-color)' },
];

export const TECHNICIENS: PlanningGroup[] = [
  { key: 'kouame', label: 'Kouamé Aya', subtitle: 'Abidjan Sud', color: 'var(--primary-color)' },
  { key: 'traore', label: 'Traoré Ibrahim', subtitle: 'Abidjan Nord', color: 'var(--info-color)' },
  { key: 'yao', label: 'Yao Serge', subtitle: 'Bouaké', color: 'var(--purple-color)' },
];

const TYPE_TONE = { installation: 'primary', maintenance: 'info', diagnostic: 'warning', desinstallation: 'neutral' } as const;
const TYPE_LABEL = { installation: 'Installation', maintenance: 'Maintenance', diagnostic: 'Diagnostic', desinstallation: 'Désinstallation' } as const;
type InterType = keyof typeof TYPE_TONE;

function inter(n: number, title: string, type: InterType, status: string, tech: string, due: number, extra: Partial<PlanningItem> = {}): PlanningItem {
  const g = TECHNICIENS.find((t) => t.key === tech)!;
  return {
    id: `int-${n}`, ref: `INT-${String(400 + n).padStart(4, '0')}`, title, status, group: tech, assignee: g.label,
    due: D(due, 17), start: D(due, 8 + (n % 8)), done: status === 'cloturee', progress: status === 'cloturee' ? 100 : status === 'sur_site' ? 60 : status === 'en_route' ? 20 : 0,
    tone: TYPE_TONE[type], badge: { label: TYPE_LABEL[type], tone: TYPE_TONE[type] },
    fields: { type, zone: g.subtitle! }, ...extra,
  };
}

export const INTERVENTIONS: PlanningItem[] = [
  inter(1, 'Pose balise — Transports Yao (CI-4521-AB)', 'installation', 'planifiee', 'kouame', 1, { description: 'Pose d’une balise FMB920 avec coupure moteur. Prévoir relais 12 V.' }),
  inter(2, 'Balise hors ligne — SOTRA bus 112', 'diagnostic', 'planifiee', 'traore', -2, { description: 'Aucune position depuis 48 h. Vérifier alimentation et carte SIM.', tags: ['Urgent'] }),
  inter(3, 'Maintenance capteur carburant', 'maintenance', 'en_route', 'yao', 0, { description: 'Recalibrage de la sonde après remplacement du réservoir.' }),
  inter(4, 'Installation flotte — 6 véhicules Lôh Logistique', 'installation', 'sur_site', 'kouame', 0, { description: 'Lot de 6 balises + boutons SOS.' }),
  inter(5, 'Retrait balise — fin de contrat CFAO', 'desinstallation', 'planifiee', 'traore', 3),
  inter(6, 'Remplacement antenne GPS', 'maintenance', 'cloturee', 'yao', -3),
  inter(7, 'Diagnostic coupure intermittente', 'diagnostic', 'sur_site', 'traore', -1, { description: 'Coupures aléatoires signalées par le client depuis lundi.' }),
  inter(8, 'Pose caméra embarquée — Bolloré', 'installation', 'planifiee', 'yao', 5),
  inter(9, 'Contrôle annuel — flotte Ivoire Express', 'maintenance', 'cloturee', 'kouame', -5),
  inter(10, 'Mise à jour firmware (12 balises)', 'maintenance', 'en_route', 'kouame', 2),
  inter(11, 'Installation boîtier température — Agro CI', 'installation', 'planifiee', 'traore', 8),
  inter(12, 'Retrait équipement accidenté', 'desinstallation', 'cloturee', 'yao', -7),
];

export const INTERVENTION_FILTERS = {
  type: { key: 'type', label: 'Type', allLabel: 'Tous les types', options: (Object.keys(TYPE_LABEL) as InterType[]).map((k) => ({ value: k, label: TYPE_LABEL[k] })) as FilterOption[] },
  zone: { key: 'zone', label: 'Zone', allLabel: 'Toutes les zones', options: ['Abidjan Sud', 'Abidjan Nord', 'Bouaké'].map((z) => ({ value: z, label: z })) as FilterOption[] },
  technicien: { key: 'group', label: 'Technicien', allLabel: 'Tous', options: TECHNICIENS.map((t) => ({ value: t.key, label: t.label })) as FilterOption[] },
};

// ─── Réservations de véhicules de service (gantt) ───────────────────────────
export const VEHICULES: PlanningGroup[] = [
  { key: 'v1', label: 'Toyota Hilux', subtitle: 'CI-1024-AB', icon: 'local_shipping', color: 'var(--primary-color)' },
  { key: 'v2', label: 'Renault Kangoo', subtitle: 'CI-2210-CD', icon: 'airport_shuttle', color: 'var(--info-color)' },
  { key: 'v3', label: 'Suzuki Swift', subtitle: 'CI-3307-EF', icon: 'directions_car', color: 'var(--purple-color)' },
  { key: 'v4', label: 'Yamaha Crux', subtitle: 'CI-0418-GH', icon: 'two_wheeler', color: 'var(--cyan-color)' },
];

export const RESERVATIONS: PlanningItem[] = [
  { id: 'r1', ref: 'RSV-101', title: 'Tournée Abidjan Sud', group: 'v1', start: D(-6), end: D(-2), done: true, assignee: 'Kouamé Aya', tone: 'success', fields: { motif: 'tournee' } },
  { id: 'r2', ref: 'RSV-102', title: 'Déploiement Lôh Logistique', group: 'v1', start: D(-1), end: D(3), due: D(2), progress: 55, assignee: 'Kouamé Aya', tone: 'primary', fields: { motif: 'installation' } },
  { id: 'r3', ref: 'RSV-103', title: 'Mission Bouaké', group: 'v2', start: D(-4), end: D(-1), due: D(-2), progress: 80, assignee: 'Yao Serge', tone: 'warning', fields: { motif: 'mission' } },
  { id: 'r4', ref: 'RSV-104', title: 'Livraison matériel Yamoussoukro', group: 'v2', start: D(2), end: D(4), assignee: 'Traoré Ibrahim', tone: 'info', fields: { motif: 'livraison' } },
  { id: 'r5', ref: 'RSV-105', title: 'Visite client CFAO', group: 'v3', start: D(0), end: D(0), assignee: 'Traoré Ibrahim', tone: 'purple', fields: { motif: 'visite' } },
  { id: 'r6', ref: 'RSV-106', title: 'Révision garage', group: 'v3', start: D(5), end: D(7), tone: 'neutral', fields: { motif: 'entretien' } },
  { id: 'r7', ref: 'RSV-107', title: 'Courses urgentes', group: 'v4', start: D(-3), end: D(1), assignee: 'Coulibaly Awa', tone: 'error', fields: { motif: 'mission' } },
  { id: 'r8', ref: 'RSV-108', title: 'Relevés compteurs', group: 'v4', start: D(1), end: D(2), assignee: 'Coulibaly Awa', tone: 'info', fields: { motif: 'tournee' } },
  { id: 'r9', ref: 'RSV-109', title: 'Formation conduite', group: 'v1', start: D(6), end: D(9), tone: 'purple', fields: { motif: 'formation' } },
];

export const MOTIF_FILTER = {
  key: 'motif', label: 'Motif', allLabel: 'Tous les motifs',
  options: [['tournee', 'Tournée'], ['installation', 'Installation'], ['mission', 'Mission'], ['livraison', 'Livraison'], ['visite', 'Visite'], ['entretien', 'Entretien'], ['formation', 'Formation']]
    .map(([value, label]) => ({ value, label })) as FilterOption[],
};

// ─── Projet de déploiement sans groupes (gantt « une ligne par élément ») ───
export const PHASES: PlanningItem[] = [
  { id: 'p1', ref: 'P1', title: 'Cadrage & devis', start: D(-12), end: D(-8), done: true, tone: 'success' },
  { id: 'p2', ref: 'P2', title: 'Commande des balises', start: D(-8), end: D(-3), due: D(-4), progress: 90, tone: 'info' },
  { id: 'p3', ref: 'P3', title: 'Installation sur la flotte', start: D(-3), end: D(6), progress: 40, tone: 'primary' },
  { id: 'p4', ref: 'P4', title: 'Formation des exploitants', start: D(5), end: D(8), tone: 'purple' },
  { id: 'p5', ref: 'P5', title: 'Recette & mise en service', start: D(8), end: D(11), tone: 'warning' },
];

// ─── Rendez-vous (agenda) ───────────────────────────────────────────────────
const W = (dow: number, h: number, m = 0): Date => {
  const d = new Date(); d.setHours(h, m, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + dow); return d;
};
export const RENDEZ_VOUS: PlanningItem[] = [
  { id: 'a1', title: 'Point hebdo exploitation', start: W(0, 9), end: W(0, 10), tone: 'primary', assignee: 'Équipe ops', fields: { kind: 'reunion' } },
  { id: 'a2', title: 'Démo plateforme — Agro CI', start: W(0, 11), end: W(0, 12, 30), tone: 'purple', fields: { kind: 'client' } },
  { id: 'a3', title: 'Installation CI-4521-AB', start: W(1, 8, 30), end: W(1, 11), tone: 'info', assignee: 'Kouamé Aya', fields: { kind: 'terrain' } },
  { id: 'a4', title: 'Appel fournisseur Teltonika', start: W(1, 10), end: W(1, 10, 45), tone: 'warning', fields: { kind: 'reunion' } },
  { id: 'a5', title: 'Diagnostic SOTRA bus 112', start: W(2, 14), end: W(2, 16), tone: 'error', assignee: 'Traoré Ibrahim', fields: { kind: 'terrain' } },
  { id: 'a6', title: 'Revue des impayés', start: W(2, 15), end: W(2, 16, 30), tone: 'neutral', fields: { kind: 'reunion' } },
  { id: 'a7', title: 'Formation nouveaux techniciens', start: W(3, 9), end: W(3, 12), tone: 'success', fields: { kind: 'formation' } },
  { id: 'a8', title: 'Visite Bolloré — caméras', start: W(3, 14, 30), end: W(3, 15, 30), tone: 'purple', fields: { kind: 'client' } },
  { id: 'a9', title: 'Inventaire du stock', start: W(4, 0), tone: 'info', fields: { kind: 'interne' } },
  { id: 'a10', title: 'Clôture mensuelle', start: W(4, 16), end: W(4, 18), tone: 'primary', fields: { kind: 'reunion' } },
  { id: 'a11', title: 'Astreinte week-end', start: W(5, 0), tone: 'warning', fields: { kind: 'interne' } },
  { id: 'a12', title: 'Point flotte Lôh Logistique', start: W(1, 15), end: W(1, 16), tone: 'info', fields: { kind: 'client' } },
];
export const RDV_KIND_FILTER = {
  key: 'kind', label: 'Catégorie', allLabel: 'Toutes',
  options: [['reunion', 'Réunion'], ['client', 'Client'], ['terrain', 'Terrain'], ['formation', 'Formation'], ['interne', 'Interne']].map(([value, label]) => ({ value, label })) as FilterOption[],
};
