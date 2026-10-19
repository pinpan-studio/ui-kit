import {Categorie} from './categorie.interface';
import {Utilisateur} from './utilisateur.interface';
import {Valeur} from './valeur.interface';
import {Ville} from './ville.interface';


export interface Professionnel
{
    _id: any;
    utilisateur?: Utilisateur;
    createdAt?: Date | string;
    nom?: string;
    prenoms?: string;
    dateNaissance?: Date | string;
    qualification?: 'CAP' | 'BT' | 'BTS' | 'INGENIEUR' | 'FORMATION_PAR_APPRENTISSAGE';
    maitreApprentissage?: { nom: string; telephone: string };
    competenceSpecifique?: 'CONCEPTION_INSTALLATION' | 'MAINTENANCE';
    domaines: Categorie[];
    competences: Valeur[];
    localisations: Ville[];
    commentaire: string;
    actif: boolean;
    integration?: {
        status: string;
        history: { status: string; date: Date | string; adminNotes?: string; utilisateur?: string }[];
        adminNotes?: string;
        notesRH?: string;
        entretiens?: {
            date: Date | string;
            recruteur: string;
            mode?: string;
            lieu?: string;
            instructions?: string;
            resultatTechnique?: string;
            savoirEtre?: string;
            appreciationGenerale?: string;
            commentaire?: string;
            decision?: 'REUSSI' | 'ECHEC';
            compteRendu?: string;
            evaluation?: string;
            scoreGlobal?: number;
            decisionFinale?: string;
        }[];
        documents?: {
            nom: string;
            status: string;
            motifRejet?: string;
            fichier?: any;
        }[];
        validation?: {
            controleDiplomes: boolean;
            controleReferences: boolean;
            appelMaitreApprentissage?: boolean;
            validationDirection: boolean;
            decision?: 'ACCEPTEE' | 'REFUSEE';
            commentaire?: string;
            date?: Date | string;
            utilisateur?: string;
        };
        contrat?: {
            genere: boolean;
            genereLe?: Date | string;
            fichier?: any;
            signe: boolean;
            signeLe?: Date | string;
            fichierSigne?: any;
        };
    };
    averageRating?: number;
    totalRevenue?: number;
    completionRate?: number;
}

export interface ProfessionnelStats {
    professionnel: string;
    totalRevenue: number;
    completionRate: number;
    averageRating: number;
    ratingCount: number;
    commandes: {
        recues: number;
        terminees: number;
        annulees: number;
        enCours: number;
    };
    tauxAcceptation: number | null;
}