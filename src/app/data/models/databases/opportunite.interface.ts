import { ProspectStatus } from './prospect.interface';

export type Solution = 'PROVISION' | 'PROVISION_PLUS' | 'PORCAM' | 'PROFUEL' | 'PROTEMP';
export type LostReason = 'PRIX' | 'ABSENCE_BUDGET' | 'CHOIX_CONCURRENT' | 'DELAI' | 'BESOIN_ANNULE' | 'ABSENCE_DECISION' | 'SOLUTION_NON_ADAPTEE' | 'PROSPECT_INJOIGNABLE' | 'AUTRE';

export const SOLUTION_LABELS: Record<Solution, string> = {
  PROVISION: 'Provision', PROVISION_PLUS: 'Provision+', PORCAM: 'ProCam', PROFUEL: 'ProFuel', PROTEMP: 'ProTemp',
};

export interface StageHistoryEntry {
  ancien_stage?: string;
  nouveau_stage: string;
  motif?: string;
  date: Date;
}

export interface Opportunite {
  _id?: any;
  numero?: string;
  titre: string;
  prospect_id: string | { _id: string; raison_sociale: string };
  contact_principal_id?: string;
  owner_id?: string;
  solutions?: Solution[];
  montant_estime: number;
  montant_recurrent_estime?: number;
  montant_pondere?: number;
  montant_final?: number;
  duree_mois?: number;
  probabilite?: number;
  date_cloture_prevue: Date;
  date_cloture_reelle?: Date;
  stage: ProspectStatus;
  origine?: string;
  besoins?: string;
  is_deal_majeur?: boolean;
  perte?: { motif?: LostReason; commentaire?: string; concurrent_gagnant?: string };
  suspension?: { motif?: string; date_revue?: Date };
  document_accord_id?: string;
  historique_etapes?: StageHistoryEntry[];
  is_archived?: boolean;
  created_at?: Date;
}
