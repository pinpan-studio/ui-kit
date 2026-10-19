/**
 * Jeux de données génériques utilisés par la galerie de composants (/components/*).
 * Déterministes (aucun aléatoire) pour un rendu identique à chaque chargement.
 */

export type ClientStatut = 'ACTIF' | 'INACTIF' | 'SUSPENDU' | 'RESILIE';

export interface DemoClient {
  _id: string;
  code: string;
  raison_sociale: string;
  contact: string;
  email: string;
  telephone: string;
  ville: string;
  secteur: string;
  vehicules: number;
  ca_mensuel: number;
  statut: ClientStatut;
  created_at: string;
}

const RAISONS = [
  'Transports Yao & Fils', 'Bolloré Logistics CI', 'SOTRA Abidjan', 'Kouamé BTP', 'Ivoire Express Livraison',
  'CFAO Motors CI', 'Groupe Diallo Négoce', 'SIFCA Logistique', 'Coulibaly Frères Transit', 'Aka Mobilité',
  'Sahel Cargo', 'Bamba Distribution', 'Ouattara Services', 'San-Pédro Shipping', 'Yamoussoukro Taxi Pool',
  'Bouaké Agro Transport', 'Gbaka Line', 'Atlantique Fret', 'Konan Location Auto', 'Treichville Moto Pro',
  'Cocody Premium Cars', 'Plateau VTC', 'Daloa Céréales', 'Korhogo Coton Logistique', 'Man Minerais',
  'Assinie Tourisme', 'Grand-Bassam Bus', 'Yopougon Livraison', 'Abobo Transports', 'Marcory Auto-École',
  'Port-Bouët Conteneurs', 'Bingerville Agrumes', 'Anyama Kola Export', 'Divo Cacao Trans', 'Gagnoa Bois',
  'Soubré Palmeraie', 'Odienné Bétail', 'Bondoukou Négoce', 'Abengourou Hévéa', 'Agboville Maraîchers',
];
const CONTACTS = [
  'Jean Kouassi', 'Marie Yao', 'Aminata Diallo', 'Koffi N’Guessan', 'Fatou Bamba', 'Serge Kouamé', 'Awa Coulibaly',
  'Patrick Aka', 'Mariam Ouattara', 'Eric Konan', 'Christelle Tanoh', 'Ibrahim Traoré', 'Nadège Gnagne', 'Yves Brou',
  'Alimata Koné', 'Didier Assi', 'Sandrine Ehui', 'Moussa Sanogo', 'Brigitte Adjoua', 'Hervé Kacou',
];
const VILLES = ['Abidjan', 'Yamoussoukro', 'Bouaké', 'San-Pédro', 'Daloa', 'Korhogo', 'Man', 'Gagnoa'];
const SECTEURS = ['Transport', 'Logistique', 'BTP', 'Distribution', 'Agro-industrie', 'Location', 'Tourisme'];
const STATUTS: ClientStatut[] = ['ACTIF', 'ACTIF', 'ACTIF', 'SUSPENDU', 'ACTIF', 'INACTIF', 'ACTIF', 'RESILIE'];

const slug = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '');

export const DEMO_CLIENTS: DemoClient[] = RAISONS.map((raison, i) => {
  const contact = CONTACTS[i % CONTACTS.length];
  const day = ((i * 7) % 28) + 1;
  const month = ((i * 5) % 12) + 1;
  return {
    _id: `cli-${String(i + 1).padStart(3, '0')}`,
    code: `CLI-${String(1040 + i * 3)}`,
    raison_sociale: raison,
    contact,
    email: `${slug(contact)}@${slug(raison).split('.')[0]}.ci`,
    telephone: `+225 07 ${String(10 + ((i * 13) % 89)).padStart(2, '0')} ${String(20 + ((i * 17) % 79)).padStart(2, '0')} ${String(30 + ((i * 7) % 69)).padStart(2, '0')}`,
    ville: VILLES[i % VILLES.length],
    secteur: SECTEURS[i % SECTEURS.length],
    vehicules: 2 + ((i * 11) % 47),
    ca_mensuel: 150_000 + ((i * 137_500) % 4_850_000),
    statut: STATUTS[i % STATUTS.length],
    created_at: `${2024 + (i % 3)}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
  };
});

export const STATUT_COLOR: Record<ClientStatut, string> = {
  ACTIF: 'success',
  INACTIF: 'neutral',
  SUSPENDU: 'warning',
  RESILIE: 'error',
};

export const VILLE_OPTIONS = VILLES.map((v) => ({ value: v, label: v }));
export const SECTEUR_OPTIONS = SECTEURS.map((s) => ({ value: s, label: s }));

export const MOIS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
export const CA_MENSUEL_2026 = [38.2, 41.5, 39.8, 44.1, 47.6, 46.2, 49.9, 52.4, 51.1, 55.8, 0, 0].map((v) => v * 1_000_000);
export const CA_MENSUEL_2025 = [31.4, 33.0, 34.8, 35.2, 37.9, 38.4, 40.1, 41.7, 42.2, 44.0, 45.3, 47.9].map((v) => v * 1_000_000);

export const TIMELINE_EVENTS = [
  { date: '2026-10-13T09:12:00', icon: 'add_circle', color: 'primary', titre: 'Requête créée', texte: 'REQ-2026-0412 « Balise hors ligne » ouverte par Marie Yao.' },
  { date: '2026-10-13T10:05:00', icon: 'assignment_ind', color: 'info', titre: 'Affectée', texte: 'Assignée à Koffi N’Guessan (équipe technique Abidjan Sud).' },
  { date: '2026-10-13T14:40:00', icon: 'engineering', color: 'warning', titre: 'Intervention planifiée', texte: 'Passage sur site prévu le 14/10 à 08:30 — Zone 4, Marcory.' },
  { date: '2026-10-14T09:55:00', icon: 'check_circle', color: 'success', titre: 'Résolue', texte: 'Antenne GPS remplacée, balise de nouveau en ligne.' },
  { date: '2026-10-14T11:20:00', icon: 'lock', color: 'neutral', titre: 'Clôturée', texte: 'Clôture validée par le client (satisfaction 5/5).' },
];

export const MATERIAL_ICONS = [
  'dashboard', 'people', 'inventory_2', 'settings_input_antenna', 'support_agent', 'build', 'cloud_sync', 'menu_book',
  'hub', 'savings', 'task_alt', 'account_balance', 'folder', 'admin_panel_settings', 'analytics', 'contact_support',
  'event_available', 'assignment_ind', 'groups', 'assignment', 'event_note', 'engineering', 'calendar_month', 'call',
  'event', 'contact_page', 'folder_shared', 'outbound', 'settings', 'payments', 'receipt_long', 'sticky_note_2',
  'supervisor_account', 'upload_file', 'receipt', 'workspaces', 'subscriptions', 'playlist_add_check', 'group',
  'add', 'edit', 'delete', 'visibility', 'more_vert', 'search', 'close', 'refresh', 'filter_list', 'grid_view',
  'view_list', 'arrow_back', 'arrow_forward', 'chevron_left', 'chevron_right', 'expand_more', 'check', 'check_circle',
  'error', 'warning', 'info', 'help_outline', 'notifications', 'checklist', 'dark_mode', 'light_mode', 'logout',
  'login', 'lock', 'person', 'badge', 'mail', 'phone', 'alternate_email', 'location_on', 'schedule', 'today',
  'download', 'upload', 'attach_file', 'insert_photo', 'picture_as_pdf', 'description', 'print', 'share', 'send',
  'save', 'content_copy', 'open_in_new', 'link', 'star', 'favorite', 'trending_up', 'trending_down', 'bar_chart',
  'pie_chart', 'show_chart', 'timeline', 'directions_car', 'local_shipping', 'gps_fixed', 'sim_card', 'router',
  'sync', 'history', 'archive', 'unarchive', 'drag_indicator', 'menu', 'menu_open', 'widgets', 'palette', 'code',
];
