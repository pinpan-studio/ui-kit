/** Modèle de contrat administrable (Paramètres ASSAC → Configuration des entrées). */
export interface ContratModele {
  _id?: any;
  nom: string;
  fichier_url: string;
  fichier_nom?: string;
  type_mime?: string;
  taille?: number;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export type ContratStatut =
  | 'A_TELECHARGER'
  | 'TELECHARGE'
  | 'A_COMPLETER'
  | 'SIGNE'
  | 'TRANSMIS'
  | 'CONFORME'
  | 'NON_CONFORME';

export const CONTRAT_STATUT_LABELS: Record<ContratStatut, string> = {
  A_TELECHARGER: 'À télécharger',
  TELECHARGE: 'Téléchargé',
  A_COMPLETER: 'À compléter',
  SIGNE: 'Signé',
  TRANSMIS: 'Transmis',
  CONFORME: 'Conforme',
  NON_CONFORME: 'Non conforme',
};

/** Couleur (nom app-status-badge) par statut de contrat. */
export const CONTRAT_STATUT_BADGE: Record<ContratStatut, string> = {
  A_TELECHARGER: 'neutral',
  TELECHARGE: 'info',
  A_COMPLETER: 'warning',
  SIGNE: 'info',
  TRANSMIS: 'info',
  CONFORME: 'success',
  NON_CONFORME: 'error',
};
