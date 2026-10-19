export type QuoteStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED' | 'REPLACED';

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  DRAFT: 'Brouillon', PENDING_APPROVAL: 'En attente d\'approbation', APPROVED: 'Approuvée',
  SENT: 'Transmise', ACCEPTED: 'Acceptée', REJECTED: 'Rejetée', EXPIRED: 'Expirée',
  CANCELLED: 'Annulée', REPLACED: 'Remplacée',
};

export interface ProformaLigne {
  designation: string;
  description?: string;
  quantite: number;
  mois: number;
  prix_unitaire: number;
  montant?: number;
  is_recurrent?: boolean;
}

export interface Proforma {
  _id?: any;
  numero?: string;
  source?: 'GENERATED' | 'IMPORTED';
  opportunite_id?: string | { _id: string; titre: string };
  dossier_id?: string | { _id: string; numero?: string };
  prospect_id?: string | { _id: string; raison_sociale: string };
  owner_id?: string;
  facturation?: { nom: string; telephone?: string; whatsapp?: string; adresse?: string; rccm_numero?: string; nif_numero?: string };
  commercial?: { nom: string; telephone?: string };
  objet: string;
  date_emission?: Date;
  date_echeance: Date;
  devise?: string;
  conditions_paiement?: string;
  observations?: string;
  lignes: ProformaLigne[];
  sous_total_ht?: number;
  net_ht?: number;
  montant_taxe?: number;
  total_ttc?: number;
  taux_taxe?: number;
  remise_percent?: number;
  montant_en_lettres?: string;
  montant_recurrent_mensuel?: number;
  statut: QuoteStatus;
  version?: number;
  motif_rejet?: string;
  motif_annulation?: string;
  accepte_le?: Date;
  envoye_le?: Date;
  preuve_acceptation?: string;
  previous_version_id?: string;
  replaced_by_id?: string;
  created_at?: Date;
}
