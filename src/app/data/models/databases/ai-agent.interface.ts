export type AiAgentStatus = 'ACTIF' | 'DESACTIVE' | 'MAINTENANCE' | 'ERREUR';
export type AiAgentStrategieReponse = 'STRICT' | 'TOLERANT' | 'HYBRIDE';

export interface AiAgentStatusHistoryEntry {
    statut: AiAgentStatus;
    previousStatut?: AiAgentStatus;
    date: Date;
    motif?: string;
    utilisateur?: any;
}

export interface RegleMetier {
    code: string;
    libelle?: string;
    description?: string;
    actif: boolean;
    valeur?: any;
}

export interface AiAgentSchedule {
    active: boolean;
    cronExpression?: string;
    description?: string;
}

export interface AiAgent {
    _id: any;
    code: string;
    nom: string;
    description?: string;
    version: string;
    icone?: string;
    statut: AiAgentStatus;
    statutHistory: AiAgentStatusHistoryEntry[];

    modele: string;
    promptSysteme: string;
    temperature: number;
    topP: number;
    topK: number;
    maxOutputTokens: number;
    timeoutMs: number;
    seuilConfianceMin: number;
    strategieReponse: AiAgentStrategieReponse;
    reglesMetier: RegleMetier[];

    journalisationActive: boolean;
    frequenceExecution: AiAgentSchedule;
    parametresAvances: Record<string, any>;
    actif: boolean;

    derniereExecutionAt?: Date;
    nbExecutionsTotal: number;
    nbExecutionsSucces: number;
    nbExecutionsErreur: number;
    tempsReponseMoyenMs: number;

    createdAt?: Date;
    updatedAt?: Date;
}
