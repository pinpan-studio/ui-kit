import { Utilisateur } from './utilisateur.interface';
import { Prospect } from './prospect.interface';
import { Opportunite } from './opportunite.interface';

export type ProspectDossierStatut = 'OUVERT' | 'SUSPENDU' | 'FERME' | 'TRANSMIS_COMPTABILITE';

export const DOSSIER_STATUT_LABELS: Record<ProspectDossierStatut, string> = {
  OUVERT: 'Ouvert',
  SUSPENDU: 'Suspendu',
  FERME: 'Fermé',
  TRANSMIS_COMPTABILITE: 'Transmis comptabilité',
};

export type DossierPriorite = 'BASSE' | 'NORMALE' | 'HAUTE' | 'URGENTE';

export const DOSSIER_PRIORITE_LABELS: Record<DossierPriorite, string> = {
  BASSE: 'Basse', NORMALE: 'Normale', HAUTE: 'Haute', URGENTE: 'Urgente',
};

/**
 * Correspondance **unique** Priorité → couleur, réutilisée dans toutes les vues où un
 * dossier est affiché (liste, cartes, dashboard, agenda, fiche). Ne pas dupliquer cette
 * table ailleurs.
 *  - `className` : classe SCSS (`.priorite-badge` / `.priorite-dot-only` dans
 *    `_assac-shared.scss`) qui porte les tokens de couleur.
 *  - `badge`     : nom de couleur pour `<app-status-badge [color]>`.
 * Échelle intuitive et contrastée : vert (basse) → gris discret (normale) →
 * ambre (haute) → rouge (urgente).
 */
export const DOSSIER_PRIORITE_COLORS: Record<DossierPriorite, { className: string; badge: string; label: string }> = {
  BASSE:   { className: 'priorite-basse',   badge: 'success', label: 'Basse' },
  NORMALE: { className: 'priorite-normale', badge: 'neutral', label: 'Normale' },
  HAUTE:   { className: 'priorite-haute',   badge: 'warning', label: 'Haute' },
  URGENTE: { className: 'priorite-urgente', badge: 'error',   label: 'Urgente' },
};

export function dossierPrioriteColor(p?: DossierPriorite | string | null) {
  return DOSSIER_PRIORITE_COLORS[(p as DossierPriorite)] ?? DOSSIER_PRIORITE_COLORS.NORMALE;
}

export interface DossierStatutHistoryEntry {
  ancien_statut?: string;
  nouveau_statut: string;
  commentaire?: string;
  modifie_par?: string | Utilisateur;
  date: Date;
}

export interface ProspectDossier {
  _id?: any;
  numero?: string;
  prospect_id: string | Prospect;
  responsable_id: string | Utilisateur;
  libelle?: string;
  objet?: string;
  statut: ProspectDossierStatut;
  priorite?: DossierPriorite;
  notes?: string;
  opportunite_id?: string | Opportunite;
  derniere_activite_date?: Date;
  prochaine_action?: string;
  prochaine_action_date?: Date;
  nombre_echanges?: number;
  nombre_rendez_vous?: number;
  nombre_promesses_ouvertes?: number;
  nombre_proformas?: number;
  nombre_documents?: number;
  date_cloture?: Date;
  motif_cloture?: string;
  historique_statuts?: DossierStatutHistoryEntry[];
  is_archived?: boolean;
  partage_client?: {
    actif: boolean;
    token?: string;
    document_types?: string[];
    active_le?: Date;
    contrat_modele_id?: any;
    contrat?: {
      statut?: string;
      telecharge_le?: Date;
      signe_url?: string;
      signe_nom?: string;
      signe_le?: Date;
      transmis_le?: Date;
      conforme?: boolean;
    };
    transmission?: { transmis_le?: Date; categories?: string[] };
  };
  created_at?: Date;
  updated_at?: Date;
}

// Réponse de `GET crm/dossiers/:id/timeline`
export interface DossierTimelineEvent {
  date: Date;
  kind: 'ECHANGE' | 'RENDEZ_VOUS' | 'PROMESSE' | 'PROMESSE_RESOLUE' | 'PROFORMA' | 'PROFORMA_ENVOYEE' | 'PROFORMA_ACCEPTEE' | 'STATUT' | 'CREATION';
  label: string;
  ref: any;
}

// Conformité documentaire d'un dossier : documents demandés au client
// (`partage_client.document_types`) vs pièces réellement déposées.
export interface DossierConformite {
  demandes: string[];
  fournis: string[];
  manquants: string[];
  details: { type: string; fourni: boolean }[];
  total_demandes: number;
  total_fournis: number;
  taux: number;
  complet: boolean;
  contrat?: {
    attendu: boolean;
    fourni: boolean;
    statut: string | null;
    conforme: boolean | null;
    signe_url: string | null;
    signe_nom?: string | null;
    modele?: { _id: any; nom: string; fichier_url: string; fichier_nom?: string } | null;
  };
  transmission?: { transmis_le?: Date; categories?: string[] } | null;
}

// Réponse de `GET crm/dossiers/:id/apercu`
export interface DossierApercu {
  dossier: ProspectDossier;
  statut: ProspectDossierStatut;
  responsable_id: string | Utilisateur;
  derniere_activite_date?: Date;
  prochaine_action?: string;
  prochaine_action_date?: Date;
  nombre_echanges: number;
  nombre_rendez_vous: number;
  nombre_promesses_ouvertes: number;
  nombre_proformas: number;
  nombre_documents: number;
  promesses_en_retard: number;
  conformite?: DossierConformite;
}

// Réponse de `GET crm/dossiers/transmission-comptable`
export interface DossierTransmissionComptable {
  dossier: ProspectDossier;
  conformite: DossierConformite;
}
