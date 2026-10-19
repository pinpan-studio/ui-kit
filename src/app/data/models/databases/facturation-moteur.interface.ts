import { ClientRegistry } from './client-registry.interface';

export type ExerciceComptableStatut = 'BROUILLON' | 'OUVERT' | 'CLOTURE' | 'ARCHIVE';

export interface ExerciceComptableRegistry {
  _id?: string;
  code: string;
  libelle?: string;
  date_debut: Date | string;
  date_fin: Date | string;
  statut: ExerciceComptableStatut;
  responsable?: string | { _id?: string; fullname?: string; mail?: string; phone?: string } | null;
  date_cloture?: Date | string | null;
  created_at?: Date;
  updated_at?: Date;
}

export type RoleFacturationStatut =
  | 'BROUILLON' | 'PLANIFIE' | 'EN_PREPARATION' | 'EN_CALCUL' | 'A_VALIDER'
  | 'VALIDE' | 'EN_FACTURATION' | 'FACTURE' | 'CLOTURE' | 'ANNULE';

export type RoleFacturationModePopulation = 'GROUPE' | 'PROFIL' | 'MANUEL';

export interface RoleFacturationRegistry {
  _id?: string;
  exercice_id: string | { _id?: string; code?: string; libelle?: string };
  code?: string;
  libelle: string;
  description?: string;
  date_debut: Date | string;
  date_fin: Date | string;
  statut: RoleFacturationStatut;
  responsable?: string | { _id?: string; fullname?: string; mail?: string; phone?: string } | null;
  mode_population: RoleFacturationModePopulation;
  groupe_facturation_id?: string | { _id?: string; nom?: string } | null;
  profil_facturation_id?: string | { _id?: string; nom?: string } | null;
  clients_inclus_manuellement?: (string | ClientRegistry)[];
  clients_exclus_manuellement?: (string | ClientRegistry)[];
  population_count?: number;
  motif_annulation?: string | null;
  annule_par?: string | { _id?: string; fullname?: string } | null;
  date_annulation?: Date | string | null;
  created_at?: Date;
  updated_at?: Date;
}

export type RegleFacturationQuantiteMode = 'FIXE' | 'PAR_VEHICULE_ACTIF' | 'MANUEL' | 'PAR_ABONNEMENT';
export type RegleFacturationRemiseType = 'POURCENTAGE' | 'MONTANT_FIXE';

export interface RegleFacturationRegistry {
  _id?: string;
  role_facturation_id?: string;
  libelle: string;
  service: string;
  unite?: string;
  quantite_mode: RegleFacturationQuantiteMode;
  quantite_fixe?: number;
  prix_unitaire: number;
  periode_debut: Date | string;
  periode_fin: Date | string;
  remise_type?: RegleFacturationRemiseType;
  remise_valeur?: number;
  taxe_applicable?: boolean;
  taux_taxe_override?: number;
  montant_minimum?: number;
  montant_maximum?: number;
  conditions?: string;
  ordre?: number;
  created_at?: Date;
  updated_at?: Date;
}

export const ANOMALIE_LABELS: Record<string, string> = {
  SANS_TARIF: 'Sans tarif applicable',
  PROFIL_INACTIF: 'Profil de facturation inactif',
  GROUPE_VIDE: 'Groupe de facturation vide',
  PERIODE_INCOHERENTE: 'Période incohérente',
  DOUBLON_FACTURATION: 'Doublon de facturation',
  DONNEES_MANQUANTES: 'Données manquantes',
};

export interface RoleFacturationLigneCalculRegistry {
  _id?: string;
  role_facturation_id: string;
  client_id: string | ClientRegistry;
  regle_facturation_id: string | RegleFacturationRegistry;
  service?: string;
  quantite: number;
  quantite_override?: number | null;
  prix_unitaire: number;
  sous_total?: number;
  remise_montant?: number;
  taxe_montant?: number;
  total_ht: number;
  total_ttc: number;
  facturable: boolean;
  anomalies: string[];
  ignorer_doublon: boolean;
  date_calcul?: Date | string;
}

export interface RolePrevisualisationClient {
  client: ClientRegistry | { _id?: string; raison_sociale?: string; nom_commercial?: string; code_client?: string };
  lignes: RoleFacturationLigneCalculRegistry[];
  montant_ht: number;
  montant_ttc: number;
  nb_anomalies: number;
}

export interface RolePrevisualisation {
  nb_clients: number;
  nb_lignes: number;
  nb_facturables: number;
  nb_anomalies: number;
  montant_ht: number;
  montant_remise: number;
  montant_taxes: number;
  montant_ttc: number;
  clients: RolePrevisualisationClient[];
}

export interface RoleFacturationHistoriqueRegistry {
  _id?: string;
  role_facturation_id?: string;
  action: string;
  utilisateur?: { _id?: string; fullname?: string; mail?: string } | string;
  date: Date | string;
  detail?: string | Record<string, any>;
}

export interface FactureDashboardStatutBucket {
  statut: string;
  nombre: number;
  montant_ttc: number;
}

export interface FactureDashboardStats {
  par_statut: FactureDashboardStatutBucket[];
  nombre_factures: number;
  montant_ht: number;
  montant_taxes: number;
  montant_ttc: number;
  montant_impaye: number;
  nombre_clients_factures: number;
}
