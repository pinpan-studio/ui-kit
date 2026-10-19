import {Groupe} from './groupe.interface';

export interface Utilisateur {
    _id: any;
    fullname: string;
    username?: string;
    mail?: string;
    phone?: string;
    avatar?: string;
    statut?: 'ACTIF' | 'INACTIF' | 'BLOQUE';
    pass?: string;
    actif?: boolean;
    reset?: boolean;
    lastLogin?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    groupes?: Groupe[];
    fcmTokens?: string[];
    verified?: boolean;
    notes?: { texte: string; date: Date; auteur?: string }[];

    /** Évaluations reçues des techniciens (sens PROFESSIONNEL -> CLIENT), agrégées côté backend. */
    averageRating?: number;
    ratingCount?: number;
}
