import { Utilisateur } from './utilisateur.interface';

// Cycle de vie court du prospect (CDC §27). Le suivi commercial détaillé vit désormais
// sur `ProspectDossier.statut`.
export type ProspectLifecycle = 'PROSPECT' | 'QUALIFICATION' | 'CONVERTI' | 'CLIENT' | 'PERDU';

export const PROSPECT_LIFECYCLE_LABELS: Record<ProspectLifecycle, string> = {
  PROSPECT: 'Prospect',
  QUALIFICATION: 'En qualification',
  CONVERTI: 'Converti',
  CLIENT: 'Client',
  PERDU: 'Perdu',
};

// Pipeline historique à 17 étapes — conservé pour `Opportunite.stage` (chiffrage).
export type ProspectStatus =
  | 'IDENTIFIED' | 'QUALIFIED' | 'CONTACTED' | 'CONTACT_ESTABLISHED'
  | 'APPOINTMENT_SCHEDULED' | 'APPOINTMENT_DONE' | 'NEEDS_CONFIRMED'
  | 'PROPOSAL_SENT' | 'FOLLOW_UP_IN_PROGRESS' | 'PROMISE_OBTAINED'
  | 'IN_NEGOTIATION' | 'AGREEMENT_OBTAINED' | 'DOCUMENTS_RECEIVED'
  | 'FILE_VALIDATED' | 'WON' | 'LOST' | 'ON_HOLD';

export const PROSPECT_STATUS_LABELS: Record<ProspectStatus, string> = {
  IDENTIFIED: 'Identifié',
  QUALIFIED: 'Qualifié',
  CONTACTED: 'Contacté (sans réponse)',
  CONTACT_ESTABLISHED: 'Contact établi',
  APPOINTMENT_SCHEDULED: 'RDV planifié',
  APPOINTMENT_DONE: 'RDV effectué',
  NEEDS_CONFIRMED: 'Besoin confirmé',
  PROPOSAL_SENT: 'Proposition envoyée',
  FOLLOW_UP_IN_PROGRESS: 'Relance en cours',
  PROMISE_OBTAINED: 'Promesse obtenue',
  IN_NEGOTIATION: 'En négociation',
  AGREEMENT_OBTAINED: 'Accord obtenu',
  DOCUMENTS_RECEIVED: 'Documents reçus',
  FILE_VALIDATED: 'Dossier validé',
  WON: 'Gagné',
  LOST: 'Perdu',
  ON_HOLD: 'Suspendu',
};

export interface Prospect {
  _id?: any;
  numero?: string;
  raison_sociale: string;
  email?: string;
  telephone?: string;
  secteur_activite?: string;
  besoin?: string;
  ville?: string;
  commune?: string;
  adresse?: string;
  pays?: string;
  source?: string;
  nom_commercial?: string;
  site_web?: string;
  linkedin?: string;
  effectif?: number;
  contact_nom?: string;
  contact_telephone?: string;
  rccm_numero?: string;
  nif_numero?: string;
  effectif_flotte?: number;
  statut: ProspectLifecycle;
  // Le prospect n'est pas rattaché à un commercial : l'affectation se fait sur le dossier.
  owner_id?: string | Utilisateur;
  forme_juridique?: string;
  nombre_contacts?: number;
  derniere_date_contact?: Date;
  is_archived?: boolean;
  is_delegated?: boolean;
  delegated_to_id?: string | Utilisateur;
  delegated_by_id?: string | Utilisateur;
  delegated_at?: Date;
  client?: { est_client: boolean; statut_client?: string };
  created_at?: Date;
  updated_at?: Date;
}
