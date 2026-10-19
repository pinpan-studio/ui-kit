import {Commande} from './commande.interface';
import {Professionnel} from './professionnel.interface';
import {Utilisateur} from './utilisateur.interface';

/** Miroir de `backend/src/modules/database/evaluation/evaluation.schema.ts` (EvaluatorType). */
export type EvaluatorType = 'CLIENT' | 'PROFESSIONNEL';

/** Critères notés par le client à propos du technicien (evaluatorType = CLIENT). */
export interface ClientToProCriteria {
    ponctualite?: number;
    qualiteTravail?: number;
    professionnalisme?: number;
    communication?: number;
    respectDevis?: number;
    rapidite?: number;
    proprete?: number;
    courtoisie?: number;
    satisfactionGenerale?: number;
}

/** Critères notés par le technicien à propos du client (evaluatorType = PROFESSIONNEL). */
export interface ProToClientCriteria {
    respectHoraires?: number;
    disponibilite?: number;
    qualiteAccueil?: number;
    clarteExplications?: number;
    accessibiliteLieu?: number;
    respectEngagements?: number;
    faciliteCommunication?: number;
    securiteSite?: number;
    cooperationIntervention?: number;
    paiement?: number;
    satisfactionGlobale?: number;
}

export interface Evaluation {
    _id: any;
    commande: Commande;
    client: Utilisateur;
    professionnel: Professionnel;
    evaluatorType: EvaluatorType;

    /** Note globale (1-5), calculée côté serveur comme la moyenne des critères du sens applicable. */
    note: number;

    criteriaClientToPro?: ClientToProCriteria;
    criteriaProToClient?: ProToClientCriteria;

    commentaire?: string;

    // Champs propres à l'évaluation du technicien par le client (CLIENT -> PROFESSIONNEL).
    recommendations?: string;
    reportedIssue?: boolean;
    reportedIssueDescription?: string;

    // Champs propres à l'évaluation du client par le technicien (PROFESSIONNEL -> CLIENT).
    positivePoints?: string;
    difficultiesEncountered?: string;
    wouldRecommend?: boolean;

    createdAt?: Date | string;
    updatedAt?: Date | string;
}
