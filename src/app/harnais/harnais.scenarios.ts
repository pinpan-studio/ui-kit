import { FLOTTE } from '../data/static/map.data';
import type { HarnaisBlock, HarnaisConversation, HarnaisToolKind, HarnaisWidget, HzField, HzOption } from '../data/static/harnais.data';
import type { PlanningItem } from '../shared/components/planning/planning.models';
import { X } from './harnais.toolkit';

/**
 * Scénarios de réponse simulés : à partir de la demande, l'« agent » choisit les widgets
 * les plus parlants (carte, graphique, tableau, formulaire, planning…). Données fictives.
 */

export type HarnaisIntent =
  | 'map' | 'chart' | 'table' | 'form' | 'calendar' | 'agenda' | 'kanban' | 'gantt' | 'overview'
  | 'code' | 'upload' | 'detail' | 'tree' | 'json' | 'carousel' | 'compare' | 'process' | 'sources' | 'activity' | 'objectives' | 'faq'
  | 'fields' | 'media' | 'video' | 'audio' | 'pdf' | 'photos' | 'typography' | 'article' | 'qrcode' | 'history'
  | 'tools' | 'clarify';

const RULES: [HarnaisIntent, RegExp][] = [
  // La synthèse passe en premier : « tableau de bord » ne doit pas être lu comme « tableau ».
  ['overview', /tableau de bord|dashboard|synthèse|vue d.ensemble|démo|rapport/i],
  // Intentions spécialisées, avant les règles génériques (« liste », « créer »…).
  ['tools', /outils|que sais-tu faire|que peux-tu|capacités|autre chose/i],
  // Composants du kit : champs, médias, typographie
  ['fields', /tous les champs|types de champs|champs avancés|champs de formulaire|otp|signature|mot de passe|tree-select|transfer/i],
  ['media', /médias|medias|multimédia/i],
  ['video', /vidéo|video|youtube|film|replay|caméra/i],
  ['audio', /audio|son\b|podcast|enregistrement|appel|vocal|musique/i],
  ['pdf', /pdf|contrat|document à lire|visionneuse/i],
  ['photos', /photo|image|galerie d.images|illustration/i],
  ['typography', /typo|police|échelle|titres|font/i],
  ['article', /article|note de version|rédige|commentaires|blog|éditorial/i],
  ['qrcode', /qr|code-barres|barcode|lien de suivi/i],
  ['history', /historique des modif|audit|journal|traçabilité|qui a modifié/i],
  ['code', /code|diff|correctif|patch|bug|corrige|commit|test/i],
  ['upload', /importer|import |upload|téléverser|fichier à analyser|analyser un fichier|joindre/i],
  ['detail', /fiche|détail|profil|modal|dossier client|onglets/i],
  ['json', /json|\bapi\b|payload|données brutes|réponse brute/i],
  ['tree', /arborescence|dossier|répertoire|structure|organigramme|permissions|explorer|documents/i],
  ['compare', /compar|versus| vs |choisir entre|meilleure formule/i],
  ['carousel', /carrousel|carousel|galerie|offres|catalogue|produits|équipements|nouveautés/i],
  ['process', /étapes|processus|procédure|onboarding|checklist|contrôles|mise en service|marche à suivre/i],
  ['sources', /source|web|actualité|veille|article|presse|réglementa/i],
  ['activity', /activité|heatmap|chaleur|connexions|usage|fréquentation|heures/i],
  ['objectives', /objectif|kpi|progression|performance|cible/i],
  ['faq', /faq|questions fréquentes|aide|explique/i],
  ['agenda', /agenda|semaine|journée|aujourd.hui/i],
  ['form', /formulaire|demande|réserv|inscri|créer|ajout|nouveau|nouvelle|signal|ticket|devis/i],
  ['map', /carte|map|localis|position|flotte|véhicule|trajet|zone|gps/i],
  ['chart', /graph|chart|courbe|évolution|tendance|ventes|chiffre|ca |revenu|statist|analyse/i],
  ['table', /tableau|liste|clients|export|lignes|registre|inventaire/i],
  ['calendar', /calendrier|rendez|rdv|planning du mois|disponib/i],
  ['kanban', /kanban|tâches|taches|backlog|colonnes|avancement/i],
  ['gantt', /gantt|projet|déploiement|jalon|feuille de route|roadmap/i],
];

export function detectIntent(prompt: string): HarnaisIntent {
  return RULES.find(([, re]) => re.test(prompt))?.[0] ?? 'clarify';
}

// ─── Dates relatives (le planning reste toujours « actuel ») ──────────
const day = (offset: number, hour = 9) => { const d = new Date(); d.setHours(hour, 0, 0, 0); d.setDate(d.getDate() + offset); return d; };

// ─── Briques de widgets ──────────────────────────────────────────────
export const W = {
  fleetStats: (): HarnaisWidget => ({ type: 'stats', items: [
    { label: 'Véhicules actifs', value: '42', delta: '+3', trend: 'up', tone: 'success', icon: 'local_shipping', hint: 'sur 48', spark: [36, 37, 39, 38, 40, 39, 42] },
    { label: 'Km parcourus', value: '12 480', delta: '+8 %', trend: 'up', tone: 'primary', icon: 'route', hint: '7 derniers jours', spark: [1500, 1720, 1650, 1880, 1790, 1960, 1980] },
    { label: 'Alertes ouvertes', value: '5', delta: '−2', trend: 'down', tone: 'warning', icon: 'notifications_active', spark: [9, 8, 8, 7, 6, 7, 5] },
    { label: 'Disponibilité', value: '96,4 %', delta: '+0,6 pt', trend: 'up', tone: 'info', icon: 'verified', spark: [95.2, 95.6, 95.4, 95.9, 96.1, 96.0, 96.4] },
  ] }),

  fleetMap: (): HarnaisWidget => ({
    type: 'map', title: 'Flotte en temps réel', subtitle: 'Abidjan · 8 véhicules suivis', icon: 'map', height: 320,
    markers: FLOTTE,
    routes: [{ id: 'r1', label: 'Tournée Plateau → Abobo', tone: 'primary', endpoints: true, points: [[5.3237, -4.0193], [5.3400, -4.0150], [5.3700, -4.0180], [5.3950, -4.0220], [5.4180, -4.0200]] }],
    zones: [{ id: 'z1', label: 'Zone portuaire', tone: 'warning', circle: { center: [5.2930, -4.0050], radius: 1400 } }],
    legend: [{ label: 'En mouvement', tone: 'success' }, { label: 'À l’arrêt', tone: 'warning' }, { label: 'Maintenance', tone: 'info' }, { label: 'Alerte', tone: 'error' }],
  }),

  salesChart: (): HarnaisWidget => ({
    type: 'chart', chart: 'area', title: 'Chiffre d’affaires mensuel', subtitle: 'En millions FCFA · 2026 vs 2025', icon: 'show_chart', unit: ' M',
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct'],
    series: [
      { label: '2026', data: [182, 196, 210, 205, 231, 248, 240, 262, 275, 291] },
      { label: '2025', data: [160, 171, 175, 182, 190, 201, 198, 210, 216, 224] },
    ],
  }),

  mixChart: (): HarnaisWidget => ({
    type: 'chart', chart: 'doughnut', title: 'Répartition par offre', subtitle: 'Part du CA · octobre', icon: 'donut_large', unit: ' %',
    labels: ['Abonnement', 'Installation', 'Maintenance', 'Matériel'], series: [{ label: 'Part', data: [54, 21, 15, 10] }],
  }),

  regionChart: (): HarnaisWidget => ({
    type: 'chart', chart: 'hbar', title: 'CA par région', subtitle: 'Millions FCFA · cumul annuel', icon: 'bar_chart', unit: ' M',
    labels: ['Abidjan', 'Bouaké', 'San-Pédro', 'Yamoussoukro', 'Korhogo'], series: [{ label: 'CA', data: [1420, 396, 274, 211, 138] }],
  }),

  clientsTable: (): HarnaisWidget => ({
    type: 'table', title: 'Clients à relancer', subtitle: '8 comptes · triés par encours', icon: 'table_rows', searchable: true, pageSize: 5,
    columns: [
      { key: 'client', label: 'Client', kind: 'person' },
      { key: 'ville', label: 'Ville' },
      { key: 'encours', label: 'Encours', kind: 'number', unit: ' FCFA' },
      { key: 'retard', label: 'Retard', kind: 'number', unit: ' j' },
      { key: 'statut', label: 'Statut', kind: 'badge', tones: { Critique: 'error', 'À relancer': 'warning', 'En cours': 'info', Réglé: 'success' } },
      { key: 'recouvre', label: 'Recouvré', kind: 'progress' },
    ],
    rows: [
      { client: 'Bolloré Logistics CI', ville: 'Abidjan', encours: 4_850_000, retard: 47, statut: 'Critique', recouvre: 20 },
      { client: 'Transports Yao SARL', ville: 'Bouaké', encours: 2_310_000, retard: 32, statut: 'À relancer', recouvre: 45 },
      { client: 'SOTRA', ville: 'Abidjan', encours: 1_980_000, retard: 18, statut: 'En cours', recouvre: 60 },
      { client: 'Cargill Côte d’Ivoire', ville: 'San-Pédro', encours: 1_420_000, retard: 12, statut: 'En cours', recouvre: 72 },
      { client: 'Orange CI', ville: 'Abidjan', encours: 980_000, retard: 9, statut: 'À relancer', recouvre: 35 },
      { client: 'SIFCA', ville: 'Abidjan', encours: 760_000, retard: 5, statut: 'En cours', recouvre: 88 },
      { client: 'Nestlé CI', ville: 'Yamoussoukro', encours: 420_000, retard: 2, statut: 'Réglé', recouvre: 100 },
      { client: 'CIE', ville: 'Korhogo', encours: 310_000, retard: 1, statut: 'Réglé', recouvre: 100 },
    ],
  }),

  interventionForm: (): HarnaisWidget => ({
    type: 'form', formId: 'intervention', title: 'Nouvelle demande d’intervention', icon: 'build',
    description: 'Il me manque quelques informations pour planifier le technicien.',
    submitLabel: 'Planifier l’intervention',
    fields: [
      { key: 'client', label: 'Client', kind: 'select', icon: 'business', required: true, options: [
        { value: 'bollore', label: 'Bolloré Logistics CI' }, { value: 'yao', label: 'Transports Yao SARL' }, { value: 'sotra', label: 'SOTRA' },
      ] },
      { key: 'vehicule', label: 'Immatriculation', kind: 'text', icon: 'directions_car', placeholder: 'CI-0000-AB', required: true },
      { key: 'type', label: 'Type d’intervention', kind: 'segmented', wide: true, value: 'install', options: [
        { value: 'install', label: 'Installation', icon: 'add_circle' }, { value: 'repair', label: 'Dépannage', icon: 'build' }, { value: 'remove', label: 'Retrait', icon: 'remove_circle' },
      ] },
      { key: 'date', label: 'Date souhaitée', kind: 'date', required: true },
      { key: 'creneau', label: 'Créneau', kind: 'select', value: 'matin', options: [
        { value: 'matin', label: 'Matin (8h – 12h)' }, { value: 'aprem', label: 'Après-midi (13h – 17h)' },
      ] },
      { key: 'priorite', label: 'Priorité', kind: 'radio', value: 'normale', options: [
        { value: 'basse', label: 'Basse' }, { value: 'normale', label: 'Normale' }, { value: 'urgente', label: 'Urgente' },
      ] },
      { key: 'equipements', label: 'Équipements', kind: 'chips', value: ['balise'], options: [
        { value: 'balise', label: 'Balise GPS' }, { value: 'camera', label: 'Caméra' }, { value: 'sonde', label: 'Sonde carburant' }, { value: 'immob', label: 'Anti-démarrage' },
      ] },
      { key: 'duree', label: 'Durée estimée', kind: 'slider', min: 30, max: 240, step: 15, value: 90, unit: ' min' },
      { key: 'notes', label: 'Précisions', kind: 'textarea', wide: true, placeholder: 'Accès au site, contact sur place…' },
      { key: 'sms', label: 'Prévenir le client par SMS', kind: 'toggle', value: true, wide: true },
    ],
  }),

  feedbackForm: (): HarnaisWidget => ({
    type: 'form', formId: 'feedback', title: 'Votre avis sur l’intervention', icon: 'reviews', submitLabel: 'Envoyer',
    fields: [
      { key: 'note', label: 'Satisfaction globale', kind: 'rating', value: 4, wide: true },
      { key: 'ponctuel', label: 'Le technicien était ponctuel', kind: 'checkbox', value: true, wide: true },
      { key: 'commentaire', label: 'Commentaire', kind: 'textarea', wide: true },
    ],
  }),

  planningCalendar: (): HarnaisWidget => ({
    type: 'calendar', title: 'Interventions du mois', subtitle: '9 rendez-vous planifiés', icon: 'calendar_month',
    items: calendarItems(),
  }),

  tasksKanban: (): HarnaisWidget => ({
    type: 'kanban', title: 'Suivi des tâches', subtitle: 'Équipe technique', icon: 'view_kanban',
    columns: [{ key: 'todo', label: 'À faire' }, { key: 'doing', label: 'En cours' }, { key: 'done', label: 'Terminé' }],
    items: [
      { id: 'k1', ref: 'INT-0412', title: 'Installer balise CI-4521-AB', status: 'todo', tone: 'primary', assignee: 'Awa Koné', due: day(1) },
      { id: 'k2', ref: 'INT-0415', title: 'Remplacer sonde carburant', status: 'todo', tone: 'warning', assignee: 'Yao Kouamé', due: day(-1) },
      { id: 'k3', ref: 'INT-0409', title: 'Dépannage caméra Actros', status: 'doing', tone: 'info', assignee: 'Awa Koné', progress: 60 },
      { id: 'k4', ref: 'INT-0402', title: 'Retrait boîtier Kangoo', status: 'doing', tone: 'neutral', assignee: 'Ibrahim Traoré', progress: 30 },
      { id: 'k5', ref: 'INT-0398', title: 'Audit flotte SOTRA', status: 'done', tone: 'success', assignee: 'Yao Kouamé', done: true },
    ],
  }),

  rolloutGantt: (): HarnaisWidget => ({
    type: 'gantt', title: 'Déploiement des balises', subtitle: 'Feuille de route · 3 équipes', icon: 'timeline',
    groups: [{ key: 'a', label: 'Équipe Nord' }, { key: 'b', label: 'Équipe Sud' }, { key: 'c', label: 'Équipe Port' }],
    items: [
      { id: 'g1', title: 'Repérage sites', group: 'a', start: day(-3), end: day(1), tone: 'info', progress: 80 },
      { id: 'g2', title: 'Installation lot 1', group: 'a', start: day(2), end: day(8), tone: 'primary', progress: 0 },
      { id: 'g3', title: 'Formation chauffeurs', group: 'b', start: day(0), end: day(4), tone: 'purple', progress: 40 },
      { id: 'g4', title: 'Installation lot 2', group: 'b', start: day(5), end: day(12), tone: 'primary' },
      { id: 'g5', title: 'Recette port', group: 'c', start: day(-1), end: day(6), tone: 'warning', progress: 25 },
    ],
  }),

  incidentTimeline: (): HarnaisWidget => ({
    type: 'timeline', title: 'Historique de l’alerte', subtitle: 'CI-9902-NP · Isuzu D-Max', icon: 'history',
    items: [
      { time: '08:12', title: 'Départ du dépôt', text: 'Koumassi, atelier', tone: 'neutral', icon: 'play_arrow' },
      { time: '09:40', title: 'Entrée zone aéroport', tone: 'info', icon: 'login' },
      { time: '10:05', title: 'Sortie de zone autorisée', text: 'Geofence « Port-Bouët » franchie', tone: 'error', icon: 'warning' },
      { time: '10:07', title: 'Alerte envoyée au superviseur', tone: 'warning', icon: 'notifications_active' },
    ],
  }),

  technicians: (): HarnaisWidget => ({
    type: 'records', title: 'Techniciens disponibles', subtitle: 'Demain matin · Abidjan', icon: 'engineering',
    items: [
      { id: 't1', title: 'Awa Koné', subtitle: 'Installation & dépannage', meta: 'à 4 km', initials: 'AK', tone: 'success', badge: { label: 'Disponible', tone: 'success' }, tags: ['Balise', 'Caméra'] },
      { id: 't2', title: 'Yao Kouamé', subtitle: 'Sondes carburant', meta: 'à 9 km', initials: 'YK', tone: 'primary', badge: { label: '1 créneau', tone: 'warning' }, tags: ['Sonde'] },
      { id: 't3', title: 'Ibrahim Traoré', subtitle: 'Poids lourds', meta: 'à 15 km', initials: 'IT', tone: 'purple', badge: { label: 'Indisponible', tone: 'neutral' }, tags: ['Actros', 'Anti-démarrage'] },
    ],
  }),

  whatNext: (): HarnaisWidget => ({
    type: 'choices', question: 'Que voulez-vous voir ensuite ?', options: [
      { value: 'carte', label: 'La flotte sur une carte', icon: 'map' },
      { value: 'graphique', label: 'L’évolution du CA', icon: 'show_chart' },
      { value: 'tableau', label: 'Les clients à relancer', icon: 'table_rows' },
      { value: 'formulaire', label: 'Créer une intervention', icon: 'edit_note' },
      { value: 'calendrier', label: 'Le planning du mois', icon: 'calendar_month' },
      { value: 'outils', label: 'Autres outils…', icon: 'apps' },
    ],
  }),
};

function calendarItems(): PlanningItem[] {
  const titles: [number, number, string, PlanningItem['tone']][] = [
    [0, 9, 'Installation · Bolloré', 'primary'], [0, 14, 'Dépannage · SOTRA', 'warning'], [1, 10, 'Audit · Cargill', 'info'],
    [3, 8, 'Retrait · Orange CI', 'neutral'], [5, 11, 'Formation chauffeurs', 'purple'], [7, 9, 'Installation · Yao', 'primary'],
    [9, 15, 'Recette port', 'success'], [-2, 10, 'Dépannage · CIE', 'error'], [12, 9, 'Installation · SIFCA', 'primary'],
  ];
  return titles.map(([d, h, title, tone], i) => ({ id: 'cal' + i, title, start: day(d, h), end: day(d, h + 2), tone }));
}

// ─── Réponses par intention ──────────────────────────────────────────
export interface ScenarioReply {
  intro: string;
  blocks: HarnaisBlock[];
  outro?: string;
  /** Cible de l'outil « Recherche » par défaut. */
  tool: string;
  /** Outils explicites (remplacent la recherche par défaut). */
  tools?: { tool: HarnaisToolKind; label: string; target: string; output: string }[];
}

export function scenarioFor(intent: HarnaisIntent): ScenarioReply {
  switch (intent) {
    case 'map': return {
      tool: 'positions GPS · 8 véhicules',
      intro: 'Voici la position actuelle de la flotte. Un véhicule est en alerte (sortie de zone à Port-Bouët) :',
      blocks: [W.fleetMap(), W.incidentTimeline(), { type: 'callout', tone: 'warning', icon: 'warning', title: '1 véhicule hors zone', text: 'CI-9902-NP a quitté la geofence autorisée à 10:05. Le superviseur a été prévenu.' }],
      outro: 'Je peux planifier une intervention sur ce véhicule si besoin.',
    };
    case 'chart': return {
      tool: 'ventes 2025 – 2026',
      intro: 'Le chiffre d’affaires progresse de `+30 %` sur un an. Les trois vues ci-dessous résument la tendance :',
      blocks: [W.salesChart(), { type: 'list', items: ['Croissance régulière depuis mai, portée par les abonnements.', 'Abidjan concentre près des deux tiers du CA.', 'La maintenance gagne 3 points de part sur le trimestre.'] }, W.mixChart(), W.regionChart()],
    };
    case 'table': return {
      tool: 'encours clients',
      intro: 'J’ai trouvé 8 clients avec un encours. Les deux premiers dépassent 30 jours de retard :',
      blocks: [W.clientsTable()],
      outro: 'Vous pouvez trier les colonnes et filtrer la liste directement dans le tableau.',
    };
    case 'form': return {
      tool: 'référentiel clients & véhicules',
      intro: 'Avec plaisir. Complétez ce formulaire et je planifie l’intervention avec le technicien le plus proche :',
      blocks: [W.interventionForm()],
    };
    case 'calendar': return {
      tool: 'agenda des techniciens',
      intro: 'Voici le planning du mois. Les journées les plus chargées sont en début de semaine :',
      blocks: [W.planningCalendar()],
    };
    case 'kanban': return {
      tool: 'tâches de l’équipe',
      intro: 'Voici l’avancement des tâches. Une tâche est en retard (sonde carburant) :',
      blocks: [W.tasksKanban()],
    };
    case 'gantt': return {
      tool: 'feuille de route',
      intro: 'Voici la feuille de route du déploiement sur les deux prochaines semaines :',
      blocks: [W.rolloutGantt()],
    };
    case 'overview': return {
      tool: 'flotte, ventes et encours',
      intro: 'Voici une synthèse complète de l’activité :',
      blocks: [W.fleetStats(), W.salesChart(), W.fleetMap(), W.clientsTable(), W.whatNext()],
    };
    case 'tools': return {
      tool: 'capacités disponibles',
      intro: 'Je peux afficher l’information sous la forme la plus utile. Voici ce que je sais faire :',
      blocks: [X.moreTools()],
    };
    case 'code': return {
      tool: 'geofence.service.ts',
      tools: [
        { tool: 'search', label: 'Recherche', target: 'GEOFENCE_EXIT', output: '3 occurrences' },
        { tool: 'read', label: 'Lecture', target: 'geofence.service.ts', output: '84 lignes' },
        { tool: 'edit', label: 'Modification', target: 'geofence.service.ts', output: '+5 −3' },
      ],
      intro: 'J’ai trouvé la cause : l’alerte est émise à chaque position hors zone, au lieu d’une seule fois au franchissement. Voici le correctif :',
      blocks: [X.codeDiff(), X.approvalTests()],
    };
    case 'upload': return {
      tool: 'formats pris en charge',
      intro: 'Envoyez-moi le fichier : je l’analyse et je vous en fais une synthèse.',
      blocks: [X.uploadRequest()],
    };
    case 'detail': return {
      tool: 'dossier CLI-002',
      intro: 'Voici le dossier du client. L’essentiel est dans les onglets, et la fiche complète s’ouvre en modale :',
      blocks: [X.clientTabs(), X.clientModal()],
    };
    case 'json': return {
      tool: 'API véhicules',
      tools: [{ tool: 'web', label: 'Requête', target: 'GET /vehicules/CI-9902-NP', output: '200 OK · 84 ms' }],
      intro: 'Voici la réponse brute de l’API, dépliable champ par champ :',
      blocks: [X.apiJson()],
    };
    case 'tree': return {
      tool: 'GED · dossier client',
      intro: 'Voici l’arborescence du dossier. Sélectionnez les pièces à inclure dans le rapport :',
      blocks: [X.documentsTree()],
    };
    case 'compare': return {
      tool: 'grille tarifaire 2026',
      intro: 'Pour une flotte comme la vôtre, la formule Pro offre le meilleur équilibre :',
      blocks: [X.plansCompare(), X.offerCards()],
    };
    case 'carousel': return {
      tool: 'catalogue des offres',
      intro: 'Voici nos offres, à faire défiler :',
      blocks: [X.offersCarousel(), X.offerCards()],
    };
    case 'process': return {
      tool: 'procédure de mise en service',
      intro: 'Voici où en est la mise en service, et les contrôles restants :',
      blocks: [X.onboardingSteps(), X.installChecklist()],
    };
    case 'sources': return {
      tool: 'veille réglementaire',
      tools: [{ tool: 'web', label: 'Recherche web', target: 'réglementation géolocalisation Côte d’Ivoire', output: '18 résultats' }],
      intro: 'Deux évolutions vous concernent directement : la protection des données de position et le chronotachygraphe obligatoire en 2027.',
      blocks: [X.webSources(), X.topicTags(), { type: 'callout', tone: 'info', icon: 'gavel', title: 'À anticiper', text: 'Les poids lourds de plus de 3,5 t devront être équipés d’un chronotachygraphe avant janvier 2027.' }],
    };
    case 'activity': return {
      tool: 'trajets des 4 dernières semaines',
      intro: 'L’activité se concentre en semaine entre 8 h et 17 h, avec un pic le matin :',
      blocks: [X.usageStats(), X.activityHeatmap()],
    };
    case 'objectives': return {
      tool: 'objectifs T4',
      intro: 'Le CA est en bonne voie ; le recouvrement est l’objectif le plus à risque :',
      blocks: [X.objectives()],
    };
    case 'faq': return {
      tool: 'base de connaissances',
      intro: 'Voici les réponses aux questions les plus fréquentes :',
      blocks: [X.faqAccordion()],
    };
    case 'agenda': return {
      tool: 'agenda technicien',
      intro: 'Voici l’agenda de la semaine. Mercredi après-midi est encore libre :',
      blocks: [X.weekAgenda()],
    };
    case 'fields': return {
      tool: 'champs du kit',
      intro: 'Voici tous les types de champs que je peux vous demander de remplir : d’abord les champs standard, puis les champs avancés.',
      blocks: [X.materialFieldsForm(), X.advancedFieldsForm()],
    };
    case 'media': return {
      tool: 'médiathèque',
      intro: 'Voici les médias que je peux afficher : vidéo, galerie vidéo, audio, PDF et photos.',
      blocks: [X.tripVideo(), X.videoLibrary(), X.callRecording(), X.contractPdf(), X.sitePhotos()],
    };
    case 'video': return {
      tool: 'caméras embarquées',
      intro: 'Voici le replay du trajet, et les extraits vidéo de la semaine :',
      blocks: [X.tripVideo(), X.videoLibrary(), X.tutorialVideo()],
    };
    case 'audio': return {
      tool: 'enregistrements d’appels',
      intro: 'Voici les derniers enregistrements, avec leur forme d’onde :',
      blocks: [X.callRecording()],
    };
    case 'pdf': return {
      tool: 'GED · contrats',
      intro: 'Voici le contrat, et ce qui a changé depuis la version précédente :',
      blocks: [X.contractPdf(), X.contractDiff()],
    };
    case 'photos': return {
      tool: 'photos d’intervention',
      intro: 'Voici les photos prises lors de l’installation :',
      blocks: [X.sitePhotos(), X.truckImage()],
    };
    case 'typography': return {
      tool: 'design system',
      intro: 'Voici l’échelle typographique du kit, du titre d’accueil à la légende :',
      blocks: [X.typeScale()],
    };
    case 'article': return {
      tool: 'rédaction',
      intro: 'J’ai rédigé la note de version. L’équipe l’a déjà commentée :',
      blocks: [X.releaseArticle(), X.teamComments()],
    };
    case 'qrcode': return {
      tool: 'lien de suivi',
      intro: 'Voici le lien de suivi à partager avec le client :',
      blocks: [X.trackingQr()],
    };
    case 'history': return {
      tool: 'journal d’audit',
      intro: 'Voici qui a modifié ce dossier, et quand :',
      blocks: [X.clientAudit()],
    };
    default: return {
      tool: 'contexte',
      intro: 'Je peux vous répondre sous plusieurs formes. Choisissez ce qui vous serait le plus utile :',
      blocks: [W.whatNext()],
    };
  }
}

/** Suite donnée à un formulaire soumis. */
export function formFollowUp(formId: string, values: Record<string, unknown>): ScenarioReply {
  if (formId === 'intervention') {
    const date = values['date'] instanceof Date ? (values['date'] as Date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : 'à la date choisie';
    return {
      tool: 'disponibilités techniciens',
      intro: `C’est noté : intervention planifiée ${date}. Voici les techniciens disponibles, Awa Koné est la plus proche :`,
      blocks: [
        W.technicians(),
        { type: 'callout', tone: 'success', icon: 'event_available', title: 'Intervention INT-0418 créée', text: values['sms'] ? 'Le client recevra un SMS de confirmation la veille.' : 'Aucun SMS ne sera envoyé au client.' },
      ],
      outro: 'Souhaitez-vous recueillir l’avis du client après l’intervention ?',
    };
  }
  if (formId === 'champs-material' || formId === 'champs-avances') {
    return {
      tool: 'enregistrement',
      intro: 'C’est enregistré. Voici la confirmation :',
      blocks: [X.paymentResult(), X.maintenanceBanner()],
    };
  }
  return {
    tool: 'enregistrement',
    intro: 'Merci, votre retour a bien été enregistré.',
    blocks: [{ type: 'callout', tone: 'success', icon: 'check_circle', title: 'Avis enregistré', text: `Note : ${values['note'] ?? '—'} / 5.` }],
  };
}

/** Suite donnée à une réponse interactive (choix, autorisation, fichier, sélection dans un arbre). */
export function answerFollowUp(type: string, option: HzOption): ScenarioReply {
  if (type === 'approval') {
    return option.value === 'approve'
      ? {
          tool: 'tests',
          tools: [{ tool: 'bash', label: 'Terminal', target: 'npm run test -- --include=src/app/alertes/**', output: '14 tests réussis · 2,1 s' }],
          intro: 'Les tests passent. Le correctif est prêt :',
          blocks: [
            { type: 'steps', steps: [{ label: 'Cause identifiée', status: 'done' }, { label: 'Correctif écrit', status: 'done' }, { label: 'Tests', text: '14 / 14', status: 'done' }, { label: 'Revue', status: 'current' }] },
            { type: 'callout', tone: 'success', icon: 'check_circle', title: 'Prêt à être relu', text: 'Les alertes de zone ne sont plus envoyées qu’une seule fois par franchissement.' },
          ],
        }
      : {
          tool: 'alternatives',
          intro: 'D’accord, je ne lance rien. Le correctif reste en attente : vous pouvez exécuter les tests vous-même.',
          blocks: [{ type: 'code', lang: 'bash', code: 'npm run test -- --include=src/app/alertes/**' }],
        };
  }
  if (type === 'upload') {
    return {
      tool: 'lecture du fichier',
      tools: [{ tool: 'read', label: 'Lecture', target: option.label, output: '1 240 lignes · 9 colonnes' }],
      intro: 'J’ai analysé le fichier. Voici ce qu’il contient :',
      blocks: [
        { type: 'keyvalue', title: 'Fichier', items: [
          { label: 'Nom', value: option.label, icon: 'description' }, { label: 'Lignes', value: '1 240' }, { label: 'Colonnes', value: '9' },
          { label: 'Période', value: '01/09 → 30/09' }, { label: 'Doublons', value: '3', tone: 'warning' }, { label: 'Valeurs manquantes', value: '0,4 %' },
        ] },
        { type: 'tags', title: 'Colonnes détectées', items: [
          { label: 'immatriculation' }, { label: 'date' }, { label: 'départ' }, { label: 'arrivée' }, { label: 'distance_km', tone: 'primary' },
          { label: 'durée' }, { label: 'conducteur' }, { label: 'carburant_l', tone: 'primary' }, { label: 'alerte', tone: 'warning' },
        ] },
        { type: 'chart', chart: 'bar', title: 'Distance par semaine', unit: ' km', labels: ['S36', 'S37', 'S38', 'S39'], series: [{ label: 'Distance', data: [11_200, 12_480, 11_950, 13_100] }] },
      ],
      outro: 'Souhaitez-vous que je corrige les 3 doublons ?',
    };
  }
  if (type === 'tree') {
    return {
      tool: 'génération du rapport',
      intro: 'Le rapport est prêt avec les pièces sélectionnées :',
      blocks: [X.reportFiles(), { type: 'callout', tone: 'success', icon: 'task_alt', title: 'Rapport généré', text: option.label }],
    };
  }
  return scenarioFor(detectIntent(option.value));
}

/** Libellé lisible d'un champ soumis (pour le message récapitulatif de l'utilisateur). */
export function describeValue(field: HzField, value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (value instanceof Date) return field.kind === 'time' ? value.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : value.toLocaleDateString('fr-FR');
  if (typeof value === 'boolean') return value ? 'oui' : 'non';
  const label = (v: unknown) => findOption(field.options ?? [], v)?.label ?? String(v);
  switch (field.kind) {
    case 'daterange': {
      const r = value as { start: Date | null; end: Date | null };
      return r.start && r.end ? `du ${r.start.toLocaleDateString('fr-FR')} au ${r.end.toLocaleDateString('fr-FR')}` : '—';
    }
    case 'range': { const [a, b] = value as [number, number]; return `${fmt(a)} – ${fmt(b)}${field.unit ?? ''}`; }
    case 'currency': return `${fmt(value as number)} ${field.currency ?? 'FCFA'}`.replace('XOF', 'FCFA');
    case 'rating': return `${value} / 5`;
    case 'password': return '•'.repeat(Math.min(String(value).length, 10));
    case 'signature': return 'Signature apposée';
    case 'otp': return String(value).replace(/./g, '•');
    case 'address': return (value as { label?: string }).label ?? '—';
    case 'file': return (value as { nom?: string }).nom ?? '—';
    case 'richtext': return clip(String(value).replace(/<[^>]+>/g, ' '));
    case 'markdown': case 'textarea': return clip(String(value));
  }
  if (Array.isArray(value)) return value.length ? value.map(label).join(', ') : '—';
  return label(value) + (field.unit ?? '');
}

const fmt = (n: number) => Number(n).toLocaleString('fr-FR');
const clip = (t: string) => { const s = t.replace(/\s+/g, ' ').trim(); return s.length > 90 ? s.slice(0, 89) + '…' : s || '—'; };
/** Recherche récursive (options arborescentes de `treeselect`). */
function findOption(list: HzOption[], v: unknown): HzOption | undefined {
  for (const o of list) {
    if (o.value === v) return o;
    const child = o.children && findOption(o.children, v);
    if (child) return child;
  }
  return undefined;
}

// ─── Conversation de démonstration : outils de navigation et de précision ─
export const TOOLKIT_CONVERSATION: HarnaisConversation = {
  id: 'c-outils', title: 'Démo · boîte à outils de l’agent', group: "Aujourd'hui", pinned: true, project: 'Démo', model: 'opus',
  messages: [
    { id: 'o1', role: 'user', time: '11:20', blocks: [{ type: 'text', text: 'Montre-moi tout ce que tu peux afficher pour m’aider à décider.' }] },
    {
      id: 'o2', role: 'assistant', time: '11:21', blocks: [
        { type: 'thinking', duration: '3 s', text: 'Je présente chaque outil sur un cas concret : explorer, détailler, comparer, mesurer, sourcer, puis demander une validation.' },
        { type: 'text', text: 'Voici l’ensemble des outils que je peux utiliser dans une réponse, sur des données d’exemple.' },
        { type: 'text', text: '**Explorer et naviguer**' },
        X.clientTabs(),
        X.clientModal(),
        X.documentsTree(),
        X.offersCarousel(),
        X.faqAccordion(),
        { type: 'text', text: '**Mesurer et préciser**' },
        X.usageStats(),
        X.objectives(),
        X.activityHeatmap(),
        X.onboardingSteps(),
        X.installChecklist(),
        X.clientIdentity(),
        X.plansCompare(),
        X.offerCards(),
        { type: 'text', text: '**Sourcer et inspecter**' },
        X.webSources(),
        X.topicTags(),
        X.apiJson(),
        X.reportFiles(),
        X.weekAgenda(),
        { type: 'text', text: '**Agir avec votre accord**' },
        X.codeDiff(),
        X.approvalTests(),
        X.uploadRequest(),
        X.moreTools(),
      ],
    },
  ],
};

// ─── Conversation de démonstration : composants du kit (champs, typographie, médias) ─
export const KIT_CONVERSATION: HarnaisConversation = {
  id: 'c-kit', title: 'Démo · champs, typographie et médias', group: "Aujourd'hui", pinned: true, project: 'Démo', model: 'opus',
  messages: [
    { id: 'k1', role: 'user', time: '11:40', blocks: [{ type: 'text', text: 'Montre-moi tous les composants du kit que tu peux afficher : champs, typographie, vidéos…' }] },
    {
      id: 'k2', role: 'assistant', time: '11:41', blocks: [
        { type: 'thinking', duration: '2 s', text: 'Je reprends chaque catégorie de /components : formulaires et champs avancés, typographie et contenu éditorial, médias, puis les composants de précision et de feedback.' },
        { type: 'text', text: '**Typographie et contenu**' },
        X.typeScale(),
        X.releaseArticle(),
        X.teamComments(),
        { type: 'text', text: '**Médias**' },
        X.tripVideo(),
        X.tutorialVideo(),
        X.videoLibrary(),
        X.callRecording(),
        X.contractPdf(),
        X.sitePhotos(),
        X.truckImage(),
        { type: 'text', text: '**Précision et feedback**' },
        X.trackingQr(),
        X.contractDiff(),
        X.clientAudit(),
        X.maintenanceBanner(),
        X.paymentResult(),
        { type: 'text', text: '**Tous les champs de formulaire**' },
        X.materialFieldsForm(),
        X.advancedFieldsForm(),
      ],
    },
  ],
};

// ─── Conversation de démonstration : tous les widgets ────────────────
export const DEMO_CONVERSATION: HarnaisConversation = {
  id: 'c-demo', title: 'Démo · rapport d’activité flotte', group: "Aujourd'hui", pinned: true, project: 'Démo', model: 'opus',
  messages: [
    { id: 'd1', role: 'user', time: '10:02', blocks: [{ type: 'text', text: 'Fais-moi un rapport d’activité de la flotte et des ventes, avec tout ce qui est utile.' }] },
    {
      id: 'd2', role: 'assistant', time: '10:03', blocks: [
        { type: 'thinking', duration: '4 s', text: 'Le rapport doit couvrir l’état de la flotte (carte, alertes), la dynamique commerciale (CA, mix, régions) et les encours. Je termine par un formulaire pour planifier l’action corrective.' },
        { type: 'tool', tool: 'search', label: 'Recherche', target: 'positions GPS', status: 'done', output: '8 véhicules' },
        { type: 'tool', tool: 'read', label: 'Lecture', target: 'ventes-T3.xlsx', status: 'done', output: '1 240 lignes' },
        { type: 'text', text: 'Voici le rapport. Les indicateurs sont bons, avec un point d’attention sur un véhicule hors zone.' },
        W.fleetStats(),
        W.fleetMap(),
        W.incidentTimeline(),
        { type: 'callout', tone: 'warning', icon: 'warning', title: 'Point d’attention', text: 'CI-9902-NP est sorti de sa zone autorisée. Une intervention est recommandée.' },
        W.salesChart(),
        W.mixChart(),
        W.regionChart(),
        W.clientsTable(),
        W.tasksKanban(),
        W.rolloutGantt(),
        W.planningCalendar(),
        { type: 'text', text: 'Pour traiter l’alerte, j’ai besoin de quelques informations :' },
        W.interventionForm(),
      ],
    },
  ],
};
