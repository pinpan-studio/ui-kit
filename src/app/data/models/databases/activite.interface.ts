export type ActivityType =
  | 'APPEL' | 'COURRIEL' | 'MESSAGE' | 'WHATSAPP' | 'SMS' | 'LINKEDIN' | 'REUNION'
  | 'VISITE' | 'DEMONSTRATION' | 'REUNION_INTERNE' | 'RELANCE' | 'DEPOT_PROPOSITION'
  | 'COLLECTE_DOCUMENTS' | 'AUTRE';
export type ActivityStatus = 'PLANIFIEE' | 'REALISEE' | 'ANNULEE' | 'REPORTEE' | 'NON_REALISEE';

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  APPEL: 'Appel', COURRIEL: 'Email', MESSAGE: 'Message', WHATSAPP: 'WhatsApp', SMS: 'SMS',
  LINKEDIN: 'LinkedIn', REUNION: 'Réunion', VISITE: 'Visite', DEMONSTRATION: 'Démonstration',
  REUNION_INTERNE: 'Réunion interne', RELANCE: 'Relance', DEPOT_PROPOSITION: 'Dépôt de proposition',
  COLLECTE_DOCUMENTS: 'Collecte de documents', AUTRE: 'Autre',
};

export const ACTIVITY_TYPE_ICONS: Record<ActivityType, string> = {
  APPEL: 'call', COURRIEL: 'mail', MESSAGE: 'sms', WHATSAPP: 'chat', SMS: 'textsms',
  LINKEDIN: 'group', REUNION: 'groups', VISITE: 'place', DEMONSTRATION: 'slideshow',
  REUNION_INTERNE: 'meeting_room', RELANCE: 'notifications_active', DEPOT_PROPOSITION: 'description',
  COLLECTE_DOCUMENTS: 'folder_open', AUTRE: 'more_horiz',
};

export interface Activite {
  _id?: any;
  prospect_id: string;
  dossier_id?: string;
  contact_id?: string;
  author_id?: string;
  type: ActivityType;
  statut?: ActivityStatus;
  date?: Date;
  duree?: number;
  sujet?: string;
  moyen?: string;
  notes?: string;
  resultat?: string;
  prochaine_action?: string;
  prochaine_action_date?: Date;
  a_obtenu_reponse?: boolean;
  created_at?: Date;
}
