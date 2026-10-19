export interface Transit {
  _id?: any;
  prospect_id: string | { _id: string; raison_sociale: string; numero?: string; owner_id?: string | { _id: string } };
  opportunite_id?: string | { _id: string; titre?: string; montant_estime?: number; stage?: string };
  raison_sociale: string;
  montant?: number;
  etape?: string;
  taux_completude?: number;
  statut?: string;
  transmis_par?: string;
  transmis_le?: Date;
}
