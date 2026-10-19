import {Store} from './store.interface';
import {Diagnostic} from './diagnostic.interface';

export interface StoreQuoteItem {
    nom: string;
    quantite: number;
    prixUnitaire: number;
    disponible: boolean;
}

export interface StoreQuote {
    _id?: string;
    store: Store;
    diagnostic: Diagnostic;
    items: StoreQuoteItem[];
    total: number;
    delai: string;
    disponibilite?: string;
    commentaire?: string;
    statut: string; // 'SOUMIS' | 'REFUSE' | 'VALIDE' | 'BROUILLON' | 'ENVOYE' | 'RECU' | 'EN_ETUDE' | 'ACCEPTE' | 'ANNULE' | 'EXPIRE'
    createdAt?: Date;
    updatedAt?: Date;
}

export interface StoreQuoteStatusUiConfig {
    label: string;
    pillClass: string;
}

export const STORE_QUOTE_STATUS_CONFIG: Record<string, StoreQuoteStatusUiConfig> = {
    SOUMIS:    { label: 'Soumis',   pillClass: 'statut-orange' },
    ENVOYE:    { label: 'Envoyé',   pillClass: 'statut-orange' },
    RECU:      { label: 'Reçu',     pillClass: 'statut-orange' },
    EN_ETUDE:  { label: 'En étude', pillClass: 'statut-orange' },
    VALIDE:    { label: 'Validé',   pillClass: 'statut-green' },
    ACCEPTE:   { label: 'Accepté',  pillClass: 'statut-green' },
    REFUSE:    { label: 'Refusé',   pillClass: 'statut-red' },
    ANNULE:    { label: 'Annulé',   pillClass: 'statut-grey' },
    EXPIRE:    { label: 'Expiré',   pillClass: 'statut-grey' },
    BROUILLON: { label: 'Brouillon', pillClass: 'statut-grey' },
};

export function getStoreQuoteStatusConfig(statut?: string): StoreQuoteStatusUiConfig {
    return STORE_QUOTE_STATUS_CONFIG[statut || ''] || { label: statut || '—', pillClass: 'statut-grey' };
}
