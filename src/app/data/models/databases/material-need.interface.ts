import {Commande} from './commande.interface';
import {Professionnel} from './professionnel.interface';

export interface MaterialNeedItem {
    nom: string;
    quantite: number;
}

export interface MaterialNeed {
    _id?: string;
    commande: Commande;
    professionnel: Professionnel;
    adresseChantier?: string;
    latitude?: number;
    longitude?: number;
    urgence: string; // 'FAIBLE' | 'MOYEN' | 'URGENT' | 'CRITIQUE'
    commentaire?: string;
    statut: string; // 'OUVERT' | 'CLOTURE'
    items: MaterialNeedItem[];
    selectedQuote?: any;
    createdAt?: Date;
    updatedAt?: Date;
}
