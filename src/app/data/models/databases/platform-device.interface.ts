import { PlatformCode } from './synchronization.interface';
import { ReconciliationState } from './reconciliation.interface';

export interface PlatformDevice {
  _id: string;
  source: PlatformCode | string;
  external_id: number;
  active: boolean;
  kind?: number;
  name: string;
  imei?: string;
  device_type_id?: number;
  fuel_type?: string;
  fuel_emissions?: number;
  fuel_quantity?: string;
  fuel_measurement_id?: number;
  sim_number?: string;
  device_model?: string;
  plate_number?: string;
  vin?: string;
  registration_number?: string;
  object_owner?: string;
  additional_notes?: string;
  protocol?: string;
  expiration_date?: string;

  /**
   * Colonnes dérivées de name/object_owner/registration_number/sim_number/additional_notes
   * lors de la synchronisation (voir backend platform-device-enrichment.util.ts) — mêmes
   * règles que l'import Excel client.
   */
  matricule?: string;
  date_installation?: string;
  commentaire_installation?: string;
  date_desactivation?: string;
  date_desinstallation?: string;
  type_client?: string;
  code_client?: string;
  client?: string;
  produit?: string;
  acquisition?: string;
  specificite?: string;
  sim?: string;
  type_sim?: string;
  commentaire_sim?: string;

  client_id?: string | null;
  client_name?: string | null;

  /** État du rapprochement PlatformDevice → Client (module reconciliation/). */
  reconciliation?: ReconciliationState;

  seen_in_last_sync: boolean;
  first_synced_at: string | Date;
  last_synced_at: string | Date;
  created_at?: string | Date;
  updated_at?: string | Date;
}

export interface ListPlatformDevicesResponse {
  total: number;
  page: number;
  nbPage: number;
  items: PlatformDevice[];
}
