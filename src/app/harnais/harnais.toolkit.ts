import type { HarnaisWidget, HzOption } from '../data/static/harnais.data';
import { COMMENTS } from '../data/static/content.data';
import type { PlanningItem } from '../shared/components/planning/planning.models';

/**
 * Boîte à outils de widgets avancés (navigation, précision, interaction).
 * Données fictives, cohérentes avec le reste de la démo (flotte, clients, interventions).
 */

const day = (offset: number, hour = 9) => { const d = new Date(); d.setHours(hour, 0, 0, 0); d.setDate(d.getDate() + offset); return d; };

export const X = {
  // ─── Navigation dans l'information ─────────────────────────────
  documentsTree: (): HarnaisWidget => ({
    type: 'tree', title: 'Documents du dossier client', subtitle: 'Bolloré Logistics CI · cochez ce qu’il faut inclure', icon: 'account_tree',
    selectable: true, submitLabel: 'Générer le rapport avec ces pièces',
    nodes: [
      { id: 'contrats', label: 'Contrats', icon: 'folder', children: [
        { id: 'c1', label: 'CTR-2026-0042.pdf', icon: 'picture_as_pdf', meta: '1,2 Mo', badge: { label: 'Signé', tone: 'success' } },
        { id: 'c2', label: 'Avenant n°1.pdf', icon: 'picture_as_pdf', meta: '340 Ko', badge: { label: 'En attente', tone: 'warning' } },
      ] },
      { id: 'factures', label: 'Factures', icon: 'folder', children: [
        { id: 'f1', label: 'FAC-2026-0911.pdf', icon: 'receipt_long', meta: '4 850 000 F', badge: { label: 'Impayée', tone: 'error' } },
        { id: 'f2', label: 'FAC-2026-0874.pdf', icon: 'receipt_long', meta: '2 100 000 F' },
        { id: 'f3', label: 'FAC-2026-0812.pdf', icon: 'receipt_long', meta: '1 980 000 F' },
      ] },
      { id: 'interventions', label: 'Interventions', icon: 'folder', children: [
        { id: 'i1', label: 'Rapport INT-0409.pdf', icon: 'build', meta: '12/10' },
        { id: 'i2', label: 'Photos installation', icon: 'folder', children: [
          { id: 'p1', label: 'cabine.jpg', icon: 'image', meta: '2,4 Mo' },
          { id: 'p2', label: 'boitier.jpg', icon: 'image', meta: '1,9 Mo' },
        ] },
      ] },
    ],
  }),

  apiJson: (): HarnaisWidget => ({
    type: 'json', title: 'Réponse de l’API véhicule', subtitle: 'GET /vehicules/CI-9902-NP · 200 OK · 84 ms', icon: 'data_object',
    data: {
      immatriculation: 'CI-9902-NP', modele: 'Isuzu D-Max', enLigne: true, vitesse: 0,
      position: { lat: 5.255, lng: -3.93, precision: 6 },
      alertes: [{ code: 'GEOFENCE_EXIT', niveau: 'critique', heure: '10:05' }],
      capteurs: { carburant: 62, batterie: 12.6, temperatureMoteur: 88 },
    },
  }),

  offersCarousel: (): HarnaisWidget => ({
    type: 'carousel', title: 'Nos offres de suivi', subtitle: '4 formules · faites défiler', icon: 'view_carousel',
    slides: [
      { title: 'Suivi essentiel', tag: 'Le plus vendu', icon: 'gps_fixed', tone: 'primary', text: 'Position en temps réel, historique 90 jours et alertes de zone pour les flottes légères.', stats: [{ label: 'Prix', value: '9 900 F/mois' }, { label: 'Clients', value: '312' }] },
      { title: 'Poids lourds', tag: 'Transport', image: 'assets/camion.png', tone: 'info', text: 'Sondes carburant, temps de conduite et rapports chronotachygraphe.', stats: [{ label: 'Prix', value: '18 500 F/mois' }, { label: 'Économie', value: '−14 % carburant' }] },
      { title: 'Vidéo embarquée', icon: 'videocam', tone: 'purple', text: 'Caméra double face, détection de fatigue et extraits vidéo sur incident.', stats: [{ label: 'Prix', value: '24 000 F/mois' }] },
      { title: 'Anti-démarrage', icon: 'lock', tone: 'error', text: 'Coupure moteur à distance et déverrouillage par badge chauffeur.', stats: [{ label: 'Option', value: '+4 500 F/mois' }] },
    ],
  }),

  clientModal: (): HarnaisWidget => ({
    type: 'modal', title: 'Fiche client complète', icon: 'business',
    summary: 'Bolloré Logistics CI · 48 véhicules suivis · encours de 4 850 000 FCFA, dont une facture en retard de 47 jours.',
    button: 'Ouvrir la fiche', dialogTitle: 'Bolloré Logistics CI', dialogSubtitle: 'Client depuis mars 2021 · Abidjan, Plateau',
    blocks: [
      X.clientIdentity(),
      { type: 'stats', items: [
        { label: 'Véhicules', value: '48', icon: 'local_shipping', tone: 'primary', spark: [38, 40, 41, 44, 45, 48] },
        { label: 'Encours', value: '4,85 M', icon: 'account_balance_wallet', tone: 'error', delta: '+1,2 M', trend: 'up' },
        { label: 'Satisfaction', value: '4,6 / 5', icon: 'sentiment_satisfied', tone: 'success' },
      ] },
      { type: 'timeline', title: 'Derniers échanges', items: [
        { time: '12/10', title: 'Relance facture FAC-0911', text: 'Par e-mail, sans réponse', tone: 'warning', icon: 'mail' },
        { time: '08/10', title: 'Intervention INT-0409 clôturée', tone: 'success', icon: 'build' },
        { time: '02/10', title: 'Appel du responsable flotte', text: 'Demande de 6 balises supplémentaires', tone: 'info', icon: 'call' },
      ] },
    ],
  }),

  clientIdentity: (): HarnaisWidget => ({
    type: 'keyvalue', title: 'Identité', icon: 'badge',
    items: [
      { label: 'Raison sociale', value: 'Bolloré Logistics CI', icon: 'business' },
      { label: 'Compte', value: 'CLI-002', mono: true, copy: true },
      { label: 'RCCM', value: 'CI-ABJ-2003-B-1234', mono: true, copy: true },
      { label: 'Contact', value: 'Mme Aya Diallo', icon: 'person' },
      { label: 'Téléphone', value: '+225 07 07 45 12 98', icon: 'call', copy: true },
      { label: 'Statut', value: 'Retard de paiement', icon: 'warning', tone: 'error' },
    ],
  }),

  clientTabs: (): HarnaisWidget => ({
    type: 'tabs', title: 'Dossier Bolloré Logistics CI', subtitle: 'Toutes les informations, par onglet', icon: 'folder_shared',
    tabs: [
      { label: 'Aperçu', icon: 'dashboard', blocks: [
        { type: 'stats', items: [
          { label: 'CA annuel', value: '58,2 M', tone: 'primary', icon: 'payments', spark: [3.9, 4.4, 4.1, 4.8, 5.2, 5.6, 5.1, 5.9] },
          { label: 'Véhicules', value: '48', tone: 'success', icon: 'local_shipping', spark: [38, 40, 41, 44, 45, 48] },
          { label: 'Tickets ouverts', value: '3', tone: 'warning', icon: 'support_agent', spark: [6, 5, 7, 4, 3, 3] },
        ] },
        { type: 'paragraph', text: 'Client stratégique : il représente 12 % du CA de la région d’Abidjan. Le retard de paiement est récent et lié à un changement d’interlocuteur comptable.' },
      ] },
      { label: 'Factures', icon: 'receipt_long', badge: '3', blocks: [
        { type: 'table', columns: [
          { key: 'num', label: 'N°', kind: 'mono' }, { key: 'date', label: 'Date' }, { key: 'montant', label: 'Montant', kind: 'number', unit: ' F' },
          { key: 'statut', label: 'Statut', kind: 'badge', tones: { Payée: 'success', Impayée: 'error', Partielle: 'warning' } },
        ], rows: [
          { num: 'FAC-0911', date: '28/08', montant: 4_850_000, statut: 'Impayée' },
          { num: 'FAC-0874', date: '28/07', montant: 2_100_000, statut: 'Partielle' },
          { num: 'FAC-0812', date: '28/06', montant: 1_980_000, statut: 'Payée' },
        ] },
      ] },
      { label: 'Contacts', icon: 'contacts', blocks: [
        { type: 'records', items: [
          { id: 'ct1', title: 'Aya Diallo', subtitle: 'Responsable flotte', meta: 'principal', initials: 'AD', tone: 'primary', tags: ['Décisionnaire'] },
          { id: 'ct2', title: 'Marc Kouadio', subtitle: 'Comptabilité fournisseurs', meta: 'nouveau', initials: 'MK', tone: 'warning', badge: { label: 'À contacter', tone: 'warning' } },
        ] },
      ] },
      { label: 'Historique', icon: 'history', blocks: [
        { type: 'timeline', items: [
          { time: '2021', title: 'Signature du premier contrat', tone: 'success', icon: 'handshake' },
          { time: '2024', title: 'Extension à 40 véhicules', tone: 'info', icon: 'trending_up' },
          { time: '2026', title: 'Passage à l’offre Poids lourds', tone: 'primary', icon: 'local_shipping' },
        ] },
      ] },
    ],
  }),

  faqAccordion: (): HarnaisWidget => ({
    type: 'accordion', title: 'Questions fréquentes', subtitle: 'Balises GPS et abonnements', icon: 'quiz',
    items: [
      { title: 'Combien de temps dure une installation ?', icon: 'schedule', open: true, blocks: [
        { type: 'paragraph', text: 'Comptez 45 à 90 minutes par véhicule selon les options. Le véhicule reste immobilisé pendant toute la durée.' },
        { type: 'progress', items: [{ label: 'Balise seule', value: 45, target: 90, unit: ' min', tone: 'success' }, { label: 'Balise + caméra', value: 90, target: 90, unit: ' min', tone: 'warning' }] },
      ] },
      { title: 'Que se passe-t-il en cas de perte de réseau ?', icon: 'signal_cellular_off', blocks: [
        { type: 'paragraph', text: 'La balise stocke jusqu’à 30 jours de positions et les renvoie dès que le réseau revient.' },
      ] },
      { title: 'Quels documents fournir ?', icon: 'description', blocks: [
        { type: 'checklist', items: [{ label: 'Carte grise du véhicule', done: true }, { label: 'Pièce d’identité du gérant', done: true }, { label: 'Bon de commande signé' }] },
      ] },
    ],
  }),

  // ─── Précision ─────────────────────────────────────────────────
  onboardingSteps: (): HarnaisWidget => ({
    type: 'steps', title: 'Mise en service d’un nouveau client', icon: 'linear_scale',
    steps: [
      { label: 'Contrat signé', text: '02/10', status: 'done' },
      { label: 'Pièces reçues', text: '05/10', status: 'done' },
      { label: 'Installation', text: 'en cours', status: 'current' },
      { label: 'Formation', status: 'todo' },
      { label: 'Recette', status: 'todo' },
    ],
  }),

  installChecklist: (): HarnaisWidget => ({
    type: 'checklist', title: 'Contrôles avant installation', subtitle: 'Cochez au fur et à mesure', icon: 'checklist',
    items: [
      { label: 'Véhicule disponible sur site', done: true, hint: 'confirmé' },
      { label: 'Batterie > 12,2 V', done: true },
      { label: 'Emplacement boîtier validé avec le client' },
      { label: 'Carte SIM activée', hint: 'ICCID requis' },
      { label: 'Photos avant / après' },
    ],
  }),

  objectives: (): HarnaisWidget => ({
    type: 'progress', title: 'Objectifs du trimestre', subtitle: 'T4 2026 · au 14 octobre', icon: 'track_changes',
    items: [
      { label: 'Nouvelles installations', value: 142, target: 200, tone: 'primary' },
      { label: 'Chiffre d’affaires', value: 291, target: 320, unit: ' M', tone: 'success' },
      { label: 'Taux de résolution J+1', value: 87, target: 95, unit: ' %', tone: 'warning' },
      { label: 'Recouvrement', value: 61, target: 90, unit: ' %', tone: 'error' },
    ],
  }),

  activityHeatmap: (): HarnaisWidget => {
    const cols = Array.from({ length: 12 }, (_, i) => `${7 + i}h`);
    const rows = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    let seed = 11;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const values = rows.map((_, r) => cols.map((_, c) => Math.round((r > 4 ? 0.25 : 1) * (c > 1 && c < 10 ? 1 : 0.4) * (20 + rnd() * 80))));
    return { type: 'heatmap', title: 'Activité des véhicules', subtitle: 'Trajets démarrés par heure · 4 dernières semaines', icon: 'grid_on', rows, cols, values, unit: ' trajets' };
  },

  usageStats: (): HarnaisWidget => ({ type: 'stats', items: [
    { label: 'Trajets / jour', value: '386', delta: '+6 %', trend: 'up', tone: 'primary', icon: 'route', spark: [320, 335, 341, 352, 360, 371, 386] },
    { label: 'Heure de pointe', value: '8 h – 9 h', tone: 'info', icon: 'schedule', hint: 'lun. – ven.' },
    { label: 'Temps moteur à l’arrêt', value: '11 %', delta: '−3 pt', trend: 'down', tone: 'success', icon: 'local_gas_station', spark: [16, 15, 14, 14, 13, 12, 11] },
  ] }),

  codeDiff: (): HarnaisWidget => ({
    type: 'diff', title: 'Correctif proposé', subtitle: 'Alerte de zone déclenchée deux fois', icon: 'difference',
    file: 'src/app/alertes/geofence.service.ts',
    patch: `@@ -38,9 +38,12 @@ export class GeofenceService {
   check(position: Position, zone: Zone): void {
     const inside = zone.contains(position);
-    if (!inside) {
-      this.alertes.emit({ code: 'GEOFENCE_EXIT', vehicule: position.vehicule });
-    }
+    const wasInside = this.state.get(position.vehicule) ?? true;
+    // On n'alerte qu'au franchissement, pas à chaque position hors zone.
+    if (wasInside && !inside) {
+      this.alertes.emit({ code: 'GEOFENCE_EXIT', vehicule: position.vehicule });
+    }
+    this.state.set(position.vehicule, inside);
   }`,
  }),

  approvalTests: (): HarnaisWidget => ({
    type: 'approval', risk: 'warning',
    title: 'Autoriser l’exécution de cette commande ?',
    text: 'Je dois lancer les tests du service d’alertes pour vérifier le correctif. Aucun fichier ne sera modifié.',
    command: 'npm run test -- --include=src/app/alertes/**',
  }),

  webSources: (): HarnaisWidget => ({
    type: 'sources', title: 'Sources consultées', subtitle: '4 résultats pertinents', icon: 'travel_explore',
    items: [
      { site: 'artci.ci', date: 'sept. 2026', title: 'Cadre réglementaire des données de géolocalisation', snippet: 'Les données de position des véhicules professionnels sont des données personnelles dès lors qu’elles permettent d’identifier un conducteur…' },
      { site: 'transports.gouv.ci', date: 'août 2026', title: 'Obligation de chronotachygraphe pour les poids lourds', snippet: 'À compter de janvier 2027, tout véhicule de plus de 3,5 t affecté au transport de marchandises…' },
      { site: 'jeuneafrique.com', date: 'juil. 2026', title: 'La télématique s’impose dans la logistique ouest-africaine' },
      { site: 'iso.org', title: 'ISO 15638 — Cadre des applications télématiques coopératives' },
    ],
  }),

  topicTags: (): HarnaisWidget => ({
    type: 'tags', title: 'Thèmes détectés', icon: 'sell',
    items: [
      { label: 'Données personnelles', count: 12, tone: 'error' }, { label: 'Chronotachygraphe', count: 8, tone: 'warning' },
      { label: 'Poids lourds', count: 7, tone: 'info' }, { label: 'Consentement', count: 5, tone: 'purple' },
      { label: 'Conservation 12 mois', count: 3, tone: 'primary' }, { label: 'ARTCI', count: 3, tone: 'neutral' },
    ],
  }),

  reportFiles: (): HarnaisWidget => ({
    type: 'files', title: 'Fichiers générés', subtitle: 'Prêts à être envoyés', icon: 'folder',
    items: [
      { name: 'Rapport-Bollore-T4.pdf', ext: 'pdf', size: '2,8 Mo', date: 'à l’instant', by: 'Harnais' },
      { name: 'Encours-clients.xls', ext: 'xls', size: '84 Ko', date: 'à l’instant', by: 'Harnais' },
      { name: 'Trajets-octobre.csv', ext: 'csv', size: '1,1 Mo', date: 'à l’instant', by: 'Harnais' },
    ],
  }),

  offerCards: (): HarnaisWidget => ({
    type: 'cards', title: 'Équipements recommandés', subtitle: 'Pour une flotte mixte de 48 véhicules', icon: 'grid_view',
    items: [
      { title: 'Balise GT-06', icon: 'gps_fixed', tone: 'primary', text: 'GPS + GSM, batterie de secours 8 h.', price: '45 000 F', meta: 'en stock', tags: ['4G', 'IP67'], cta: 'Ajouter' },
      { title: 'Sonde carburant', icon: 'local_gas_station', tone: 'warning', text: 'Mesure capacitive ±1 %.', price: '120 000 F', meta: '5 j', tags: ['Poids lourds'], cta: 'Ajouter' },
      { title: 'Caméra DC-2', icon: 'videocam', tone: 'purple', text: 'Double face, détection de fatigue.', price: '185 000 F', meta: 'en stock', cta: 'Ajouter' },
      { title: 'Lecteur de badge', icon: 'badge', tone: 'info', text: 'Identification du chauffeur.', price: '32 000 F', meta: '10 j', cta: 'Ajouter' },
    ],
  }),

  plansCompare: (): HarnaisWidget => ({
    type: 'compare', title: 'Comparatif des formules', subtitle: 'Prix par véhicule et par mois', icon: 'compare',
    plans: [
      { name: 'Essentiel', price: '9 900 F' },
      { name: 'Pro', price: '14 500 F', note: 'le meilleur rapport', recommended: true },
      { name: 'Poids lourds', price: '18 500 F' },
    ],
    features: [
      { label: 'Position temps réel', values: [true, true, true] },
      { label: 'Historique', values: ['90 j', '12 mois', '24 mois'] },
      { label: 'Alertes de zone', values: [true, true, true] },
      { label: 'Rapports automatiques', values: [false, true, true] },
      { label: 'Sonde carburant', values: [false, 'option', true] },
      { label: 'Chronotachygraphe', values: [false, false, true] },
      { label: 'Support', values: ['e-mail', '7j/7', 'dédié'] },
    ],
  }),

  // ─── Interaction ───────────────────────────────────────────────
  uploadRequest: (): HarnaisWidget => ({
    type: 'upload', title: 'Fichier à analyser', subtitle: 'Export de trajets, factures ou liste de véhicules', icon: 'upload_file',
    accept: '.csv,.xlsx,.xls,.pdf,.json', hint: 'CSV, Excel, PDF ou JSON · lu localement, rien n’est envoyé sur un serveur.',
  }),

  weekAgenda: (): HarnaisWidget => ({
    type: 'agenda', title: 'Agenda de la semaine', subtitle: 'Awa Koné · technicienne', icon: 'today',
    items: weekItems(),
  }),

  // ─── Formulaire : tous les types de champs du kit ─────────────
  /** Champs Material de /components/forms. */
  materialFieldsForm: (): HarnaisWidget => ({
    type: 'form', formId: 'champs-material', title: 'Ouverture de compte client', subtitle: 'Champs standard · /components/forms', icon: 'edit_note',
    description: 'Tous les champs Material du kit, avec validation.', submitLabel: 'Créer le compte',
    fields: [
      { key: 'raison', label: 'Raison sociale', kind: 'text', icon: 'business', required: true, placeholder: 'Transports Yao SARL' },
      { key: 'email', label: 'E-mail', kind: 'email', icon: 'mail', required: true, placeholder: 'contact@exemple.ci' },
      { key: 'tel', label: 'Téléphone', kind: 'mask', icon: 'call', mask: '+225 00 00 00 00 00', placeholder: '+225 07 00 00 00 00' },
      { key: 'immat', label: 'Immatriculation', kind: 'mask', icon: 'directions_car', mask: 'AA-0000-AA' },
      { key: 'site', label: 'Site web', kind: 'url', icon: 'language', placeholder: 'https://' },
      { key: 'flotte', label: 'Taille de flotte', kind: 'number', icon: 'local_shipping', min: 1, unit: 'véhicules' },
      { key: 'ville', label: 'Ville', kind: 'autocomplete', icon: 'location_city', options: CITIES },
      { key: 'recherche', label: 'Rechercher un contact', kind: 'search', icon: 'search', placeholder: 'Nom, téléphone…' },
      { key: 'secteur', label: 'Secteur', kind: 'select', icon: 'category', options: [
        { value: 'transport', label: 'Transport' }, { value: 'btp', label: 'BTP' }, { value: 'agro', label: 'Agro-industrie' }, { value: 'distribution', label: 'Distribution' },
      ] },
      { key: 'modules', label: 'Modules', kind: 'multiselect', icon: 'apps', options: [
        { value: 'gps', label: 'Suivi GPS' }, { value: 'carburant', label: 'Carburant' }, { value: 'video', label: 'Vidéo' }, { value: 'rapports', label: 'Rapports' },
      ] },
      { key: 'debut', label: 'Date de démarrage', kind: 'date' },
      { key: 'rdv', label: 'Heure du rendez-vous', kind: 'time', step: 30 },
      { key: 'periode', label: 'Période d’essai', kind: 'daterange', wide: true },
      { key: 'facturation', label: 'Facturation', kind: 'segmented', wide: true, value: 'mensuelle', options: [
        { value: 'mensuelle', label: 'Mensuelle', icon: 'calendar_view_month' }, { value: 'annuelle', label: 'Annuelle', icon: 'event_repeat' },
      ] },
      { key: 'paiement', label: 'Moyen de paiement', kind: 'radio', value: 'virement', options: [
        { value: 'virement', label: 'Virement' }, { value: 'mobile', label: 'Mobile Money' }, { value: 'cheque', label: 'Chèque' },
      ] },
      { key: 'options', label: 'Options', kind: 'chips', options: [
        { value: 'sms', label: 'Alertes SMS' }, { value: 'api', label: 'Accès API' }, { value: 'formation', label: 'Formation' },
      ] },
      { key: 'remise', label: 'Remise', kind: 'slider', min: 0, max: 30, step: 1, value: 5, unit: ' %' },
      { key: 'confiance', label: 'Niveau de confiance', kind: 'rating', value: 3 },
      { key: 'kbis', label: 'Registre du commerce (RCCM)', kind: 'file', accept: 'application/pdf,image/*', wide: true },
      { key: 'notes', label: 'Notes', kind: 'textarea', placeholder: 'Contexte commercial…' },
      { key: 'newsletter', label: 'Recevoir la newsletter', kind: 'toggle', value: true, wide: true, hint: 'une fois par mois' },
      { key: 'cgv', label: 'J’accepte les conditions générales', kind: 'checkbox', required: true, wide: true },
    ],
  }),

  /** Champs avancés de /components/fields. */
  advancedFieldsForm: (): HarnaisWidget => ({
    type: 'form', formId: 'champs-avances', title: 'Paramétrage du contrat', subtitle: 'Champs avancés · /components/fields', icon: 'tune',
    description: 'Tous les champs avancés du kit : montant, intervalle, éditeurs, signature, arborescence, transfert…', submitLabel: 'Valider le contrat',
    fields: [
      { key: 'code', label: 'Code de vérification (reçu par SMS)', kind: 'otp', length: 6, hint: 'Saisissez ou collez les 6 chiffres' },
      { key: 'vehicules', label: 'Nombre de véhicules', kind: 'stepper', min: 1, max: 500, value: 12, unit: 'véh.' },
      { key: 'montant', label: 'Montant mensuel', kind: 'currency', currency: 'XOF', value: 1_250_000, required: true },
      { key: 'budget', label: 'Fourchette de budget par véhicule', kind: 'range', min: 0, max: 50_000, step: 500, value: [9_900, 24_000], unit: ' F',
        histogram: [2, 4, 7, 12, 18, 26, 31, 28, 22, 19, 15, 12, 9, 7, 5, 4, 3, 2, 2, 1] },
      { key: 'couleur', label: 'Couleur des véhicules sur la carte', kind: 'color', value: '#4f6bed' },
      { key: 'zones', label: 'Zones couvertes', kind: 'treeselect', multiple: true, value: ['plateau', 'bouake'], options: ZONES },
      { key: 'motscles', label: 'Mots-clés', kind: 'tags', value: ['Flotte', 'Installation'], options: ['Urgent', 'Maintenance', 'Installation', 'Garantie', 'Client VIP', 'Flotte', 'Carburant'].map((l) => ({ value: l, label: l })) },
      { key: 'adresse', label: 'Adresse du dépôt', kind: 'address', map: true },
      { key: 'affectes', label: 'Véhicules couverts', kind: 'transfer', value: ['CI-2210-CD'], options: [
        { value: 'CI-4521-AB', label: 'CI-4521-AB', description: 'Toyota Hilux', icon: 'local_shipping' },
        { value: 'CI-2210-CD', label: 'CI-2210-CD', description: 'Renault Kangoo', icon: 'airport_shuttle' },
        { value: 'CI-3307-EF', label: 'CI-3307-EF', description: 'Suzuki Swift', icon: 'directions_car' },
        { value: 'CI-0418-GH', label: 'CI-0418-GH', description: 'Yamaha Crux', icon: 'two_wheeler' },
        { value: 'CI-7781-JK', label: 'CI-7781-JK', description: 'Mercedes Actros', icon: 'local_shipping' },
      ] },
      { key: 'clauses', label: 'Clauses particulières', kind: 'richtext', value: '<p>Installation sous <b>48 h</b> après signature.</p><ul><li>Garantie matériel 24 mois</li></ul>' },
      { key: 'procedure', label: 'Procédure d’installation', kind: 'markdown', value: '## Étapes\n\n1. Couper le contact\n2. Raccorder la balise au **+APC**\n\n> Vérifier la remontée GPS avant de partir.' },
      { key: 'motdepasse', label: 'Mot de passe du compte client', kind: 'password', secret: true, required: true },
      { key: 'cle', label: 'Clé API', kind: 'copy', value: 'lk_live_9f2c4e7a1b8d3f60', secret: true, icon: 'key' },
      { key: 'signature', label: 'Signature du client', kind: 'signature', required: true },
    ],
  }),

  // ─── Typographie et contenu ────────────────────────────────────
  typeScale: (): HarnaisWidget => ({
    type: 'typography', title: 'Échelle typographique', subtitle: 'Outfit pour les titres, Inter pour le texte · classes .text-*', icon: 'text_fields',
    items: [
      { variant: 'display', text: '1 248 véhicules' },
      { variant: 'h1', text: 'Référentiel unique' },
      { variant: 'h2', text: 'Tableau de bord Finance' },
      { variant: 'h3', text: 'Informations générales' },
      { variant: 'h4', text: 'Coordonnées' },
      { variant: 'card-title', text: 'Abonnement Standard' },
      { variant: 'body-lg', text: 'Suivez votre flotte en temps réel et recevez une alerte à chaque événement.' },
      { variant: 'body', text: 'Le client signale une perte de signal entre 18 h et 20 h.' },
      { variant: 'body-sm', text: 'Catalogue des offres et tarifs d’installation.' },
      { variant: 'label', text: 'Raison sociale' },
      { variant: 'caption', text: 'Mis à jour il y a 3 min' },
      { variant: 'overline', text: 'Code client' },
      { variant: 'mono', text: 'FAC-2026-0981 · 358240051111110' },
      { variant: 'brand', text: 'Lookas — suivi de flotte', tone: 'primary' },
      { variant: 'quote', text: 'Un composant qui n’est pas documenté n’existe pas.' },
    ],
  }),

  releaseArticle: (): HarnaisWidget => ({
    type: 'article', title: 'Note de version 4.2', subtitle: 'Rédigée par l’agent · 2 min de lecture', icon: 'article',
    blocks: [
      { type: 'lead', text: 'La version 4.2 rend les **alertes de zone** plus fiables et introduit le suivi vidéo embarqué.' },
      { type: 'h2', text: 'Ce qui change' },
      { type: 'list', items: ['Une seule alerte par franchissement de zone', 'Extraits vidéo automatiques sur incident', 'Export PDF des rapports mensuels'] },
      { type: 'callout', tone: 'info', title: 'Migration', text: 'Aucune action requise : les zones existantes sont conservées.' },
      { type: 'quote', text: 'Nous recevions dix alertes pour un seul véhicule. Désormais, c’est une seule, au bon moment.', cite: 'Aya Diallo, responsable flotte' },
      { type: 'code', lang: 'bash', filename: 'terminal', code: 'npm install @lookas/sdk@4.2.0' },
      { type: 'table', head: ['Module', 'Avant', 'Après'], rows: [['Alertes', '10 / incident', '1 / incident'], ['Rapports', 'CSV', 'CSV + PDF']] },
      { type: 'divider' },
      { type: 'p', text: 'Retrouvez le détail dans la documentation, rubrique *Nouveautés*.' },
    ],
  }),

  teamComments: (): HarnaisWidget => ({ type: 'comments', title: 'Discussion de l’équipe', subtitle: 'Sur la note de version', icon: 'forum', comments: COMMENTS.slice(0, 3) }),

  // ─── Médias ────────────────────────────────────────────────────
  tripVideo: (): HarnaisWidget => ({ type: 'video', title: 'Replay du trajet CI-4521-AB', subtitle: 'Vidéo générée localement', icon: 'smart_display', seconds: 6, caption: 'Animation enregistrée depuis un canvas : rien n’est téléchargé.' }),
  tutorialVideo: (): HarnaisWidget => ({ type: 'video', title: 'Big Buck Bunny', subtitle: 'YouTube · chargé uniquement au clic', icon: 'smart_display', youtube: 'aqz-KE-bpKQ', duration: '10:34' }),
  videoLibrary: (): HarnaisWidget => ({
    type: 'videos', title: 'Extraits vidéo de la semaine', subtitle: 'Caméras embarquées', icon: 'video_library',
    videos: [
      { id: 'v1', title: 'Freinage brusque · CI-9902-NP', sample: true, duration: '0:05', category: 'Incidents', meta: 'lundi · 10:05' },
      { id: 'v2', title: 'Sortie de zone · Port-Bouët', sample: true, duration: '0:05', category: 'Incidents', meta: 'mardi · 14:12' },
      { id: 'v3', title: 'Sintel', youtube: 'eRsGyueVLvQ', duration: '14:48', category: 'Formation', author: 'Blender Foundation', meta: 'YouTube' },
    ],
  }),
  callRecording: (): HarnaisWidget => ({
    type: 'audio', title: 'Enregistrements d’appels', subtitle: 'Support client · 3 pistes', icon: 'graphic_eq',
    tracks: [
      { title: 'Appel Bolloré Logistics', artist: 'Aya Diallo', sample: 12, icon: 'call' },
      { title: 'Relance facture FAC-0911', artist: 'Service comptable', sample: 9, icon: 'call' },
      { title: 'Message vocal technicien', artist: 'Awa Koné', sample: 6, icon: 'voicemail' },
    ],
  }),
  contractPdf: (): HarnaisWidget => ({ type: 'pdf', title: 'Contrat cadre 2026', subtitle: 'Bolloré Logistics CI · 4 pages', icon: 'picture_as_pdf', name: 'contrat-cadre-2026.pdf', pages: 4, height: 440 }),
  sitePhotos: (): HarnaisWidget => ({ type: 'gallery', title: 'Photos d’installation', subtitle: '8 photos · cliquez pour agrandir', icon: 'photo_library', sample: 8 }),
  truckImage: (): HarnaisWidget => ({ type: 'image', src: 'assets/camion.png', title: 'Véhicule concerné', icon: 'image', caption: 'Mercedes Actros · CI-7781-JK' }),

  // ─── Précision (suite) ─────────────────────────────────────────
  trackingQr: (): HarnaisWidget => ({
    type: 'qrcode', title: 'Lien de suivi partageable', subtitle: 'À scanner par le client', icon: 'qr_code_2',
    value: 'https://suivi.example.com/v/CI-4521-AB', caption: 'suivi.example.com/v/CI-4521-AB', barcode: '358240051111110',
  }),
  contractDiff: (): HarnaisWidget => ({
    type: 'textdiff', title: 'Modifications du contrat', subtitle: 'Version 2 → version 3', icon: 'difference', mode: 'split',
    before: 'Article 4 — Durée\nLe contrat est conclu pour 12 mois.\nIl est renouvelable par tacite reconduction.\n\nArticle 5 — Prix\n9 900 FCFA par véhicule et par mois.',
    after: 'Article 4 — Durée\nLe contrat est conclu pour 24 mois.\nIl est renouvelable par tacite reconduction.\n\nArticle 5 — Prix\n8 900 FCFA par véhicule et par mois.\nRemise de 5 % au-delà de 50 véhicules.',
  }),
  clientAudit: (): HarnaisWidget => ({
    type: 'audit', title: 'Historique des modifications', subtitle: 'Client CLI-002', icon: 'manage_history',
    entries: [
      { id: 'a1', at: day(0, 10), user: { name: 'Aya Koné', color: '#8b5cf6' }, action: 'update', target: 'Client CLI-002', changes: [{ field: 'statut', label: 'Statut', before: 'Actif', after: 'Retard de paiement' }] },
      { id: 'a2', at: day(-1, 15), user: { name: 'Marc Yao', color: '#10b981' }, action: 'comment', target: 'Facture FAC-0911', comment: 'Relance envoyée par e-mail.' },
      { id: 'a3', at: day(-3, 9), user: { name: 'Jean Kouassi', color: '#0ea5e9' }, action: 'export', target: 'Rapport T3', meta: 'PDF · 2,8 Mo' },
      { id: 'a4', at: day(-12, 11), user: { name: 'Jean Kouassi', color: '#0ea5e9' }, action: 'create', target: 'Client CLI-002' },
    ],
  }),
  paymentResult: (): HarnaisWidget => ({ type: 'result', status: 'success', title: 'Contrat validé', text: 'Le client recevra une copie signée par e-mail.' }),
  maintenanceBanner: (): HarnaisWidget => ({ type: 'banner', tone: 'maintenance', title: 'Maintenance prévue', text: 'La plateforme sera indisponible dimanche de 2 h à 4 h.' }),

  moreTools: (): HarnaisWidget => ({
    type: 'choices', question: 'Je peux aussi :', options: [
      { value: 'arborescence', label: 'Explorer les documents', icon: 'account_tree' },
      { value: 'fiche client', label: 'Ouvrir une fiche client', icon: 'badge' },
      { value: 'offres', label: 'Présenter les offres', icon: 'view_carousel' },
      { value: 'comparer', label: 'Comparer les formules', icon: 'compare' },
      { value: 'corrige le bug', label: 'Corriger un bug', icon: 'difference' },
      { value: 'importer un fichier', label: 'Analyser un fichier', icon: 'upload_file' },
      { value: 'veille réglementaire', label: 'Faire une veille', icon: 'travel_explore' },
      { value: 'objectifs', label: 'Suivre les objectifs', icon: 'track_changes' },
      { value: 'tous les champs', label: 'Tous les champs de formulaire', icon: 'dynamic_form' },
      { value: 'médias', label: 'Vidéos, audio, PDF, photos', icon: 'perm_media' },
      { value: 'typographie', label: 'Typographie et article', icon: 'text_fields' },
      { value: 'qr code', label: 'QR code, diff, historique', icon: 'qr_code_2' },
    ],
  }),
};

const CITIES: HzOption[] = ['Abidjan', 'Bouaké', 'Daloa', 'Korhogo', 'Man', 'San-Pédro', 'Yamoussoukro'].map((l) => ({ value: l, label: l }));
const ZONES: HzOption[] = [
  { value: 'abj', label: 'Abidjan', icon: 'location_city', children: [
    { value: 'plateau', label: 'Plateau' }, { value: 'cocody', label: 'Cocody' }, { value: 'yopougon', label: 'Yopougon' }, { value: 'port-bouet', label: 'Port-Bouët' },
  ] },
  { value: 'centre', label: 'Centre', icon: 'landscape', children: [{ value: 'yakro', label: 'Yamoussoukro' }, { value: 'bouake', label: 'Bouaké' }] },
  { value: 'ouest', label: 'Ouest', icon: 'forest', children: [{ value: 'daloa', label: 'Daloa' }, { value: 'sanpedro', label: 'San-Pédro' }] },
];

function weekItems(): PlanningItem[] {
  const list: [number, number, number, string, PlanningItem['tone']][] = [
    [0, 8, 10, 'Installation · Bolloré', 'primary'], [0, 14, 16, 'Dépannage · SOTRA', 'warning'],
    [1, 9, 11, 'Audit · Cargill', 'info'], [2, 10, 12, 'Retrait · Orange CI', 'neutral'], [3, 13, 15, 'Formation chauffeurs', 'purple'],
  ];
  return list.map(([d, h1, h2, title, tone], i) => ({ id: 'ag' + i, title, start: day(d, h1), end: day(d, h2), tone }));
}
