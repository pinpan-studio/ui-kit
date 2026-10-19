export type PlatformCode = 'LIBELLULE' | 'FREETRACK';
export type SynchronizationStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'PARTIAL' | 'FAILED';
export type SynchronizationTrigger = 'MANUAL' | 'SCHEDULED' | 'SYSTEM';
export type SynchronizationLogLevel = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

export interface Synchronization {
  _id?: string;
  id?: string;
  platform: PlatformCode;
  status: SynchronizationStatus;
  trigger: SynchronizationTrigger;
  started_at?: string;
  startedAt?: string;
  finished_at?: string;
  finishedAt?: string;
  duration_ms?: number;
  durationMs?: number;
  total_pages?: number;
  totalPages?: number;
  pages_processed?: number;
  pagesProcessed?: number;
  total_devices_fetched?: number;
  totalDevicesFetched?: number;
  created_count?: number;
  createdCount?: number;
  updated_count?: number;
  updatedCount?: number;
  failed_count?: number;
  failedCount?: number;
  error_count?: number;
  errorCount?: number;
  last_successful_page?: number;
  lastSuccessfulPage?: number;
  error_message?: string | null;
  errorMessage?: string | null;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
}

export interface SynchronizationLog {
  _id?: string;
  id?: string;
  synchronization_id?: string;
  synchronizationId?: string;
  platform: string;
  level: SynchronizationLogLevel;
  message: string;
  page?: number;
  processed?: number;
  created?: number;
  updated?: number;
  error?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
  createdAt?: string;
}

export interface SynchronizationStats {
  totalSynchronizations: number;
  byStatus: Record<SynchronizationStatus, number>;
  lastByPlatform: Record<PlatformCode, Synchronization | null>;
  devicesBySource: Record<string, number>;
}

export interface PlatformPublicConfig {
  code: PlatformCode;
  baseUrl: string;
  apiUrl: string;
  language: string;
}
