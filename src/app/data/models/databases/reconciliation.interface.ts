export type ReconciliationStatus = 'PENDING' | 'MATCHED' | 'PROCESSED' | 'ERROR' | 'SKIPPED';
export type ReconciliationMatchMethod = 'AUTO_EXACT' | 'AUTO_FUZZY' | 'MANUAL';

export interface ReconciliationStatusCounts {
  pending: number;
  matched: number;
  processed: number;
  error: number;
  skipped: number;
}

export interface MatchCandidate {
  clientId: string;
  clientName: string;
  codeClient?: string;
  score: number;
}

export interface OwnerSuggestion {
  clientId: string;
  clientName: string;
  codeClient?: string;
  score: number;
  method: ReconciliationMatchMethod;
  confident: boolean;
}

export interface OwnerMatchRow {
  ownerName: string;
  deviceCount: number;
  statusCounts: ReconciliationStatusCounts;
  sources: string[];
  resolved: boolean;
  currentClient: { id: string; name: string } | null;
  suggestion: OwnerSuggestion | null;
  candidates: MatchCandidate[];
  /** Rempli lors du regroupement côté front, transmis à l'endpoint de suggestions. */
  sampleCodeClient?: string | null;
}

/** Device brut projeté renvoyé par `owners/raw` — regroupement fait côté front. */
export interface OwnerRawDevice {
  owner: string;
  status: string;
  clientId: string | null;
  source: string | null;
  codeClient: string | null;
}

export interface OwnersRawResponse {
  devices: OwnerRawDevice[];
  clients: { id: string; name: string }[];
}

export interface OwnerSuggestionResult {
  suggestion: OwnerSuggestion | null;
  candidates: MatchCandidate[];
}

export interface ReconciliationCreated {
  client_id?: string;
  client_created?: boolean;
  vehicule_id?: string;
  vehicule_created?: boolean;
  device_id?: string;
  device_created?: boolean;
  sim_id?: string;
  sim_created?: boolean;
  produit_id?: string;
  produit_created?: boolean;
  installation_id?: string;
  installation_created?: boolean;
  history_ids?: string[];
}

export interface ReconciliationHistoryEntry {
  at: string | Date;
  action: string;
  from_client_id?: string | null;
  to_client_id?: string | null;
  note?: string;
  by?: string;
}

export interface ReconciliationState {
  status: ReconciliationStatus;
  match_score?: number;
  match_method?: ReconciliationMatchMethod;
  matched_owner_name?: string;
  matched_at?: string | Date;
  matched_by?: string;
  processed_at?: string | Date;
  processed_by?: string;
  run_id?: string;
  error?: { message: string; at: string | Date } | null;
  created?: ReconciliationCreated;
  history?: ReconciliationHistoryEntry[];
}

export interface ReconciliationDeviceRow {
  _id: string;
  source: string;
  external_id: number;
  name: string;
  imei?: string;
  matricule?: string;
  plate_number?: string;
  object_owner?: string;
  client?: string;
  produit?: string;
  sim?: string;
  date_installation?: string;
  date_desinstallation?: string;
  active: boolean;
  client_id?: string | null;
  client_name?: string | null;
  reconciliation?: ReconciliationState;
  last_synced_at?: string | Date;
}

export interface ReconciliationDeviceListResponse {
  total: number;
  page: number;
  nbPage: number;
  items: ReconciliationDeviceRow[];
}

export interface ReconciliationRun {
  _id: string;
  scope: 'all' | 'owner' | 'devices';
  owner_name?: string;
  device_ids?: string[];
  status: 'running' | 'completed' | 'failed';
  force?: boolean;
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  created_counts?: Record<string, number>;
  error_details?: { platform_device_id: string; external_id: number; source: string; message: string }[];
  triggered_by?: string;
  started_at?: string | Date;
  finished_at?: string | Date;
  created_at?: string | Date;
}

/** État live d'un traitement de matérialisation, alimenté par `reconciliation.progress`.
 *  Partagé entre la page rapprochement (signal) et la fenêtre de suivi réductible. */
export interface ActiveReconciliationRun {
  runId: string;
  status: 'running' | 'completed' | 'failed';
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  currentDeviceName?: string;
  recentErrors?: { name: string; message: string }[];
  createdCounts?: Record<string, number>;
  startedAt?: string;
  etaSeconds?: number;
}

export interface ReconciliationDashboard {
  totalDevices: number;
  statusCounts: Record<ReconciliationStatus, number>;
  progressPct: number;
  owners: {
    total: number;
    fullyProcessed: number;
    untouched: number;
    inProgress: number;
  };
  entitiesCreated: {
    clients: number;
    vehicules: number;
    devices: number;
    sims: number;
    produits: number;
    installations: number;
  };
  ownersProgress: { ownerName: string; total: number; processed: number }[];
  lastProcessedAt: string | Date | null;
  recentRuns: ReconciliationRun[];
}

export interface ClientLiteResult {
  _id: string;
  raison_sociale?: string;
  nom_commercial?: string;
  code_client?: string;
  type_client?: string;
  statut?: string;
}
