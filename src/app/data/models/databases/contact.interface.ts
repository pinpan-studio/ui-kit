import { Prospect } from './prospect.interface';

export type DecisionRole = 'DECIDEUR' | 'UTILISATEUR' | 'PRESCRIPTEUR' | 'ACHETEUR' | 'FINANCE' | 'TECHNIQUE' | 'SIGNATAIRE' | 'INTERMEDIAIRE';

export type ContactGenre = 'HOMME' | 'FEMME' | 'AUTRE';

export const CONTACT_GENRE_LABELS: Record<ContactGenre, string> = {
  HOMME: 'Homme',
  FEMME: 'Femme',
  AUTRE: 'Autre',
};

export const DECISION_ROLE_LABELS: Record<DecisionRole, string> = {
  DECIDEUR: 'Décideur',
  UTILISATEUR: 'Utilisateur',
  PRESCRIPTEUR: 'Prescripteur',
  ACHETEUR: 'Acheteur',
  FINANCE: 'Finance',
  TECHNIQUE: 'Technique',
  SIGNATAIRE: 'Signataire',
  INTERMEDIAIRE: 'Intermédiaire',
};

export interface Contact {
  _id?: any;
  prospect_id: string | Prospect;
  owner_id?: string;
  civilite?: string;
  nom: string;
  /** Facultatif — seul le nom est obligatoire. */
  prenom?: string;
  /** Genre (sélection unique). */
  genre?: ContactGenre;
  /** Précision libre, seulement si genre = AUTRE. */
  genre_precision?: string;
  fonction?: string;
  service?: string;
  telephone: string;
  telephone_secondaire?: string;
  email: string;
  linkedin?: string;
  canal_prefere?: string;
  niveau_influence?: string;
  disponibilite?: string;
  observations?: string;
  roles_decision?: DecisionRole[];
  /** Carte de visite liée à l'interlocuteur (fichier FileManager). */
  carte_visite_url?: string;
  carte_visite_nom?: string;
  is_active?: boolean;
  created_at?: Date;
}
