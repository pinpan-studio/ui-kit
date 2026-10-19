import { ClientRegistry, GroupeFacturationRegistry, ProfilFacturationRegistry, VehiculeRegistry, ProduitRegistry } from './client-registry.interface';

export type AbonnementStatut = 'ACTIF' | 'SUSPENDU' | 'RESILIE' | 'EXPIRE';
export type AbonnementFrequenceFacturation = 'MENSUELLE' | 'BIMESTRIELLE' | 'TRIMESTRIELLE' | 'SEMESTRIELLE' | 'ANNUELLE' | 'PERSONNALISEE';

/**
 * Abonnement (module Finance) — support réel de la facturation récurrente d'un client
 * (§ `ressources/facturation.md`). Un client peut avoir plusieurs abonnements, chacun lié
 * à un groupe et/ou un profil de facturation. C'est la population utilisée par les
 * `RoleFacturation` en mode `GROUPE`/`PROFIL` (pas `Client.groupe_facturation_id`).
 */
export interface AbonnementRegistry {
  _id?: string;
  client_id: string | ClientRegistry;
  reference?: string;
  groupe_facturation_id?: string | GroupeFacturationRegistry | null;
  profil_facturation_id?: string | ProfilFacturationRegistry | null;
  frequence_facturation?: AbonnementFrequenceFacturation;
  date_debut: Date | string;
  date_fin?: Date | string | null;
  statut: AbonnementStatut;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
}

export type AbonnementLigneType = 'VEHICULE' | 'PRODUIT';
export type AbonnementLigneStatut = 'ACTIF' | 'RETIRE';

/** Véhicule ou produit facturé sur un abonnement, sur sa propre période. */
export interface AbonnementLigneRegistry {
  _id?: string;
  abonnement_id: string | AbonnementRegistry;
  type: AbonnementLigneType;
  vehicule_id?: string | VehiculeRegistry | null;
  produit_id: string | ProduitRegistry;
  service: string;
  quantite: number;
  prix_unitaire_override?: number | null;
  date_debut: Date | string;
  date_fin?: Date | string | null;
  statut: AbonnementLigneStatut;
  motif_retrait?: string | null;
  /** Note libre saisie à l'ajout de la ligne (ex: "installé sur le camion de réserve"). */
  observation?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

/** Une entrée du ledger de traçabilité — une période effectivement facturée pour une ligne. */
export interface AbonnementFacturationTraceRegistry {
  _id?: string;
  abonnement_id: string;
  abonnement_ligne_id: string;
  client_id: string;
  service: string;
  role_facturation_id: string | { _id?: string; libelle?: string };
  facture_id: string | { _id?: string; numero?: string };
  periode_debut: Date | string;
  periode_fin: Date | string;
  quantite: number;
  montant_ht: number;
  created_at?: Date;
}

/** Réponse de `GET finance/abonnements/:id/prochaines-periodes`. */
export interface ProchainePeriodeLigne {
  ligne_id: string;
  service: string;
  statut: AbonnementLigneStatut;
  derniere_periode_facturee_fin: Date | string | null;
  prochaine_periode_debut: Date | string;
}
