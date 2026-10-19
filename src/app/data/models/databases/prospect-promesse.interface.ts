import { Utilisateur } from './utilisateur.interface';
import { Contact } from './contact.interface';

export type PromesseOrigine = 'NOTRE_PROMESSE' | 'PROMESSE_PROSPECT';

export const PROMESSE_ORIGINE_LABELS: Record<PromesseOrigine, string> = {
  NOTRE_PROMESSE: 'Notre engagement',
  PROMESSE_PROSPECT: 'Engagement du prospect',
};

export type PromesseStatut = 'A_FAIRE' | 'EN_COURS' | 'RESPECTEE' | 'NON_RESPECTEE' | 'ANNULEE';

export const PROMESSE_STATUT_LABELS: Record<PromesseStatut, string> = {
  A_FAIRE: 'À faire',
  EN_COURS: 'En cours',
  RESPECTEE: 'Respectée',
  NON_RESPECTEE: 'Non respectée',
  ANNULEE: 'Annulée',
};

export const PROMESSE_STATUTS_OUVERTS: PromesseStatut[] = ['A_FAIRE', 'EN_COURS'];

export interface ProspectPromesse {
  _id?: any;
  dossier_id: string;
  prospect_id?: string;
  description: string;
  origine: PromesseOrigine;
  responsable_id?: string | Utilisateur;
  contact_id?: string | Contact;
  echeance?: Date;
  statut: PromesseStatut;
  date_realisation?: Date;
  commentaire?: string;
  author_id?: string | Utilisateur;
  created_at?: Date;
  updated_at?: Date;
}
