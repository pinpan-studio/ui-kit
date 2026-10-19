export type RendezVousStatut = 'PLANIFIE' | 'CONFIRME' | 'REALISE' | 'ANNULE' | 'REPORTE';

export const RENDEZ_VOUS_STATUT_LABELS: Record<RendezVousStatut, string> = {
  PLANIFIE: 'Planifié', CONFIRME: 'Confirmé', REALISE: 'Réalisé', ANNULE: 'Annulé', REPORTE: 'Reporté',
};

// Fiche de rapport de prospection commerciale (modèle SUD CONTRACTORS).
// Les champs sont pré-remplis depuis le dossier / le prospect puis éditables.
export interface RapportProspection {
  date_rencontre?: string;
  lieu?: string;
  commercial?: string;
  entreprise?: string;
  domaine_activite?: string;
  personne_ressource?: string;
  fonction?: string;
  contact?: string;
  email?: string;
  corps?: string;
  fait_a?: string;
  redige_par?: string;
  maj_le?: string;
}

export interface CompteRendu {
  note?: string;
  besoins?: string;
  objections?: string;
  concurrents?: string;
  decideur?: string;
  budget?: number;
  delai?: string;
  prochaines_actions?: string;
  document_ids?: string[];
  redige_le?: Date;
  rapport?: RapportProspection;
}

export interface RendezVous {
  _id?: any;
  prospect_id: string | { _id: string; raison_sociale: string };
  dossier_id?: string;
  contact_id?: string;
  organizer_id?: string;
  titre?: string;
  date: Date;
  duree?: number;
  lieu?: string;
  lien_visio?: string;
  participants?: string[];
  objectif?: string;
  description?: string;
  statut?: RendezVousStatut;
  is_complete?: boolean;
  motif_annulation?: string;
  compte_rendu?: CompteRendu;
}
