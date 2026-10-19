export type DocumentCategory =
  | 'RCCM' | 'DFE' | 'COMPTE_CONTRIBUABLE' | 'ID_SIGNATAIRE' | 'CONTRAT' | 'AVENANT'
  | 'BON_COMMANDE' | 'PROFORMA_SIGNEE' | 'ATTESTATION' | 'PV_INSTALLATION' | 'PHOTO'
  | 'DOC_TECHNIQUE' | 'COURRIER' | 'CAHIER_DES_CHARGES' | 'PRESENTATION'
  | 'DOCUMENT_ENTREPRISE' | 'DOCUMENT_ENVOYE' | 'DOCUMENT_RECU' | 'AUTRE';

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  RCCM: 'RCCM', DFE: 'DFE / DEE', COMPTE_CONTRIBUABLE: 'Compte contribuable', ID_SIGNATAIRE: 'Pièce du signataire',
  CONTRAT: 'Contrat', AVENANT: 'Avenant', BON_COMMANDE: 'Bon de commande', PROFORMA_SIGNEE: 'Proforma signée',
  ATTESTATION: 'Attestation', PV_INSTALLATION: "PV d'installation", PHOTO: 'Photo', DOC_TECHNIQUE: 'Document technique',
  COURRIER: 'Courrier', CAHIER_DES_CHARGES: 'Cahier des charges', PRESENTATION: 'Présentation',
  DOCUMENT_ENTREPRISE: 'Document entreprise', DOCUMENT_ENVOYE: 'Document envoyé', DOCUMENT_RECU: 'Document reçu',
  AUTRE: 'Autre',
};

export type DocumentVerificationStatus = 'PENDING' | 'VALIDATED' | 'REJECTED';
export type DocumentOwnerModel = 'PROSPECT' | 'OPPORTUNITY' | 'DOSSIER';

export interface PieceJustificative {
  _id?: any;
  nom: string;
  categorie: DocumentCategory;
  date_document?: Date;
  date_expiration?: Date;
  statut?: DocumentVerificationStatus;
  motif_rejet?: string;
  commentaire?: string;
  owner_id: string;
  owner_model: DocumentOwnerModel;
  url_fichier: string;
  type_mime?: string;
  taille?: number;
  uploaded_by?: any;
  version?: number;
  created_at?: Date;
}
