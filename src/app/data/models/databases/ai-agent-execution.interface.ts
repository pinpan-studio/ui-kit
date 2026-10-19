export type AiAgentExecutionDeclencheur = 'MANUEL_ADMIN' | 'TEST_ADMIN' | 'API_MOBILE' | 'API_PRO' | 'API_WEB' | 'CRON';
export type AiAgentExecutionStatut = 'SUCCES' | 'ERREUR' | 'TIMEOUT' | 'ANNULE';

export interface AiAgentExecutionError {
    message: string;
    stack?: string;
    code?: string;
}

export interface AiAgentExecution {
    _id: any;
    agent: any;
    agentCode: string;
    declencheur: AiAgentExecutionDeclencheur;
    utilisateur?: any;
    contexte?: Record<string, any>;
    donneesAnalysees?: Record<string, any>;
    promptEnvoye?: string;
    reponseBrute?: string;
    resultat?: Record<string, any>;
    score?: number;
    statut: AiAgentExecutionStatut;
    erreurs: AiAgentExecutionError[];
    avertissements: string[];
    dateDebut: Date;
    dateFin?: Date;
    dureeMs?: number;
    modeleUtilise?: string;
    versionAgentUtilisee?: string;
    createdAt?: Date;
}
