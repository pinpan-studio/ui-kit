export type DossierStatus = 'PREPARATION' | 'INCOMPLETE' | 'SUBMITTED' | 'REVISION_NEEDED' | 'VALIDATED' | 'SENT_TO_ACCOUNTING' | 'CLOSED';

export const DOSSIER_STATUS_LABELS: Record<DossierStatus, string> = {
  PREPARATION: 'En préparation', INCOMPLETE: 'Incomplet', SUBMITTED: 'Transmis pour validation',
  REVISION_NEEDED: 'Révision nécessaire', VALIDATED: 'Validé', SENT_TO_ACCOUNTING: 'Transmis à la comptabilité', CLOSED: 'Clôturé',
};

export interface PieceChecklistItem {
  present: boolean;
  piece_id?: string;
  numero?: string;
}

export interface DossierClient {
  _id?: any;
  prospect_id: string | { _id: string; raison_sociale: string; numero?: string; owner_id?: string | { _id: string } };
  opportunite_id?: string | { _id: string; titre?: string; montant_estime?: number; stage?: string };
  statut: DossierStatus;
  piece_rccm?: PieceChecklistItem;
  piece_dfe?: PieceChecklistItem;
  piece_compte_contribuable?: PieceChecklistItem;
  piece_contrat_signe?: PieceChecklistItem;
  piece_proforma_acceptee?: PieceChecklistItem;
  taux_completude: number;
  created_at?: Date;
}

export const DOSSIER_CHECKLIST_KEYS: { key: keyof DossierClient; label: string }[] = [
  { key: 'piece_rccm', label: 'RCCM' },
  { key: 'piece_dfe', label: 'DFE' },
  { key: 'piece_compte_contribuable', label: 'Compte contribuable' },
  { key: 'piece_contrat_signe', label: 'Contrat signé' },
  { key: 'piece_proforma_acceptee', label: 'Proforma acceptée' },
];
