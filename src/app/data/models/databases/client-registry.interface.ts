export interface ClientRegistry {
  _id?: string;
  code_client: string;
  type_client: string;
  raison_sociale: string;
  nom_commercial?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  statut: 'ACTIF' | 'INACTIF' | 'SUSPENDU';
  date_entree?: Date | string;
  // Colonnes issues de l'import "Correspondances_clients_2"
  ncc?: string;
  secteur?: string;
  secteur_activite?: string;
  statut_dgi?: string;
  id_export?: number;
  compte_tiers?: string;
  agent_gestionnaire?: string;
  /** Gestionnaire nominatif du client (module Service Client) — un `Utilisateur` existant. */
  gestionnaire_id?: string | { _id?: string; fullname?: string; mail?: string; phone?: string };
  import_source?: string;
  /** Responsable Finance nominatif du client — indépendant de `gestionnaire_id`/`cesar_user_id`. */
  finance_user_id?: string | { _id?: string; fullname?: string; mail?: string; phone?: string };
  /** Groupe de facturation auquel appartient le client (module Finance), nullable. */
  groupe_facturation_id?: string | { _id?: string; nom?: string; code?: string; statut?: string };
  created_at?: Date;
  updated_at?: Date;
}

export interface VehiculeRegistry {
  _id?: string;
  matricule: string;
  identification?: string;
  marque?: string;
  modele?: string;
  vin?: string;
  annee?: number;
  couleur?: string;
  statut: 'ACTIF' | 'INACTIF' | 'HORS_SERVICE';
  created_at?: Date;
  updated_at?: Date;
}

export interface ClientContactRegistry {
  _id?: string;
  client_id?: string | ClientRegistry;
  civilite?: string;
  nom: string;
  prenom?: string;
  fonction?: string;
  telephone?: string;
  telephone_secondaire?: string;
  email?: string;
  is_principal?: boolean;
  is_active?: boolean;
  observations?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface ClientVehiculeRegistry {
  _id?: string;
  client_id?: string | ClientRegistry;
  vehicle_id?: string | VehiculeRegistry;
  date_debut?: Date | string;
  date_fin?: Date | string;
  actif?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

/** Produit du catalogue rattaché au compte d'un client — indépendant de toute `Installation`
 * physique et de tout `Abonnement`, sert de réservoir dans lequel piocher pour créer des
 * `AbonnementLigneRegistry`. */
export interface ClientProduitRegistry {
  _id?: string;
  client_id?: string | ClientRegistry;
  produit_id?: string | ProduitRegistry;
  vehicule_id?: string | VehiculeRegistry | null;
  reference?: string;
  date_debut?: Date | string;
  actif?: boolean;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface PaiementRegistry {
  _id?: string;
  client_id?: string | ClientRegistry;
  facture_id?: string | FactureRegistry;
  montant: number;
  date_paiement: Date | string;
  mode_paiement?: 'ESPECES' | 'VIREMENT' | 'CHEQUE' | 'MOBILE_MONEY' | 'AUTRE';
  reference?: string;
  commentaire?: string;
  created_at?: Date;
  updated_at?: Date;
}

export type ProduitModeQuantite = 'FIXE' | 'PAR_VEHICULE';

export interface ProduitRegistry {
  _id?: string;
  code: string;
  libelle: string;
  description?: string;
  prix_installation?: number;
  prix_abonnement?: number;
  prix_desinstallation?: number;
  actif: boolean;
  /** FIXE = quantité saisie manuellement sur la ligne d'abonnement ; PAR_VEHICULE = quantité
   * dérivée automatiquement du nombre de véhicules (sous-items) rattachés. */
  mode_quantite?: ProduitModeQuantite;
  created_at?: Date;
  updated_at?: Date;
}

export interface SimCardRegistry {
  _id?: string;
  numero_sim: string;
  type_sim?: string;
  operateur?: string;
  commentaire?: string;
  status: 'DISPONIBLE' | 'INSTALLEE' | 'SUSPENDUE' | 'RETIREE';
  created_at?: Date;
  updated_at?: Date;
}

export interface DeviceRegistry {
  _id?: string;
  device_id: string;
  imei?: string;
  numero_serie?: string;
  protocole?: string;
  type_balise?: string;
  status: 'DISPONIBLE' | 'INSTALLE' | 'DEFAILLANT' | 'RETIRE';
  date_activation?: Date;
  date_desactivation?: Date;
  created_at?: Date;
  updated_at?: Date;
}

// Entrée d'une Liste/Valeur (référentiel admin-configurable : zones, accessoires,
// spécialités techniciens...). Voir `settings/liste-valeur`.
export interface ValeurRegistry {
  _id?: string;
  code: string;
  libelle: string;
  description?: string;
  liste?: string | { _id?: string; code: string; libelle: string };
  locked?: boolean;
}

// Installation = objet métier pur représentant l'état d'un équipement sur un véhicule.
// Distinct d'`InterventionRegistry` (l'opération planifiée/exécutée) — ne pas fusionner.
export interface InstallationRegistry {
  _id?: string;
  client_id?: ClientRegistry;
  vehicle_id?: VehiculeRegistry;
  device_id?: DeviceRegistry;
  sim_id?: SimCardRegistry;
  product_id?: ProduitRegistry;
  date_installation?: Date;
  creneau_horaire?: string;
  heure_debut?: string;
  heure_fin?: string;
  commentaire_installation?: string;
  date_desactivation?: Date;
  date_desinstallation?: Date;
  statut: 'PLANIFIEE' | 'INSTALLEE' | 'ACTIVE' | 'DESACTIVEE' | 'DESINSTALLEE';
  created_at?: Date;
  updated_at?: Date;
}

export interface InterventionAccessoireRegistry {
  valeur?: string | ValeurRegistry;
  actif?: boolean;
  quantite?: number;
}

// Équipement effectivement posé/constaté à l'exécution (compte-rendu terrain, modale
// de détail intervention sur la fiche Mission) — distinct de `InterventionAccessoireRegistry`
// (matériel prévu côté Service Client).
export interface InterventionEquipementExecutionRegistry {
  type: 'GPS' | 'SONDE' | 'SIMCARD' | 'AUTRE';
  device_id?: string | DeviceRegistry;
  sim_id?: string | SimCardRegistry;
  identifiant_saisi?: string;
  actif?: boolean;
}

// Intervention = objet opérationnel planifié ("programmation") puis exécuté par le
// SAV/Dispatcher. Peut, à son exécution, générer/modifier une `InstallationRegistry`
// (lien `installation_id`) — non peuplé par cette passe.
//
// Renommée `Programmation` côté backend (module Service Client) : préparée/planifiée par
// Service Client, consultée en lecture seule par Intervention, exécutée via `Mission`.
// L'interface TS garde son nom d'origine (mêmes champs) — cf. alias `ProgrammationRegistry`
// ci-dessous, utilisé par les pages du nouveau module.
export interface InterventionRegistry {
  _id?: string;
  reference?: string;
  type_intervention: 'INSTALLATION' | 'MAINTENANCE' | 'DESINSTALLATION' | 'AUDIT_VERIFICATION';
  statut: 'A_PROGRAMMER' | 'PROGRAMMEE' | 'AFFECTEE' | 'EN_COURS' | 'EFFECTUEE' | 'PAS_EFFECTUEE' | 'ANNULEE' | 'REPORTEE';

  client_id?: ClientRegistry;
  vehicle_id?: VehiculeRegistry;
  vehicule_immatriculation_saisie?: string;
  vehicule_marque_saisie?: string;
  produit_id?: ProduitRegistry;
  /** Requête client à l'origine de cette programmation (conversion Service Client), optionnel. */
  requete_id?: string | RequeteClientRegistry;

  date_programme: Date | string;
  heure_prevue?: string;
  zone?: string | ValeurRegistry;
  lieu?: string;
  contact_id?: string | ClientContactRegistry;
  gestionnaire_id?: string | { _id?: string; fullname?: string; mail?: string; phone?: string };
  autorisation_dgh?: string;
  observation?: string;
  accessoires?: InterventionAccessoireRegistry[];

  mission_id?: string | MissionRegistry;
  techniciens?: (string | { _id?: string; fullname?: string; mail?: string; phone?: string })[];
  pieces_jointes?: string[];
  installation_id?: string | InstallationRegistry;

  // --- Compte-rendu d'exécution terrain (spec fiche Mission, modale de détail intervention) ---
  intervenants_execution?: (string | { _id?: string; fullname?: string; mail?: string; phone?: string })[];
  equipements_execution?: InterventionEquipementExecutionRegistry[];
  /** Fichiers `Fichier` peuplés côté backend (uuid/nom/relativePath/type). */
  photos_execution?: any[];
  note_execution?: string;
  execution_saisie_par?: string | { _id?: string; fullname?: string };
  execution_saisie_le?: Date;

  // --- Avis client recueilli sur place (page de rapport détaillé de la mission) ---
  avis_client?: {
    satisfaction?: 'TRES_SATISFAIT' | 'SATISFAIT' | 'MOYEN' | 'INSATISFAIT';
    commentaire?: string;
    signataire_nom?: string;
    rempli_le?: Date | string;
  };

  created_at?: Date;
  updated_at?: Date;
}

/** Alias — utilisé par les pages du module Service Client (mêmes champs que `InterventionRegistry`). */
export type ProgrammationRegistry = InterventionRegistry;

// Appartenance d'un utilisateur au module Intervention (rôle + zones/spécialités).
export interface InterventionMembershipRegistry {
  _id?: string;
  utilisateur: string | { _id?: string; fullname?: string; mail?: string; phone?: string };
  role: 'RESPONSABLE' | 'DISPATCHER' | 'TECHNICIEN';
  zones?: (string | ValeurRegistry)[];
  specialites?: (string | ValeurRegistry)[];
  statut: 'ACTIF' | 'INACTIF';
  derniere_position?: { lat?: number; lng?: number; maj_le?: Date };
  invitePar?: string | { _id?: string; fullname?: string };
  dateInvitation?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface MissionMaterielRegistry {
  valeur?: string | ValeurRegistry;
  quantite?: number;
}

export interface MissionRapportRegistry {
  compte_rendu?: string;
  incidents?: string;
  document_ids?: string[];
  redige_par?: string | { _id?: string; fullname?: string };
  redige_le?: Date;
}

// Mission Terrain (spec §14-20) : regroupe plusieurs interventions affectées à une
// équipe de techniciens.
export interface MissionRegistry {
  _id?: string;
  reference?: string;
  date_debut: Date | string;
  date_fin?: Date | string;
  zone?: string | ValeurRegistry;
  ville?: string;
  categorie?: 'INSTALLATION' | 'MAINTENANCE' | 'DESINSTALLATION' | 'AUDIT_VERIFICATION' | 'MIXTE';
  responsable_technique_id?: string | { _id?: string; fullname?: string };
  techniciens?: (string | { _id?: string; fullname?: string; mail?: string; phone?: string })[];
  vehicule_necessaire?: boolean;
  vehicule_id?: string | VehiculeRegistry;
  conducteur_id?: string | { _id?: string; fullname?: string };
  objectif?: string;
  observations?: string;
  statut: 'BROUILLON' | 'PLANIFIEE' | 'EN_COURS' | 'TERMINEE' | 'CLOTUREE' | 'ANNULEE';
  materiel_a_recuperer?: MissionMaterielRegistry[];
  rapport?: MissionRapportRegistry;
  created_at?: Date;
  updated_at?: Date;
}

// Événement d'historisation transverse (statut/zone/affectation) — spec §31.
export interface InterventionAuditRegistry {
  _id?: string;
  entity_type: 'INTERVENTION' | 'MISSION' | 'PROGRAMMATION' | 'REQUETE_CLIENT';
  entity_id: string;
  event_type: string;
  ancienne_valeur?: any;
  nouvelle_valeur?: any;
  user_id?: string | { _id?: string; fullname?: string };
  date?: Date;
  created_at?: Date;
}

// ─── Service Client (module nouveau) — requêtes clients + membership ────────────

export type ServiceClientRole = 'RESPONSABLE' | 'AGENT';

/** Appartenance d'un utilisateur au module Service Client (rôle + zones). */
export interface ServiceClientMembershipRegistry {
  _id?: string;
  utilisateur: string | { _id?: string; fullname?: string; mail?: string; phone?: string };
  role: ServiceClientRole;
  statut: 'ACTIF' | 'INACTIF';
  invitePar?: string | { _id?: string; fullname?: string };
  dateInvitation?: Date;
  created_at?: Date;
  updated_at?: Date;
}

// ─── Finance (module nouveau) — équipe, affectations clients, groupes & profils de facturation ─

export type FinanceRole = 'RESPONSABLE' | 'AGENT';

/** Appartenance d'un utilisateur au module Finance (rôle). */
export interface FinanceMembershipRegistry {
  _id?: string;
  utilisateur: string | { _id?: string; fullname?: string; mail?: string; phone?: string };
  role: FinanceRole;
  statut: 'ACTIF' | 'INACTIF';
  invitePar?: string | { _id?: string; fullname?: string };
  dateInvitation?: Date;
  created_at?: Date;
  updated_at?: Date;
}

/** Groupe de facturation — QUI est regroupé dans une même logique de facturation. Les
 * clients y appartiennent via `ClientRegistry.groupe_facturation_id` (pas de tableau ici). */
export interface GroupeFacturationRegistry {
  _id?: string;
  nom: string;
  code: string;
  description?: string;
  statut: 'ACTIF' | 'INACTIF';
  responsable_finance?: string | { _id?: string; fullname?: string; mail?: string; phone?: string };
  date_debut?: Date | string;
  date_fin?: Date | string | null;
  profil_facturation?: string | ProfilFacturationRegistry;
  created_at?: Date;
  updated_at?: Date;
}

export interface LigneTarifaireRegistry {
  service: string;
  unite: string;
  prix_unitaire: number;
  type_ligne?: 'FIXE' | 'VARIABLE' | 'RECURRENT';
}

export interface AutreTaxeRegistry {
  nom: string;
  taux: number;
}

/** Profil de facturation — COMMENT un `GroupeFacturation` doit être facturé (fréquence,
 * tarification, taxes/remises, conditions de paiement, prorata, renouvellement,
 * pénalités, numérotation, émission). Historisé via `ProfilFacturationHistoriqueRegistry`. */
export interface ProfilFacturationRegistry {
  _id?: string;
  nom: string;
  description?: string;
  est_profil_par_defaut?: boolean;
  statut: 'ACTIF' | 'INACTIF' | 'ARCHIVE';
  devise?: string;

  frequence: 'MENSUELLE' | 'TRIMESTRIELLE' | 'SEMESTRIELLE' | 'ANNUELLE' | 'PERSONNALISEE';
  frequence_personnalisee_jours?: number;
  jour_generation?: number;

  echeance_jours: number;
  modes_paiement: ('ESPECES' | 'VIREMENT' | 'CHEQUE' | 'MOBILE_MONEY' | 'CARTE' | 'PRELEVEMENT' | 'AUTRE')[];
  conditions_paiement_texte?: string;

  lignes_tarifaires: LigneTarifaireRegistry[];

  tva_applicable: boolean;
  taux_tva: number;
  autres_taxes?: AutreTaxeRegistry[];

  remise_activee: boolean;
  remise_type?: 'POURCENTAGE' | 'MONTANT_FIXE';
  remise_valeur?: number;
  remise_conditions?: string;

  prorata_active: boolean;
  prorata_demarrage?: boolean;
  prorata_resiliation?: boolean;
  prorata_changement_tarif?: boolean;
  prorata_methode?: 'JOURS_CALENDAIRES' | 'JOURS_OUVRES' | 'FORFAIT_DEMI_MOIS';

  renouvellement_auto: boolean;
  renouvellement_duree_mois?: number;
  renouvellement_preavis_jours?: number;
  renouvellement_date?: Date | string;
  reconduction_tacite?: boolean;

  penalites_activees: boolean;
  penalites_type?: 'POURCENTAGE' | 'MONTANT_FIXE';
  penalites_valeur?: number;
  penalites_delai_grace_jours?: number;
  penalites_frequence?: 'UNIQUE' | 'PAR_JOUR' | 'PAR_SEMAINE' | 'PAR_MOIS';
  penalites_plafond?: number;

  numerotation_prefixe: string;
  numerotation_numero_depart?: number;
  numerotation_nb_chiffres?: number;
  numerotation_inclure_annee?: boolean;
  numerotation_reinitialisation?: 'JAMAIS' | 'ANNUELLE' | 'MENSUELLE';

  emission_generation_auto: boolean;
  emission_envoi_auto: boolean;
  emission_canal?: 'EMAIL' | 'COURRIER' | 'PORTAIL';
  emission_delai_avant_echeance_jours?: number;

  version?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface ProfilFacturationHistoriqueRegistry {
  _id?: string;
  profil_id: string;
  version: number;
  snapshot: Partial<ProfilFacturationRegistry>;
  modifie_par?: string | { _id?: string; fullname?: string; mail?: string };
  date_modification?: Date;
  resume_modification?: string;
}

/** Requête client (demande entrante) — workflow BROUILLON → ENVOYEE → PRISE_EN_CHARGE → TERMINEE,
 * peut être convertie en `Programmation` (spec Service Client). */
export interface RequeteClientRegistry {
  _id?: string;
  reference?: string;
  client_id?: string | ClientRegistry;
  contact_id?: string | ClientContactRegistry;
  objet?: string;
  type_requete: 'INFORMATION' | 'ASSISTANCE' | 'MODIFICATION' | 'RENDEZ_VOUS' | 'INTERVENTION' | 'ADMINISTRATIVE' | 'DOCUMENT' | 'AUTRE';
  description?: string;
  priorite?: 'BASSE' | 'NORMALE' | 'HAUTE' | 'URGENTE';
  statut: 'BROUILLON' | 'ENVOYEE' | 'PRISE_EN_CHARGE' | 'TERMINEE';
  responsable_id?: string | { _id?: string; fullname?: string; mail?: string };
  programmation_id?: string | InterventionRegistry;
  date_envoi?: Date;
  date_prise_en_charge?: Date;
  date_terminaison?: Date;
  /** Archivage (allège la vue par défaut) — n'est permis que depuis le statut TERMINEE. */
  archive?: boolean;
  date_archivage?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface ContratRegistry {
  _id?: string;
  client_id?: ClientRegistry;
  reference: string;
  date_debut?: Date;
  date_fin?: Date;
  statut: 'ACTIF' | 'SUSPENDU' | 'RESILIE' | 'EXPIRE';
  created_at?: Date;
  updated_at?: Date;
}

export interface ContratLigneRegistry {
  _id?: string;
  contract_id?: ContratRegistry;
  vehicle_id?: VehiculeRegistry;
  product_id?: ProduitRegistry;
  quantite: number;
  prix_unitaire: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface FactureRegistry {
  _id?: string;
  client_id?: string | ClientRegistry;
  client_snapshot?: Record<string, any> | null;
  numero: string;
  date_facture?: Date | string;
  periode_debut?: Date | string;
  periode_fin?: Date | string;
  exercice_id?: string | { _id?: string; code?: string; libelle?: string } | null;
  role_facturation_id?: string | { _id?: string; libelle?: string } | null;
  groupe_facturation_id?: string | { _id?: string; nom?: string } | null;
  profil_facturation_id?: string | { _id?: string; nom?: string } | null;
  profil_snapshot?: Record<string, any> | null;
  montant_ht: number;
  montant_remise?: number;
  montant_taxes?: number;
  montant_ttc: number;
  statut: 'BROUILLON' | 'EN_ATTENTE_PAIEMENT' | 'PARTIELLEMENT_PAYEE' | 'PAYEE' | 'EN_RETARD' | 'ANNULEE';
  date_echeance?: Date | string | null;
  motif_annulation?: string | null;
  annule_par?: string | { _id?: string; fullname?: string; mail?: string } | null;
  date_annulation?: Date | string | null;
  facture_avoir_de_id?: string | null;
  /** Champ virtuel non persisté, calculé côté backend. */
  en_retard?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface FactureLigneRegistry {
  _id?: string;
  invoice_id?: string | FactureRegistry;
  regle_facturation_id?: string | null;
  service?: string;
  designation?: string;
  quantite: number;
  prix_unitaire: number;
  remise_montant?: number;
  taxe_montant?: number;
  total_ht?: number;
  total_ttc?: number;
  // --- Compat résiduelle (ancien moteur de facturation, non utilisés par le nouveau) ---
  vehicle_id?: VehiculeRegistry;
  installation_id?: InstallationRegistry;
  product_id?: ProduitRegistry;
  montant?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface DashboardStats {
  total_clients: number;
  clients_actifs: number;
  clients_inactifs: number;
  total_vehicules: number;
  vehicules_actifs: number;
  vehicules_inactifs: number;
  vehicules_hors_service: number;
  installations_actives: number;
  installations_desinstallee: number;
  installations_planifiees: number;
  produits_actifs: number;
  balises_disponibles: number;
  balises_installees: number;
  sim_disponibles: number;
  sim_installees: number;
  contrats_actifs: number;
  contrats_expires: number;
  contrats_resilies: number;
  factures_brouillon: number;
  factures_emises: number;
  factures_payees: number;
  factures_annulees: number;
  montant_total_ht: number;
  montant_paye: number;
  montant_en_attente: number;
  nouveaux_clients_mois: number;
  nouveaux_vehicules_mois: number;
  installations_mois: number;
  desinstallations_mois: number;
  total_devices: number;
  total_simcards: number;
  contrats_suspendus: number;
  monthlyTrends: MonthlyTrend[];
  topClients: TopClient[];
  topProducts: TopProduct[];
  productDistribution: ProductDistributionItem[];
  vehicleStatusDistribution: { actifs: number; inactifs: number; hors_service: number };
  contractDistribution: { actifs: number; expires: number; resilies: number; suspendus: number };
  invoiceDistribution: { brouillon: number; emises: number; payees: number; annulees: number };
}

export interface ParsedRow {
  idDevice: string;
  matricule: string;
  identification: string;
  emei: string;
  status: string;
  vitesse: string;
  protocole: string;
  balise: string;
  dateInstallation: string;
  commentaireInstallation: string;
  dateDesactivation: string;
  dateDesinstallation: string;
  typeClient: string;
  codeClient: string;
  client: string;
  produit: string;
  acquisition: string;
  specificite: string;
  sim: string;
  typeSim: string;
  commentaireSim: string;
}

export interface ImportBatchResult {
  jobId: string;
  total: number;
  imported: number;
  ignored: number;
  errors: number;
  errorDetails: { row: number; idDevice: string; reason: string }[];
}

export interface ImportStats {
  clients: number;
  vehicules: number;
  produits: number;
  sims: number;
  installations: number;
}

export interface InstallationHistoryRegistry {
  _id?: string;
  installation_id?: InstallationRegistry;
  type_operation: 'INSTALLATION' | 'REINSTALLATION' | 'DESACTIVATION' | 'DESINSTALLATION' | 'REMPLACEMENT_BALISE' | 'REMPLACEMENT_SIM';
  date_operation?: Date;
  commentaire?: string;
  user_id?: any;
  created_at?: Date;
  updated_at?: Date;
}

export interface MonthlyTrend {
  month: string;
  installations: number;
  desinstallations: number;
  newClients: number;
  newVehicules: number;
}

export interface TopClient {
  _id: string;
  totalRevenue: number;
  invoiceCount: number;
  clientName: string;
  clientCode: string;
}

export interface TopProduct {
  _id: string;
  count: number;
  productName: string;
  productCode: string;
}

export interface ProductDistributionItem {
  _id: string;
  count: number;
  name: string;
}

export interface ImportJobProgress {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  importName: string;
  createdBy?: string;
  startedAt: Date;
  updatedAt: Date;
  totalRows: number;
  processedRows: number;
  remainingRows: number;
  percentage: number;
  elapsedMs: number;
  estimatedRemainingMs: number;
  speed: number;
  stats: ImportJobStats;
  errors: ImportJobError[];
  summary?: ImportJobSummary;
}

export interface ImportJobStats {
  clientsCreated: number;
  vehiculesCreated: number;
  produitsCreated: number;
  installationsCreated: number;
  contratsCreated: number;
  facturesCreated: number;
  devicesCreated: number;
  simCardsCreated: number;
}

export interface ImportJobError {
  row: number;
  entity: string;
  type: string;
  message: string;
  level: 'warning' | 'error';
}

export interface ImportJobSummary {
  duration: number;
  totalProcessed: number;
  success: number;
  errors: number;
  ignored: number;
}

